import { requireUser } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { Card, PageTitle, fmtDateTime } from '@/components/admin/ui';

export default async function AuditPage() {
  await requireUser('admin');
  const rows = db().prepare('SELECT a.*, u.name FROM audit_log a LEFT JOIN users u ON u.id = a.user_id ORDER BY a.id DESC LIMIT 300').all() as { id: number; action: string; target: string | null; detail: string | null; name: string | null; ip_hash: string | null; created_at: number }[];
  return (
    <>
      <PageTitle title="Auditoria" desc="Registro das últimas 300 ações no painel: acessos, edições, publicações, exportações e exclusões. IPs são pseudonimizados." />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-grafite/50"><tr className="border-b border-grafite/10"><th className="py-2.5 pr-3">Quando</th><th className="py-2.5 pr-3">Quem</th><th className="py-2.5 pr-3">Ação</th><th className="py-2.5 pr-3">Alvo</th><th className="py-2.5">IP (hash)</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-grafite/[.06] last:border-0">
                  <td className="py-2 pr-3 text-grafite/60">{fmtDateTime(r.created_at)}</td>
                  <td className="py-2 pr-3">{r.name ?? '—'}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{r.action}</td>
                  <td className="py-2 pr-3 text-grafite/70">{[r.target, r.detail].filter(Boolean).join(' · ')}</td>
                  <td className="py-2 font-mono text-xs text-grafite/45">{r.ip_hash?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
