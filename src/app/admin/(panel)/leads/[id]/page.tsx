import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { getLead } from '@/lib/leads/service';
import { SEGMENTS, DEMANDS, ASSESSMENT_FIELDS } from '@/lib/leads/schema';
import { Badge, Card, PageTitle, fmtDateTime } from '@/components/admin/ui';
import { LeadActions } from '@/components/admin/LeadActions';

export default async function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const u = await requireUser();
  const { id } = await params;
  const l = getLead(Number(id));
  if (!l) notFound();
  const extra = JSON.parse(l.extra || '{}') as Record<string, string>;
  const wa = l.whatsapp.replace(/\D/g, '');
  const row = (k: string, v?: string | null) => (v ? <div className="grid grid-cols-[140px_1fr] gap-3 py-2"><dt className="text-grafite/55">{k}</dt><dd className="break-words">{v}</dd></div> : null);
  return (
    <>
      <nav className="mb-2 text-xs text-grafite/50"><Link href="/admin/leads" className="hover:text-vinho">Leads</Link> / #{l.id}</nav>
      <PageTitle title={l.name} desc={`${l.company} · recebido em ${fmtDateTime(l.created_at)}`} actions={<Badge status={l.status} />} />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card title="Contato">
            <dl className="divide-y divide-grafite/[.06] text-sm">
              {row('E-mail', l.email)}
              {row('WhatsApp', l.whatsapp)}
              {row('Segmento', SEGMENTS.find((s) => s.value === l.segment)?.label)}
              {row('Demanda', DEMANDS.find((s) => s.value === l.demand)?.label)}
              {row('Formulário', l.form)}
              {row('Mensagem', l.message)}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`mailto:${l.email}`} className="btn btn-vinho min-h-[40px] px-4 text-sm">Responder por e-mail</a>
              {wa.length >= 10 && <a href={`https://wa.me/${wa.length <= 11 ? '55' + wa : wa}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-light min-h-[40px] px-4 text-sm">Abrir WhatsApp</a>}
            </div>
          </Card>
          {Object.keys(extra).length > 0 && (
            <Card title="Dados do empreendimento (Assessment)">
              <dl className="divide-y divide-grafite/[.06] text-sm">{ASSESSMENT_FIELDS.map((f) => row(f.label, extra[f.name]))}</dl>
            </Card>
          )}
          <Card title="Origem e consentimento">
            <dl className="divide-y divide-grafite/[.06] text-sm">
              {row('utm_source', l.utm_source)}
              {row('utm_medium', l.utm_medium)}
              {row('utm_campaign', l.utm_campaign)}
              {row('utm_content', l.utm_content)}
              {row('utm_term', l.utm_term)}
              {row('Página de entrada', l.landing_page)}
              {row('Página do envio', l.page)}
              {row('Referência', l.referrer)}
              {row('Consentimento', `${fmtDateTime(l.consent_at)} · política v${l.consent_version}`)}
              {row('CRM', `${l.crm_status}${l.crm_response ? ` — ${l.crm_response}` : ''}`)}
              {row('Aviso interno', l.notified ? 'enviado por e-mail' : 'não enviado')}
            </dl>
          </Card>
        </div>
        <LeadActions id={l.id} status={l.status} notes={l.notes} isAdmin={u.role === 'admin'} />
      </div>
    </>
  );
}
