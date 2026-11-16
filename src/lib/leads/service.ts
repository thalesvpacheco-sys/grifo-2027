import 'server-only';
import nodemailer from 'nodemailer';
import { db, now } from '../db';
import { env } from '../env';
import { hmac, safeEqual } from '../security/crypto';
import { getSettingsSync } from '../cms/content';
import { SEGMENTS, DEMANDS, type LeadInput } from './schema';

/* ───────── Token de formulário: carimbo de tempo assinado (anti-bot e anti-replay simples) ───────── */
export function issueFormToken(): string {
  const ts = Date.now().toString(36);
  return `${ts}.${hmac(env.appSecret, `form:${ts}`)}`;
}

export function checkFormToken(token: string): 'ok' | 'invalid' | 'too_fast' | 'expired' {
  const [ts, sig] = token.split('.');
  if (!ts || !sig || !safeEqual(sig, hmac(env.appSecret, `form:${ts}`))) return 'invalid';
  const age = Date.now() - parseInt(ts, 36);
  if (age < 2500) return 'too_fast'; // humanos levam mais que 2,5s para preencher
  if (age > 6 * 3600_000) return 'expired';
  return 'ok';
}

/* ───────── Persistência + integrações ───────── */
export type LeadRow = {
  id: number;
  name: string;
  company: string;
  email: string;
  whatsapp: string;
  segment: string;
  demand: string;
  message: string | null;
  form: string;
  extra: string;
  consent_at: number;
  consent_version: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  landing_page: string | null;
  referrer: string | null;
  page: string | null;
  status: string;
  notes: string;
  crm_status: string;
  crm_response: string | null;
  notified: number;
  created_at: number;
};

