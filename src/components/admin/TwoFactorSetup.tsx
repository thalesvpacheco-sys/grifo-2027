'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { confirm2faAction, start2faAction } from '@/app/admin/actions';

export function TwoFactorSetup() {
  const [setup, setSetup] = useState<{ secret: string; qr: string } | null>(null);
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  if (!setup)
    return (
      <div className="space-y-3">
        <p className="text-sm text-grafite/70">Recomendado para todos os usuários. Use Google Authenticator, Microsoft Authenticator, 1Password ou similar.</p>
        <button type="button" disabled={pending} className="btn btn-vinho min-h-[42px] px-5 text-sm" onClick={() => start(async () => { const r = await start2faAction(); if (r.ok) setSetup({ secret: String(r.secret), qr: String(r.qr) }); })}>
          Configurar 2FA
        </button>
      </div>
    );
  return (
    <div className="space-y-4">
      <p className="text-sm">1. Escaneie o QR code no aplicativo autenticador.</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={setup.qr} alt="QR code para configurar o aplicativo autenticador" width={180} height={180} className="rounded-lg ring-1 ring-grafite/10" />
      <p className="text-xs text-grafite/60">Ou digite a chave: <code className="break-all rounded bg-grafite/5 px-1.5 py-0.5">{setup.secret}</code></p>
      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const r = await confirm2faAction(code);
            setMsg({ ok: r.ok, t: r.message || r.error || '' });
            if (r.ok) router.refresh();
          });
        }}
      >
        <label htmlFor="tf-code" className="field-label">2. Digite o código de 6 dígitos</label>
        <input id="tf-code" value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" autoComplete="one-time-code" maxLength={6} className="field max-w-[200px] py-2.5 text-center font-display text-xl tracking-[0.3em]" />
        <button type="submit" disabled={pending} className="btn btn-vinho min-h-[42px] px-5 text-sm">Ativar</button>
        {msg && <p role="status" className={`text-sm font-medium ${msg.ok ? 'text-[#1f6b43]' : 'text-vinho'}`}>{msg.t}</p>}
      </form>
    </div>
  );
}
