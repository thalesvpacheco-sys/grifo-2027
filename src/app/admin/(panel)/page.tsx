import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { countsByType, recentDocs } from '@/lib/cms/repo';
import { DOC_TYPES, getDocType } from '@/lib/cms/schema';
import { getSettingsSync } from '@/lib/cms/content';
import { purgeIfDue } from '@/lib/leads/service';
import { SEGMENTS } from '@/lib/leads/schema';
import { Badge, Card, PageTitle, fmtDateTime } from '@/components/admin/ui';

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const u = await requireUser();
  purgeIfDue();
  const sp = await searchParams;
  const since = Date.now() - 30 * 24 * 3600_000;
  const leads30 = (db().prepare('SELECT COUNT(*) c FROM leads WHERE created_at > ?').get(since) as { c: number }).c;
  const leadsNew = (db().prepare("SELECT COUNT(*) c FROM leads WHERE status = 'novo'").get() as { c: number }).c;
  const crmFail = (db().prepare("SELECT COUNT(*) c FROM leads WHERE crm_status = 'falhou'").get() as { c: number }).c;
  const bySeg = db().prepare('SELECT segment, COUNT(*) c FROM leads WHERE created_at > ? GROUP BY segment').all(since) as { segment: string; c: number }[];
  const recentLeads = db().prepare('SELECT id, name, company, segment, status, created_at FROM leads ORDER BY created_at DESC LIMIT 6').all() as { id: number; name: string; company: string; segment: string; status: string; created_at: number }[];
  const counts = countsByType();
  const pending = Object.values(counts).reduce((a, c) => a + c.pending, 0);
  const placeholders = Object.entries(counts).filter(([t]) => !['settings'].includes(t)).reduce((a, [, c]) => a + c.placeholders, 0);
  const s = getSettingsSync();
  const max = Math.max(1, ...bySeg.map((x) => x.c));

  const checks = [
    { ok: !!(s.contact.email || s.contact.phone), label: 'Contatos oficiais cadastrados', href: '/admin/conteudo/settings' },
    { ok: !!s.contact.whatsapp, label: 'WhatsApp comercial configurado', href: '/admin/conteudo/settings' },
    { ok: !!(s.legal.company && s.legal.cnpj), label: 'Dados jurídicos (razão social e CNPJ)', href: '/admin/conteudo/settings' },
    { ok: !!s.legal.dpo, label: 'Encarregado de dados (DPO) informado', href: '/admin/conteudo/settings' },
    { ok: placeholders === 0, label: `Conteúdos pendentes de validação (${placeholders})`, href: '/admin/conteudo/case' },
    { ok: !!env.crmWebhookUrl, label: 'Integração com CRM (CRM_WEBHOOK_URL)', href: null },
    { ok: !!env.smtp.host, label: 'Aviso interno por e-mail (SMTP)', href: null },
    { ok: !!s.gtmId, label: 'Google Tag Manager configurado', href: '/admin/conteudo/settings' },
    { ok: !env.showPlaceholders || !env.isProd, label: 'Placeholders ocultos em produção', href: null },
  ];

  return (
    <>
      {sp.erro === 'permissao' && <p role="alert" className="mb-6 rounded-xl bg-[#fbeaea] px-4 py-3 text-sm font-medium text-vinho">Essa área é restrita a administradores.</p>}
      <PageTitle title={`Olá, ${u.name.split(' ')[0]}.`} desc="Resumo do site, dos contatos recebidos e do que falta antes da publicação." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { n: leadsNew, l: 'leads novos', href: '/admin/leads?status=novo' },
          { n: leads30, l: 'leads nos últimos 30 dias', href: '/admin/leads' },
          { n: pending, l: 'alterações não publicadas', href: '#recentes' },
          { n: crmFail, l: 'envios ao CRM com falha', href: '/admin/leads?crm=falhou' },
        ].map((k) => (
          <Link key={k.l} href={k.href} className="rounded-2xl bg-white p-5 ring-1 ring-grafite/[.08] transition-shadow hover:ring-grafite/30">
            <p className="font-display text-4xl font-bold tabular-nums">{k.n}</p>
            <p className="mt-1 text-sm text-grafite/60">{k.l}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <Card title="Leads por segmento (30 dias)" className="lg:col-span-5">
          <ul className="space-y-3">
            {SEGMENTS.map((sg) => {
              const c = bySeg.find((x) => x.segment === sg.value)?.c ?? 0;
              return (
                <li key={sg.value}>
                  <div className="flex justify-between text-sm"><span>{sg.label}</span><span className="font-semibold tabular-nums">{c}</span></div>
                  <div className="mt-1 h-2 rounded-full bg-grafite/[.06]"><div className="h-2 rounded-full bg-vinho" style={{ width: `${(c / max) * 100}%` }} /></div>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card title="Últimos leads" className="lg:col-span-7" action={<Link href="/admin/leads" className="text-sm font-semibold text-vinho">Ver todos</Link>}>
          {recentLeads.length ? (
            <ul className="divide-y divide-grafite/[.06]">
              {recentLeads.map((l) => (
                <li key={l.id}>
                  <Link href={`/admin/leads/${l.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:text-vinho">
                    <span className="min-w-0"><span className="block truncate font-semibold">{l.name}</span><span className="block truncate text-sm text-grafite/55">{l.company} · {SEGMENTS.find((x) => x.value === l.segment)?.label}</span></span>
                    <span className="shrink-0 text-right"><Badge status={l.status} /><span className="block text-xs text-grafite/50">{fmtDateTime(l.created_at)}</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-grafite/60">Nenhum lead ainda. Os envios dos formulários aparecem aqui.</p>
          )}
        </Card>

        <Card title="Pronto para publicar?" className="lg:col-span-5">
          <ul className="space-y-2.5">
            {checks.map((c) => (
              <li key={c.label} className="flex items-start gap-3 text-sm">
                <span aria-hidden="true" className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${c.ok ? 'bg-[#e7f4ec] text-[#1f6b43]' : 'bg-[#fff3dc] text-[#8a5a00]'}`}>{c.ok ? '✓' : '!'}</span>
                <span className="sr-only">{c.ok ? 'Concluído:' : 'Pendente:'}</span>
                {c.href && !c.ok ? <Link href={c.href} className="underline decoration-grafite/30 underline-offset-2 hover:text-vinho">{c.label}</Link> : <span className={c.ok ? 'text-grafite/60' : ''}>{c.label}</span>}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-grafite/50">Itens sem link são configurados nas variáveis de ambiente do servidor (veja o README).</p>
        </Card>

        <Card title="Editados recentemente" className="lg:col-span-7" action={<span id="recentes" />}>
          <ul className="divide-y divide-grafite/[.06]">
            {recentDocs(8).map((d) => (
              <li key={d.id}>
                <Link href={`/admin/conteudo/${d.type}/${d.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:text-vinho">
                  <span className="min-w-0"><span className="block truncate font-semibold">{d.title}</span><span className="block text-sm text-grafite/55">{getDocType(d.type)?.label}{d.updatedBy ? ` · ${d.updatedBy}` : ''}</span></span>
                  <span className="shrink-0 text-right"><Badge status={d.status} /><span className="block text-xs text-grafite/50">{fmtDateTime(d.updatedAt)}</span></span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Atalhos" className="mt-6">
        <div className="flex flex-wrap gap-2">
          <Link className="btn btn-vinho min-h-[40px] px-4 text-sm" href="/admin/conteudo/article?novo=1">Novo artigo</Link>
          <Link className="btn btn-ghost-light min-h-[40px] px-4 text-sm" href="/admin/conteudo/case?novo=1">Novo case</Link>
          <Link className="btn btn-ghost-light min-h-[40px] px-4 text-sm" href="/admin/midia">Enviar imagens</Link>
          <Link className="btn btn-ghost-light min-h-[40px] px-4 text-sm" href={`/admin/conteudo/${DOC_TYPES[0].type}`}>Editar Home</Link>
        </div>
      </Card>
    </>
  );
}