export function saveLead(input: LeadInput, ipHash: string): number {
  const s = getSettingsSync();
  const a = input.attribution ?? {};
  const r = db()
    .prepare(
      `INSERT INTO leads (name, company, email, whatsapp, segment, demand, message, form, extra, consent_at, consent_version,
        utm_source, utm_medium, utm_campaign, utm_content, utm_term, landing_page, referrer, page, ip_hash, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.name,
      input.company,
      input.email.toLowerCase(),
      input.whatsapp.replace(/\D/g, ''),
      input.segment,
      input.demand,
      input.message || null,
      input.form,
      JSON.stringify(Object.fromEntries(Object.entries(input.extra ?? {}).filter(([, v]) => v))),
      now(),
      s.privacyVersion,
      a.utm_source || null,
      a.utm_medium || null,
      a.utm_campaign || null,
      a.utm_content || null,
      a.utm_term || null,
      a.landing_page || null,
      a.referrer || null,
      input.page || null,
      ipHash,
      now(),
    );
  return Number(r.lastInsertRowid);
}

export function getLead(id: number): LeadRow | undefined {
  return db().prepare('SELECT * FROM leads WHERE id = ?').get(id) as LeadRow | undefined;
}

export function leadPayload(l: LeadRow) {
  return {
    id: l.id,
    created_at: new Date(l.created_at).toISOString(),
    name: l.name,
    company: l.company,
    email: l.email,
    whatsapp: l.whatsapp,
    segment: l.segment,
    demand: l.demand,
    message: l.message,
    form: l.form,
    extra: JSON.parse(l.extra || '{}'),
    consent: { at: new Date(l.consent_at).toISOString(), policy_version: l.consent_version },
    attribution: {
      utm_source: l.utm_source,
      utm_medium: l.utm_medium,
      utm_campaign: l.utm_campaign,
      utm_content: l.utm_content,
      utm_term: l.utm_term,
      landing_page: l.landing_page,
      referrer: l.referrer,
      page: l.page,
    },
  };
}

/** Envia ao CRM/endpoint configurável. Corpo assinado com HMAC-SHA256 em X-Grifo-Signature. */
export async function forwardToCrm(id: number): Promise<'enviado' | 'falhou' | 'desativado'> {
  if (!env.crmWebhookUrl) {
    db().prepare("UPDATE leads SET crm_status = 'desativado' WHERE id = ?").run(id);
    return 'desativado';
  }
  const lead = getLead(id);
  if (!lead) return 'falhou';
  const body = JSON.stringify({ event: 'lead.created', lead: leadPayload(lead) });
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(env.crmWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'GrifoSite/1.0',
        ...(env.crmWebhookSecret ? { 'X-Grifo-Signature': `sha256=${hmac(env.crmWebhookSecret, body)}` } : {}),
      },
      body,
      signal: ctrl.signal,
    });
    const text = (await res.text().catch(() => '')).slice(0, 500);
    const status = res.ok ? 'enviado' : 'falhou';
    db().prepare('UPDATE leads SET crm_status = ?, crm_response = ? WHERE id = ?').run(status, `${res.status} ${text}`, id);
    return status;
  } catch (e) {
    db().prepare("UPDATE leads SET crm_status = 'falhou', crm_response = ? WHERE id = ?").run(String((e as Error).message).slice(0, 300), id);
    return 'falhou';
  } finally {
    clearTimeout(timer);
  }
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Aviso interno por e-mail, roteado pelo segmento (Configurações → Roteamento de leads). */
export async function notifyTeam(id: number): Promise<boolean> {
  const lead = getLead(id);
  if (!lead || !env.smtp.host) return false;
  const s = getSettingsSync();
  const rule = s.leadRouting.find((r) => r.segment === lead.segment) ?? s.leadRouting.find((r) => r.segment === 'outros');
  const to = (rule?.emails || s.contact.email || '')
    .split(',')
    .map((x) => x.trim())
    .filter((x) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x));
  if (!to.length) return false;
  const seg = SEGMENTS.find((x) => x.value === lead.segment)?.label ?? lead.segment;
  const dem = DEMANDS.find((x) => x.value === lead.demand)?.label ?? lead.demand;
  try {
    const t = nodemailer.createTransport({ host: env.smtp.host, port: env.smtp.port, secure: env.smtp.port === 465, auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined });
    await t.sendMail({
      from: env.smtp.from,
      to,
      subject: `Novo lead (${seg} · ${dem}): ${lead.company}`,
      text: `Novo lead #${lead.id}\n\n${lead.name} — ${lead.company}\nSegmento: ${seg}\nDemanda: ${dem}\nPágina: ${lead.page ?? ''}\n\nVeja os dados completos no painel: ${env.siteUrl}/admin/leads/${lead.id}`,
      html: `<p><strong>Novo lead #${lead.id}</strong></p><p>${esc(lead.name)} — ${esc(lead.company)}<br>Segmento: ${esc(seg)}<br>Demanda: ${esc(dem)}<br>Página: ${esc(lead.page ?? '')}</p><p><a href="${env.siteUrl}/admin/leads/${lead.id}">Abrir no painel</a></p>`,
    });
    db().prepare('UPDATE leads SET notified = 1 WHERE id = ?').run(id);
    return true;
  } catch (e) {
    console.error('[grifo] Falha no aviso por e-mail:', (e as Error).message);
    return false;
  }
}

/** Retenção LGPD: remove leads mais antigos que o prazo configurado. */
export function purgeExpiredLeads(): number {
  const months = getSettingsSync().retentionMonths || 24;
  const cutoff = Date.now() - months * 30 * 24 * 3600_000;
  const r = db().prepare('DELETE FROM leads WHERE created_at < ?').run(cutoff);
  db().prepare("INSERT INTO meta (key, value) VALUES ('last_purge', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(String(Date.now()));
  return Number(r.changes);
}

export function purgeIfDue() {
  const row = db().prepare("SELECT value FROM meta WHERE key = 'last_purge'").get() as { value: string } | undefined;
  if (!row || Date.now() - Number(row.value) > 24 * 3600_000) purgeExpiredLeads();
}
