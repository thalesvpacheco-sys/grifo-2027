import { requireUser } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { Card, PageTitle, fmtDateTime } from '@/components/admin/ui';
import { ChangePasswordForm } from '@/components/admin/UserForms';
import { TwoFactorSetup } from '@/components/admin/TwoFactorSetup';
import { disable2faAction, revokeOtherSessionsAction } from '../../actions';

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const u = await requireUser();
  const sp = await searchParams;
  const sessions = db().prepare('SELECT id, created_at, last_seen_at, user_agent FROM sessions WHERE user_id = ? ORDER BY last_seen_at DESC').all(u.id) as { id: string; created_at: number; last_seen_at: number; user_agent: string }[];
  return (
    <>
      <PageTitle title="Minha conta" desc={`${u.name} · ${u.email}`} />
      {sp.ok && <p role="status" className="mb-4 rounded-xl bg-[#e7f4ec] px-4 py-3 text-sm font-medium text-[#1f6b43]">{sp.ok === 'sessoes' ? 'As outras sessões foram encerradas.' : 'Autenticação em dois fatores desativada.'}</p>}
      {sp.erro === 'senha' && <p role="alert" className="mb-4 rounded-xl bg-[#fbeaea] px-4 py-3 text-sm font-medium text-vinho">Senha incorreta.</p>}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Senha"><ChangePasswordForm /></Card>
        <Card title="Autenticação em dois fatores (2FA)">
          {u.totpEnabled ? (
            <form action={disable2faAction} className="space-y-3">
              <p className="text-sm text-[#1f6b43]">Ativa. Seu acesso exige o código do aplicativo autenticador.</p>
              <label htmlFor="d2-pw" className="field-label">Confirme sua senha para desativar</label>
              <input id="d2-pw" name="password" type="password" required className="field py-2.5" />
              <button type="submit" className="rounded-full px-4 py-2 text-sm font-semibold text-vinho ring-1 ring-vinho/30">Desativar 2FA</button>
            </form>
          ) : (
            <TwoFactorSetup />
          )}
        </Card>
        <Card title="Sessões ativas" className="lg:col-span-2">
          <ul className="divide-y divide-grafite/[.06] text-sm">
            {sessions.map((s) => (
              <li key={s.id} className="flex flex-wrap justify-between gap-2 py-2.5">
                <span className="max-w-[60ch] truncate">{s.user_agent || 'Navegador desconhecido'}{s.id === u.sessionId && <strong className="ml-2 text-[#1f6b43]">esta sessão</strong>}</span>
                <span className="text-grafite/55">ativa em {fmtDateTime(s.last_seen_at)}</span>
              </li>
            ))}
          </ul>
          {sessions.length > 1 && (
            <form action={revokeOtherSessionsAction} className="mt-4"><button type="submit" className="btn btn-ghost-light min-h-[40px] px-4 text-sm">Encerrar outras sessões</button></form>
          )}
        </Card>
      </div>
    </>
  );
}
