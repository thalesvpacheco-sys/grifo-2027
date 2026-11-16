import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { SEGMENTS, DEMANDS } from '@/lib/leads/schema';
import { Badge, Card, Empty, PageTitle, fmtDateTime } from '@/components/admin/ui';

const STATUSES = [
  { v: 'novo', l: 'Novo' },
  { v: 'em_atendimento', l: 'Em atendimento' },
  { v: 'qualificado', l: 'Qualificado' },
  { v: 'convertido', l: 'Convertido' },
  { v: 'descartado', l: 'Descartado' },
];

type SP = Promise<{ status?: string; segmento?: string; q?: string; crm?: string; excluido?: string; p?: string }>;

export default async function LeadsPage({ searchParams }: { searchParams: SP }) {
  const u = await requireUser();
  const sp = await searchParams;
  const where: string[] = [];
  const args: (string | number)[] = [];
  if (sp.status && STATUSES.some((s) => s.v === sp.status)) (where.push('status = ?'), args.push(sp.status));
  if (sp.segmento && SEGMENTS.some((s) => s.value === sp.segmento)) (where.push('segment = ?'), args.push(sp.segmento));
  if (sp.crm === 'falhou') where.push("crm_status = 'falhou'");
  if (sp.q) (where.push('(name LIKE ? OR company LIKE ? OR email LIKE ?)'), args.push(`%${sp.q}%`, `%${sp.q}%`, `%${sp.q}%`));
  const w = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const page = Math.max(1, Number(sp.p) || 1);
  const per = 30;
  const total = (db().prepare(`SELECT COUNT(*) c FROM leads ${w}`).get(...args) as { c: number }).c;
  const rows = db().prepare(`SELECT id, name, company, email, segment, demand, status, crm_status, utm_source, utm_campaign, created_at FROM leads ${w} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...args, per, (page - 1) * per) as {
    id: number; name: string; company: string; email: string; segment: string; demand: string; status: string; crm_status: string; utm_source: string | null; utm_campaign: string | null; created_at: number;
  }[];
  const qs = (o: Record<string, string | undefined>) => '?' + new URLSearchParams(Object.entries({ ...sp, ...o }).filter(([k, v]) => v && k !== 'excluido') as [string, string][]).toString();

  return (
    <>
      <PageTitle
        title="Leads"
        desc="Contatos recebidos pelos formulários, com consentimento LGPD e origem da campanha."
        actions={u.role === 'admin' && <a href={`/api/admin/leads/export${qs({ p: undefined })}`} className="btn btn-ghost-light min-h-[42px] px-4 text-sm">Exportar CSV</a>}
      />
      {sp.excluido && <p role="status" className="mb-4 rounded-xl bg-[#e7f4ec] px-4 py-3 text-sm font-medium text-[#1f6b43]">Lead excluído definitivamente.</p>}
      <Card>
        <form className="mb-5 grid gap-3 sm:grid-cols-4" role="search">
          <div>
            <label htmlFor="q" className="text-xs font-semibold text-grafite/60">Buscar</label>
            <input id="q" name="q" defaultValue={sp.q} placeholder="Nome, empresa ou e-mail" className="field py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="status" className="text-xs font-semibold text-grafite/60">Status</label>
            <select id="status" name="status" defaultValue={sp.status ?? ''} className="field field-select py-2 text-sm">
              <option value="">Todos</option>
              {STATUSES.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="segmento" className="text-xs font-semibold text-grafite/60">Segmento</label>
            <select id="segmento" name="segmento" defaultValue={sp.segmento ?? ''} className="field field-select py-2 text-sm">
              <option value="">Todos</option>
              {SEGMENTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" className="btn btn-vinho min-h-[42px] px-5 text-sm">Filtrar</button>
            <Link href="/admin/leads" className="px-2 py-2 text-sm font-semibold text-grafite/60">Limpar</Link>
          </div>
        </form>
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-grafite/50">
                <tr className="border-b border-grafite/10">
                  <th className="py-2.5 pr-3 font-semibold">Contato</th>
                  <th className="py-2.5 pr-3 font-semibold">Segmento / demanda</th>
                  <th className="py-2.5 pr-3 font-semibold">Origem</th>
                  <th className="py-2.5 pr-3 font-semibold">Status</th>
                  <th className="py-2.5 font-semibold">Recebido</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((l) => (
                  <tr key={l.id} className="border-b border-grafite/[.06] last:border-0">
                    <td className="py-3 pr-3"><Link href={`/admin/leads/${l.id}`} className="font-semibold hover:text-vinho">{l.name}</Link><span className="block text-xs text-grafite/55">{l.company} · {l.email}</span></td>
                    <td className="py-3 pr-3">{SEGMENTS.find((s) => s.value === l.segment)?.label}<span className="block text-xs text-grafite/55">{DEMANDS.find((d) => d.value === l.demand)?.label}</span></td>
                    <td className="py-3 pr-3 text-xs text-grafite/65">{l.utm_source || 'direto'}{l.utm_campaign ? ` / ${l.utm_campaign}` : ''}</td>
                    <td className="py-3 pr-3"><div className="flex flex-wrap gap-1"><Badge status={l.status} />{l.crm_status === 'falhou' && <Badge status="falhou">CRM falhou</Badge>}</div></td>
                    <td className="py-3 text-grafite/60">{fmtDateTime(l.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="Nenhum lead encontrado." text="Os envios dos formulários do site aparecem aqui assim que são registrados." />
        )}
        {total > per && (
          <nav aria-label="Paginação" className="mt-5 flex items-center justify-between text-sm">
            <span className="text-grafite/55">{total} leads</span>
            <div className="flex gap-2">
              {page > 1 && <Link href={`/admin/leads${qs({ p: String(page - 1) })}`} className="rounded-full px-4 py-1.5 ring-1 ring-grafite/20">Anterior</Link>}
              {page * per < total && <Link href={`/admin/leads${qs({ p: String(page + 1) })}`} className="rounded-full px-4 py-1.5 ring-1 ring-grafite/20">Próxima</Link>}
            </div>
          </nav>
        )}
      </Card>
    </>
  );
}
