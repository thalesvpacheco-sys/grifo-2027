'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import QRCode from 'qrcode';
import { db, now } from '@/lib/db';
import { audit, createSession, destroySession, getSession, requireUser } from '@/lib/auth/session';
import { DUMMY_HASH, hashPassword, newTotpSecret, passwordProblems, verifyPassword, verifyTotp } from '@/lib/security/crypto';
import { ipHash, rateLimit, resetRateLimit } from '@/lib/security/request';
import * as repo from '@/lib/cms/repo';
import { getDocType, publicPath } from '@/lib/cms/schema';
import { requiredMissing } from '@/lib/cms/validate';
import { deleteMedia } from '@/lib/media';
import { forwardToCrm } from '@/lib/leads/service';

export type ActionResult = { ok: boolean; error?: string; message?: string; [k: string]: unknown };

/* ═════════════ Autenticação ═════════════ */

const LOCK_AFTER = 8;
const LOCK_MS = 15 * 60_000;

export async function loginAction(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const email = String(fd.get('email') || '').trim().toLowerCase().slice(0, 160);
  const password = String(fd.get('password') || '').slice(0, 200);
  const ip = await ipHash();
  // Limites: por IP (20/15min) e por conta (8/15min).
  const byIp = rateLimit(`login:ip:${ip}`, 20, 15 * 60_000);
  const byAcc = rateLimit(`login:acc:${email}`, LOCK_AFTER, 15 * 60_000);
  if (!byIp.ok || !byAcc.ok) return { ok: false, email, error: `Muitas tentativas. Tente novamente em ${Math.ceil(Math.max(byIp.retryAfter, byAcc.retryAfter) / 60)} minuto(s).` };

  const u = db().prepare('SELECT id, password_hash, active, locked_until, totp_enabled, failed_attempts FROM users WHERE email = ?').get(email) as
    | { id: number; password_hash: string; active: number; locked_until: number | null; totp_enabled: number; failed_attempts: number }
    | undefined;
  // Sempre executa a verificação (tempo constante, sem revelar se o e-mail existe).
  const valid = verifyPassword(password, u?.password_hash ?? DUMMY_HASH);
  const generic = { ok: false, error: 'E-mail ou senha incorretos.', email };
  if (!u || !u.active) return generic;
  if (u.locked_until && u.locked_until > now()) return { ok: false, error: 'Conta bloqueada temporariamente por excesso de tentativas. Aguarde 15 minutos.' };
  if (!valid) {
    const fails = u.failed_attempts + 1;
    db().prepare('UPDATE users SET failed_attempts = ?, locked_until = ? WHERE id = ?').run(fails, fails >= LOCK_AFTER ? now() + LOCK_MS : null, u.id);
    await audit(u.id, 'auth.login_falhou');
    return generic;
  }
  db().prepare('UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?').run(u.id);
  resetRateLimit(`login:acc:${email}`);
  await createSession(u.id, !!u.totp_enabled);
  if (u.totp_enabled) redirect('/admin/login/2fa');
  db().prepare('UPDATE users SET last_login_at = ? WHERE id = ?').run(now(), u.id);
  await audit(u.id, 'auth.login');
  redirect('/admin');
}

export async function verify2faAction(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const s = await getSession();
  if (!s) redirect('/admin/login');
  const lim = rateLimit(`2fa:${s.id}`, 6, 10 * 60_000);
  if (!lim.ok) {
    await destroySession();
    return { ok: false, error: 'Muitas tentativas. Entre novamente.' };
  }
  const u = db().prepare('SELECT totp_secret FROM users WHERE id = ?').get(s.id) as { totp_secret: string | null };
  if (!u.totp_secret || !verifyTotp(u.totp_secret, String(fd.get('code') || ''))) {
    await audit(s.id, 'auth.2fa_falhou');
    return { ok: false, error: 'Código inválido. Confira o horário do seu celular e tente de novo.' };
  }
  db().prepare('UPDATE sessions SET mfa_pending = 0 WHERE id = ?').run(s.sessionId);
  db().prepare('UPDATE users SET last_login_at = ? WHERE id = ?').run(now(), s.id);
  resetRateLimit(`2fa:${s.id}`);
  await audit(s.id, 'auth.login', undefined, '2FA');
  redirect('/admin');
}

