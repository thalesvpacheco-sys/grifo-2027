'use client';

import { useState, useTransition } from 'react';
import { UploadZone, type MediaItem } from './MediaPicker';
import { deleteMediaAction, updateMediaAltAction } from '@/app/admin/actions';

const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

export function MediaLibrary({ initial }: { initial: MediaItem[] }) {
  const [items, setItems] = useState(initial);
  const [sel, setSel] = useState<MediaItem | null>(null);
  const [alt, setAlt] = useState('');
  const [msg, setMsg] = useState('');
  const [pending, start] = useTransition();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <UploadZone accept="any" onUploaded={(m) => setItems((x) => [m, ...x])} />
        {items.length ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {items.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  aria-pressed={sel?.id === m.id}
                  onClick={() => {
                    setSel(m);
                    setAlt(m.alt);
                    setMsg('');
                  }}
                  className={`block w-full overflow-hidden rounded-xl bg-white text-left ring-1 transition ${sel?.id === m.id ? 'ring-2 ring-vinho' : 'ring-grafite/10 hover:ring-grafite/40'}`}
                >
                  {m.mime.startsWith('image/') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.url} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
                  ) : (
                    <span className="flex aspect-[4/3] items-center justify-center bg-grafite text-sm text-white">Vídeo</span>
                  )}
                  <span className="block truncate px-3 py-2 text-xs">{m.alt || <em className="text-vinho">sem texto alternativo</em>}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-grafite/60">A biblioteca está vazia. As imagens do acervo da marca também ficam disponíveis no seletor do editor.</p>
        )}
      </div>
      <aside className="lg:sticky lg:top-6 lg:self-start">
        {sel ? (
          <div className="rounded-2xl bg-white p-5 ring-1 ring-grafite/[.08]">
            {sel.mime.startsWith('image/') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sel.url} alt="" className="w-full rounded-lg" />
            ) : (
              <video src={sel.url} controls className="w-full rounded-lg" />
            )}
            <dl className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between gap-2"><dt className="text-grafite/55">Arquivo</dt><dd className="truncate">{sel.original_name}</dd></div>
              {sel.width && <div className="flex justify-between"><dt className="text-grafite/55">Dimensões</dt><dd>{sel.width}×{sel.height}</dd></div>}
              <div className="flex justify-between"><dt className="text-grafite/55">Tamanho</dt><dd>{kb(sel.size)}</dd></div>
            </dl>
            <label htmlFor="alt" className="field-label mt-4">Texto alternativo</label>
            <textarea id="alt" value={alt} onChange={(e) => setAlt(e.target.value)} rows={2} className="field text-sm" />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pending}
                className="btn btn-vinho min-h-[40px] px-4 text-sm"
                onClick={() =>
                  start(async () => {
                    await updateMediaAltAction(sel.id, alt);
                    setItems((x) => x.map((i) => (i.id === sel.id ? { ...i, alt } : i)));
                    setMsg('Texto alternativo salvo.');
                  })
                }
              >
                Salvar
              </button>
              <button type="button" className="btn btn-ghost-light min-h-[40px] px-4 text-sm" onClick={() => navigator.clipboard?.writeText(sel.url).then(() => setMsg('Endereço copiado.'))}>
                Copiar endereço
              </button>
              <button
                type="button"
                disabled={pending}
                className="text-sm font-semibold text-vinho underline underline-offset-2"
                onClick={() => {
                  if (!confirm('Excluir este arquivo?')) return;
                  start(async () => {
                    const r = await deleteMediaAction(sel.id);
                    if (r.ok) {
                      setItems((x) => x.filter((i) => i.id !== sel.id));
                      setSel(null);
                    } else setMsg(r.error || 'Não foi possível excluir.');
                  });
                }}
              >
                Excluir
              </button>
            </div>
            <p role="status" aria-live="polite" className="mt-3 text-sm text-grafite/70">{msg}</p>
          </div>
        ) : (
          <p className="rounded-2xl bg-white p-5 text-sm text-grafite/60 ring-1 ring-grafite/[.08]">Selecione um arquivo para editar o texto alternativo, copiar o endereço ou excluir.</p>
        )}
      </aside>
    </div>
  );
}
