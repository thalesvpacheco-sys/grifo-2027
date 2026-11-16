'use client';

import { useState, useTransition } from 'react';
import { deleteLeadAction, resendLeadAction, updateLeadAction } from '@/app/admin/actions';

const STATUSES = [
  { v: 'novo', l: 'Novo' },
  { v: 'em_atendimento', l: 'Em atendimento' },
  { v: 'qualificado', l: 'Qualificado' },
  { v: 'convertido', l: 'Convertido' },
  { v: 'descartado', l: 'Descartado' },
];

export function LeadActions({ id, status, notes, isAdmin }: { id: number; status: string; notes: string; isAdmin: boolean }) {
  const [s, setS] = useState(status);
  const [n, setN] = useState(notes);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const [pending, start] = useTransition();
  return (
    <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
      <section className="rounded-2xl bg-white p-5 ring-1 ring-grafite/[.08]">
        <h2 className="font-display text-base font-semibold">Atendimento</h2>
        <label htmlFor="st" className="field-label mt-3">Status</label>
        <select id="st" value={s} onChange={(e) => setS(e.target.value)} className="field field-select py-2 text-sm">
          {STATUSES.map((x) => <option key={x.v} value={x.v}>{x.l}</option>)}
        </select>
        <label htmlFor="nt" className="field-label mt-3">Anotações internas</label>
        <textarea id="nt" value={n} onChange={(e) => setN(e.target.value)} rows={5} className="field text-sm" />
        <button type="button" disabled={pending} className="btn btn-vinho mt-3 min-h-[40px] w-full text-sm" onClick={() => start(async () => { const r = await updateLeadAction(id, s, n); setMsg({ ok: r.ok, t: r.message || r.error || '' }); })}>
          Salvar atendimento
        </button>
        <button type="button" disabled={pending} className="mt-2 w-full rounded-full py-2 text-sm font-semibold ring-1 ring-grafite/20" onClick={() => start(async () => { const r = await resendLeadAction(id); setMsg({ ok: r.ok, t: r.message || r.error || '' }); })}>
          Reenviar ao CRM
        </button>
        <p role="status" aria-live="polite" className={`mt-3 text-sm ${msg?.ok ? 'text-[#1f6b43]' : 'text-vinho'}`}>{msg?.t}</p>
      </section>
      {isAdmin && (
        <section className="rounded-2xl bg-white p-5 ring-1 ring-grafite/[.08]">
          <h2 className="font-display text-base font-semibold">Direitos do titular (LGPD)</h2>
          <p className="mt-1 text-sm text-grafite/60">Exclui definitivamente este lead a pedido do titular. A ação é registrada na auditoria.</p>
          {confirmDel ? (
            <div className="mt-3 flex gap-2">
              <button type="button" disabled={pending} onClick={() => start(async () => { await deleteLeadAction(id); })} className="rounded-full bg-vinho px-4 py-2 text-sm font-semibold text-white">Confirmar exclusão</button>
              <button type="button" onClick={() => setConfirmDel(false)} className="rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-grafite/20">Cancelar</button>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmDel(true)} className="mt-3 text-sm font-semibold text-vinho underline underline-offset-2">Excluir dados deste lead</button>
          )}
        </section>
      )}
    </aside>
  );
}
