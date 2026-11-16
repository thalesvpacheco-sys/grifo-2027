'use client';

import { useActionState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createUserAction, updateUserAction, changePasswordAction, type ActionResult } from '@/app/admin/actions';

export function CreateUserForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(createUserAction, null);
  return (
    <form action={action} className="space-y-3">
      <div><label htmlFor="nu-name" className="field-label">Nome</label><input id="nu-name" name="name" required className="field py-2.5" /></div>
      <div><label htmlFor="nu-email" className="field-label">E-mail</label><input id="nu-email" name="email" type="email" required className="field py-2.5" /></div>
      <div>
        <label htmlFor="nu-role" className="field-label">Perfil</label>
        <select id="nu-role" name="role" className="field field-select py-2.5"><option value="editor">Editor</option><option value="admin">Administrador</option></select>
      </div>
      <div>
        <label htmlFor="nu-pw" className="field-label">Senha temporária</label>
        <input id="nu-pw" name="password" type="text" autoComplete="new-password" required minLength={12} className="field py-2.5 font-mono" />
        <p className="mt-1 text-xs text-grafite/55">Mínimo 12 caracteres, com maiúsculas, minúsculas, número e símbolo. Peça para a pessoa trocar no primeiro acesso.</p>
      </div>
      {state && <p role="status" className={`text-sm font-medium ${state.ok ? 'text-[#1f6b43]' : 'text-vinho'}`}>{state.message || state.error}</p>}
      <button type="submit" disabled={pending} className="btn btn-vinho min-h-[42px] w-full text-sm">{pending ? 'Criando…' : 'Criar usuário'}</button>
    </form>
  );
}

export function UserRowActions({ id, active, isAdmin, has2fa }: { id: number; active: boolean; isAdmin: boolean; has2fa: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const run = (op: 'toggle' | 'role' | 'unlock' | 'reset2fa') =>
    start(async () => {
      const r = await updateUserAction(id, op);
      if (!r.ok) alert(r.error);
      router.refresh();
    });
  const b = 'rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-grafite/20 hover:bg-grafite/5 disabled:opacity-50';
  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      <button type="button" disabled={pending} className={b} onClick={() => run('role')}>{isAdmin ? 'Tornar editor' : 'Tornar admin'}</button>
      <button type="button" disabled={pending} className={b} onClick={() => run('unlock')}>Desbloquear</button>
      {has2fa && <button type="button" disabled={pending} className={b} onClick={() => run('reset2fa')}>Redefinir 2FA</button>}
      <button type="button" disabled={pending} className={`${b} text-vinho`} onClick={() => run('toggle')}>{active ? 'Desativar' : 'Reativar'}</button>
    </div>
  );
}

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(changePasswordAction, null);
  return (
    <form action={action} className="space-y-3">
      <div><label htmlFor="pw-c" className="field-label">Senha atual</label><input id="pw-c" name="current" type="password" autoComplete="current-password" required className="field py-2.5" /></div>
      <div><label htmlFor="pw-n" className="field-label">Nova senha</label><input id="pw-n" name="next" type="password" autoComplete="new-password" required minLength={12} className="field py-2.5" /></div>
      <div><label htmlFor="pw-r" className="field-label">Confirmar nova senha</label><input id="pw-r" name="confirm" type="password" autoComplete="new-password" required className="field py-2.5" /></div>
      {state && <p role="status" className={`text-sm font-medium ${state.ok ? 'text-[#1f6b43]' : 'text-vinho'}`}>{state.message || state.error}</p>}
      <button type="submit" disabled={pending} className="btn btn-vinho min-h-[42px] text-sm">{pending ? 'Salvando…' : 'Alterar senha'}</button>
    </form>
  );
}
