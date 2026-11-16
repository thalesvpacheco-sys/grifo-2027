import { requireUser } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { Card, PageTitle, fmtDateTime } from '@/components/admin/ui';
import { CreateUserForm, UserRowActions } from '@/components/admin/UserForms';

export default async function UsersPage() {
  const me = await requireUser('admin');
  const users = db().prepare('SELECT id, email, name, role, active, totp_enabled, locked_until, last_login_at FROM users ORDER BY name').all() as {
    id: number; email: string; name: string; role: string; active: number; totp_enabled: number; locked_until: number | null; last_login_at: number | null;
  }[];
  return (
    <>
      <PageTitle title="Usuários" desc="Editores gerenciam conteúdo, mídia e leads. Administradores também gerenciam usuários, configurações, redirecionamentos, exportações e auditoria." />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="text-grafite/50"><tr className="border-b border-grafite/10"><th className="py-2.5 pr-3">Pessoa</th><th className="py-2.5 pr-3">Perfil</th><th className="py-2.5 pr-3">Segurança</th><th className="py-2.5 pr-3">Último acesso</th><th className="py-2.5"><span className="sr-only">Ações</span></th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className={`border-b border-grafite/[.06] last:border-0 ${u.active ? '' : 'opacity-50'}`}>
                    <td className="py-3 pr-3"><span className="font-semibold">{u.name}</span>{u.id === me.id && <span className="ml-2 text-xs text-grafite/50">(você)</span>}<span className="block text-xs text-grafite/55">{u.email}</span></td>
                    <td className="py-3 pr-3">{u.role === 'admin' ? 'Administrador' : 'Editor'}{!u.active && <span className="block text-xs text-vinho">desativado</span>}</td>
                    <td className="py-3 pr-3 text-xs">{u.totp_enabled ? '2FA ativo' : <span className="text-[#8a5a00]">sem 2FA</span>}{u.locked_until && u.locked_until > Date.now() && <span className="block text-vinho">bloqueado</span>}</td>
                    <td className="py-3 pr-3 text-grafite/60">{u.last_login_at ? fmtDateTime(u.last_login_at) : '—'}</td>
                    <td className="py-3 text-right">{u.id !== me.id && <UserRowActions id={u.id} active={!!u.active} isAdmin={u.role === 'admin'} has2fa={!!u.totp_enabled} />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Novo usuário"><CreateUserForm /></Card>
      </div>
    </>
  );
}