export async function logoutAction() {
  const s = await getSession();
  if (s) await audit(s.id, 'auth.logout');
  await destroySession();
  redirect('/admin/login');
}

/* ═════════════ Conteúdo ═════════════ */

export async function createDocAction(type: string, title: string): Promise<ActionResult> {
  const u = await requireUser();
  const dt = getDocType(type);
  if (!dt || dt.singleton) return { ok: false, error: 'Tipo de conteúdo inválido.' };
  if (dt.type === 'settings' || dt.type === 'redirect') if (u.role !== 'admin') return { ok: false, error: 'Apenas administradores.' };
  const t = title.trim();
  if (t.length < 2) return { ok: false, error: 'Informe um título com pelo menos 2 caracteres.' };
  const id = repo.createDoc(type, t, u.id);
  await audit(u.id, 'doc.criar', `${type}:${id}`, t);
  return { ok: true, id };
}

const saveSchema = z.object({
  id: z.number().int().positive(),
  data: z.record(z.string(), z.unknown()),
  seo: z.record(z.string(), z.unknown()).optional(),
  slug: z.string().max(120).optional(),
  placeholder: z.boolean().optional(),
});

function guardType(type: string, role: string): string | null {
  if ((type === 'settings' || type === 'redirect') && role !== 'admin') return 'Apenas administradores podem alterar esta área.';
  return null;
}

export async function saveDocAction(input: z.infer<typeof saveSchema>, publish = false): Promise<ActionResult> {
  const u = await requireUser();
  const p = saveSchema.safeParse(input);
  if (!p.success) return { ok: false, error: 'Dados inválidos.' };
  const cur = repo.getById(p.data.id);
  if (!cur) return { ok: false, error: 'Documento não encontrado.' };
  const g = guardType(cur.type, u.role);
  if (g) return { ok: false, error: g };
  if (JSON.stringify(p.data.data).length > 400_000) return { ok: false, error: 'Conteúdo grande demais.' };
  const doc = repo.saveDraft(p.data.id, p.data, u.id);
  await audit(u.id, 'doc.salvar', `${doc.type}:${doc.id}`, doc.title);
  if (publish) {
    const miss = requiredMissing(getDocType(doc.type)!.fields, doc.draft);
    if (miss.length) return { ok: false, error: `Rascunho salvo, mas não publicado. Preencha: ${miss.join(', ')}.`, doc };
    repo.publishDoc(doc.id, u.id);
    await audit(u.id, 'doc.publicar', `${doc.type}:${doc.id}`, doc.title);
    return { ok: true, message: 'Publicado. As alterações já estão no site.', doc: repo.getById(doc.id) };
  }
  return { ok: true, message: 'Rascunho salvo.', doc };
}

