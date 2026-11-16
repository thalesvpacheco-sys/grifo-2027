import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { getDocType, publicPath } from '@/lib/cms/schema';
import { listByType } from '@/lib/cms/repo';
import { Badge, Card, Empty, PageTitle, fmtDateTime } from '@/components/admin/ui';
import { NewDocButton } from '@/components/admin/NewDocButton';

export default async function ContentList({ params, searchParams }: { params: Promise<{ type: string }>; searchParams: Promise<{ q?: string; novo?: string }> }) {
  const u = await requireUser();
  const { type } = await params;
  const sp = await searchParams;
  const dt = getDocType(type);
  if (!dt) notFound();
  if ((type === 'settings' || type === 'redirect') && u.role !== 'admin') redirect('/admin?erro=permissao');
  const docs = listByType(type);
  if (dt.singleton && docs.length === 1) redirect(`/admin/conteudo/${type}/${docs[0].id}`);
  const q = (sp.q || '').toLowerCase();
  const list = q ? docs.filter((d) => d.title.toLowerCase().includes(q) || d.slug.includes(q)) : docs;

  return (
    <>
      <PageTitle title={dt.plural} desc={dt.description} actions={!dt.singleton && <NewDocButton type={type} label={dt.label} autoOpen={sp.novo === '1'} />} />
      <Card>
        {docs.length > 6 && (
          <form className="mb-4" role="search">
            <label htmlFor="q" className="sr-only">Buscar</label>
            <input id="q" name="q" defaultValue={sp.q} placeholder={`Buscar em ${dt.plural.toLowerCase()}…`} className="field max-w-sm" />
          </form>
        )}
        {list.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-grafite/50">
                <tr className="border-b border-grafite/10">
                  <th className="py-2.5 pr-4 font-semibold">Título</th>
                  <th className="py-2.5 pr-4 font-semibold">Status</th>
                  <th className="py-2.5 pr-4 font-semibold">Atualizado</th>
                  <th className="py-2.5 font-semibold"><span className="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody>
                {list.map((d) => {
                  const p = publicPath(d.type, d.slug);
                  return (
                    <tr key={d.id} className="border-b border-grafite/[.06] last:border-0">
                      <td className="py-3 pr-4">
                        <Link href={`/admin/conteudo/${type}/${d.id}`} className="font-semibold hover:text-vinho">{d.title}</Link>
                        <span className="block text-xs text-grafite/50">{p ?? d.slug}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-1.5">
                          <Badge status={d.status} />
                          {d.placeholder && <span className="rounded-full bg-ambar/25 px-2.5 py-0.5 text-xs font-semibold text-[#7a4f00]">pendente de validação</span>}
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-grafite/60">{fmtDateTime(d.updatedAt)}{d.updatedBy ? <span className="block text-xs">{d.updatedBy}</span> : null}</td>
                      <td className="py-3 text-right"><Link href={`/admin/conteudo/${type}/${d.id}`} className="font-semibold text-vinho">Editar</Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title={q ? 'Nada encontrado.' : `Nenhum item em ${dt.plural.toLowerCase()}.`} text={q ? 'Tente outro termo.' : 'Crie o primeiro pelo botão acima.'} />
        )}
      </Card>
    </>
  );
}
