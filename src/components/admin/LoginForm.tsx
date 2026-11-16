'use client';

import { useActionState } from 'react';
import { loginAction, verify2faAction, type ActionResult } from '@/app/admin/actions';

export function LoginForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(loginAction, null);
  return (
    <form action={action} className="on-light mt-6 space-y-4">
      <div>
        <label htmlFor="email" className="field-label">E-mail</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="field" autoFocus defaultValue={typeof state?.email === 'string' ? state.email : ''} key={String(state?.email ?? '')} />
      </div>
      <div>
        <label htmlFor="password" className="field-label">Senha</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
      </div>
      {state?.error && <p role="alert" className="rounded-xl bg-[#fbeaea] px-4 py-3 text-sm font-medium text-vinho">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn btn-vinho w-full">{pending ? 'Entrando…' : 'Entrar'}</button>
    </form>
  );
}

export function TwoFactorForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(verify2faAction, null);
  return (
    <form action={action} className="on-light mt-6 space-y-4">
      <div>
        <label htmlFor="code" className="field-label">Código</label>
        <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6} required className="field text-center font-display text-2xl tracking-[0.4em]" autoFocus />
      </div>
      {state?.error && <p role="alert" className="rounded-xl bg-[#fbeaea] px-4 py-3 text-sm font-medium text-vinho">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn btn-vinho w-full">{pending ? 'Verificando…' : 'Verificar'}</button>
    </form>
  );
}