export async function docOpAction(id: number, op: 'unpublish' | 'discard' | 'delete'): Promise<ActionResult> {
  const u = await requireUser();
  const cur = repo.getById(id);
  if (!cur) return { ok: false, error: 'Documento não encontrado.' };
  const g = guardType(cur.type, u.role);
  if (g) return { ok: false, error: g };
  try {
    if (op === 'unpublish') repo.unpublishDoc(id, u.id);
    if (op === 'discard') repo.discardDraft(id, u.id);
    if (op === 'delete') {
      if (u.role !== 'admin' && cur.published) return { ok: false, error: 'Somente administradores excluem conteúdo publicado. Despublique antes ou peça a um administrador.' };
      repo.deleteDoc(id);
    }
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  await audit(u.id, `doc.${op}`, `${cur.type}:${id}`, cur.title);
  return { ok: true, doc: op === 'delete' ? null : repo.getById(id) };
}

export async function restoreRevisionAction(docId: number, revId: number): Promise<ActionResult> {
  const u = await requireUser();
  const cur = repo.getById(docId);
  if (!cur) return { ok: false, error: 'Documento não encontrado.' };
  const g = guardType(cur.type, u.role);
  if (g) return { ok: false, error: g };
  const doc = repo.restoreRevision(docId, revId, u.id);
  await audit(u.id, 'doc.restaurar', `${doc.type}:${docId}`, `rev ${revId}`);
  return { ok: true, doc, message: 'Versão restaurada como rascunho. Revise e publique.' };
}

export async function previewUrlAction(id: number): Promise<string> {
  await requireUser();
  const d = repo.getById(id);
  const p = d ? publicPath(d.type, d.slug) : null;
  return `/api/preview?path=${encodeURIComponent(p || '/')}`;
}

/* ═════════════ Mídia ═════════════ */

export async function updateMediaAltAction(id: number, alt: string): Promise<ActionResult> {
  const u = await requireUser();
  db().prepare('UPDATE media SET alt = ? WHERE id = ?').run(alt.slice(0, 300), id);
  await audit(u.id, 'media.alt', `media:${id}`);
  return { ok: true };
}

export async function deleteMediaAction(id: number): Promise<ActionResult> {
  const u = await requireUser();
  const m = db().prepare('SELECT file FROM media WHERE id = ?').get(id) as { file: string } | undefined;
  if (!m) return { ok: false, error: 'Arquivo não encontrado.' };
  const used = db().prepare('SELECT title FROM documents WHERE draft LIKE ? OR published LIKE ? LIMIT 3').all(`%/media/${m.file}%`, `%/media/${m.file}%`) as { title: string }[];
  if (used.length) return { ok: false, error: `Arquivo em uso em: ${used.map((x) => x.title).join(', ')}. Remova antes de excluir.` };
  deleteMedia(id);
  await audit(u.id, 'media.excluir', `media:${id}`);
  return { ok: true };
}

/* ═════════════ Leads ═════════════ */

const LEAD_STATUS = ['novo', 'em_atendimento', 'qualificado', 'convertido', 'descartado'] as const;

export async function updateLeadAction(id: number, status: string, notes: string): Promise<ActionResult> {
  const u = await requireUser();
  if (!LEAD_STATUS.includes(status as (typeof LEAD_STATUS)[number])) return { ok: false, error: 'Status inválido.' };
  db().prepare('UPDATE leads SET status = ?, notes = ? WHERE id = ?').run(status, notes.slice(0, 5000), id);
  await audit(u.id, 'lead.atualizar', `lead:${id}`, status);
  return { ok: true, message: 'Lead atualizado.' };
}

export async function resendLeadAction(id: number): Promise<ActionResult> {
  const u = await requireUser();
  const r = await forwardToCrm(id);
  await audit(u.id, 'lead.reenviar_crm', `lead:${id}`, r);
  return r === 'enviado' ? { ok: true, message: 'Lead reenviado ao CRM.' } : { ok: false, error: r === 'desativado' ? 'Integração com CRM não configurada (CRM_WEBHOOK_URL).' : 'O CRM não aceitou o envio. Veja a resposta registrada.' };
}

export async function deleteLeadAction(id: number): Promise<ActionResult> {
  const u = await requireUser('admin');
  db().prepare('DELETE FROM leads WHERE id = ?').run(id);
  await audit(u.id, 'lead.excluir', `lead:${id}`, 'Solicitação do titular / LGPD');
  redirect('/admin/leads?excluido=1');
}

/* ═════════════ Usuários e conta ═════════════ */

export async function createUserAction(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const u = await requireUser('admin');
  const email = String(fd.get('email') || '').trim().toLowerCase();
  const name = String(fd.get('name') || '').trim().slice(0, 120);
  const role = fd.get('role') === 'admin' ? 'admin' : 'editor';
  const password = String(fd.get('password') || '');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'E-mail inválido.' };
  if (name.length < 2) return { ok: false, error: 'Informe o nome.' };
  const probs = passwordProblems(password, email);
  if (probs.length) return { ok: false, error: `Senha precisa de: ${probs.join(', ')}.` };
  if (db().prepare('SELECT 1 FROM users WHERE email = ?').get(email)) return { ok: false, error: 'Já existe um usuário com este e-mail.' };
  db().prepare('INSERT INTO users (email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)').run(email, name, hashPassword(password), role, now());
  await audit(u.id, 'user.criar', email, role);
  return { ok: true, message: `Usuário ${name} criado. Compartilhe a senha temporária por um canal seguro.` };
}

