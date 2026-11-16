'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { createDocAction } from '@/app/admin/actions';

export function NewDocButton({ type, label, autoOpen = false }: { type: string; label: string; autoOpen?: boolean }) {
  const [open, setOpen] = useState(autoOpen);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [pending, start] = useTransition();
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) ref.current?.focus();
  }, [open]);

  if (!open) return <button type="button" className="btn btn-vinho min-h-[44px] px-5 text-sm" onClick={() => setOpen(true)}>Novo {label.toLowerCase()}</button>;
  return (
    <form
      className="flex flex-wrap items-start gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await createDocAction(type, title);
          if (r.ok) router.push(`/admin/conteudo/${type}/${r.id}`);
          else setError(r.error || 'Não foi possível criar.');
        });
      }}
    >
      <div>
        <label htmlFor="new-title" className="sr-only">Título</label>
        <input id="new-title" ref={ref} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`Título do ${label.toLowerCase()}`} className="field min-w-[260px]" onKeyDown={(e) => e.key === 'Escape' && setOpen(false)} />
        {error && <p className="field-error">{error}</p>}
      </div>
      <button type="submit" disabled={pending} className="btn btn-vinho min-h-[48px] px-5 text-sm">{pending ? 'Criando…' : 'Criar'}</button>
      <button type="button" className="btn btn-ghost-light min-h-[48px] px-5 text-sm" onClick={() => setOpen(false)}>Cancelar</button>
    </form>
  );
}