export async function updateUserAction(id: number, op: 'toggle' | 'role' | 'unlock' | 'reset2fa'): Promise<ActionResult> {
  const u = await requireUser('admin');
  if (id === u.id && (op === 'toggle' || op === 'role')) return { ok: false, error: 'Você não pode desativar ou rebaixar a própria conta.' };
  const t = db().prepare('SELECT active, role, email FROM users WHERE id = ?').get(id) as { active: number; role: string; email: string } | undefined;
  if (!t) return { ok: false, error: 'Usuário não encontrado.' };
  if (op === 'toggle') {
    db().prepare('UPDATE users SET active = ? WHERE id = ?').run(t.active ? 0 : 1, id);
    if (t.active) db().prepare('DELETE FROM sessions WHERE user_id = ?').run(id);
  }
  if (op === 'role') db().prepare('UPDATE users SET role = ? WHERE id = ?').run(t.role === 'admin' ? 'editor' : 'admin', id);
  if (op === 'unlock') db().prepare('UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?').run(id);
  if (op === 'reset2fa') db().prepare('UPDATE users SET totp_enabled = 0, totp_secret = NULL WHERE id = ?').run(id);
  await audit(u.id, `user.${op}`, t.email);
  return { ok: true };
}

export async function changePasswordAction(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const u = await requireUser();
  const current = String(fd.get('current') || '');
  const next = String(fd.get('next') || '');
  const confirm = String(fd.get('confirm') || '');
  if (!rateLimit(`pwchange:${u.id}`, 5, 15 * 60_000).ok) return { ok: false, error: 'Muitas tentativas. Aguarde 15 minutos.' };
  const row = db().prepare('SELECT password_hash FROM users WHERE id = ?').get(u.id) as { password_hash: string };
  if (!verifyPassword(current, row.password_hash)) return { ok: false, error: 'Senha atual incorreta.' };
  if (next !== confirm) return { ok: false, error: 'A confirmação não confere com a nova senha.' };
  const probs = passwordProblems(next, u.email);
  if (probs.length) return { ok: false, error: `A nova senha precisa de: ${probs.join(', ')}.` };
  db().prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(next), u.id);
  // Encerra as outras sessões após troca de senha.
  db().prepare('DELETE FROM sessions WHERE user_id = ? AND id != ?').run(u.id, u.sessionId);
  await audit(u.id, 'user.senha');
  return { ok: true, message: 'Senha alterada. Outras sessões foram encerradas.' };
}

export async function start2faAction(): Promise<ActionResult> {
  const u = await requireUser();
  const secret = newTotpSecret();
  db().prepare('UPDATE users SET totp_secret = ?, totp_enabled = 0 WHERE id = ?').run(secret, u.id);
  const uri = `otpauth://totp/Grifo%20Painel:${encodeURIComponent(u.email)}?secret=${secret}&issuer=Grifo%20Painel&digits=6&period=30`;
  const qr = await QRCode.toDataURL(uri, { margin: 1, width: 220, color: { dark: '#202020', light: '#ffffff' } });
  return { ok: true, secret, qr };
}

export async function confirm2faAction(code: string): Promise<ActionResult> {
  const u = await requireUser();
  const row = db().prepare('SELECT totp_secret FROM users WHERE id = ?').get(u.id) as { totp_secret: string | null };
  if (!row.totp_secret || !verifyTotp(row.totp_secret, code)) return { ok: false, error: 'Código inválido. Tente o código atual do aplicativo.' };
  db().prepare('UPDATE users SET totp_enabled = 1 WHERE id = ?').run(u.id);
  await audit(u.id, 'user.2fa_ativado');
  return { ok: true, message: 'Autenticação em dois fatores ativada.' };
}

export async function disable2faAction(fd: FormData): Promise<void> {
  const u = await requireUser();
  const row = db().prepare('SELECT password_hash FROM users WHERE id = ?').get(u.id) as { password_hash: string };
  if (!verifyPassword(String(fd.get('password') || ''), row.password_hash)) redirect('/admin/conta?erro=senha');
  db().prepare('UPDATE users SET totp_enabled = 0, totp_secret = NULL WHERE id = ?').run(u.id);
  await audit(u.id, 'user.2fa_desativado');
  redirect('/admin/conta?ok=2fa-off');
}

export async function revokeOtherSessionsAction(): Promise<void> {
  const u = await requireUser();
  db().prepare('DELETE FROM sessions WHERE user_id = ? AND id != ?').run(u.id, u.sessionId);
  await audit(u.id, 'user.sessoes_encerradas');
  redirect('/admin/conta?ok=sessoes');
}

export async function renderMarkdownAction(md: string): Promise<string> {
  await requireUser();
  const { renderMarkdown } = await import('@/lib/markdown');
  return renderMarkdown(md.slice(0, 120_000));
}
