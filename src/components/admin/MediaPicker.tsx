'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type MediaItem = { id: number; url: string; alt: string; mime: string; original_name: string; width: number | null; height: number | null; size: number };

export async function uploadFile(file: File, alt = ''): Promise<{ ok: boolean; item?: MediaItem; error?: string }> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('alt', alt);
  try {
    const res = await fetch('/api/admin/media', { method: 'POST', body: fd });
    return await res.json();
  } catch {
    return { ok: false, error: 'Falha de conexão no envio.' };
  }
}

export function useMedia(q = '') {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/media?q=${encodeURIComponent(q)}`);
      const j = await r.json();
      setItems(j.items ?? []);
    } finally {
      setLoading(false);
    }
  }, [q]);
  return { items, loading, reload, setItems };
}

export function UploadZone({ accept, onUploaded }: { accept: 'image' | 'video' | 'any'; onUploaded: (m: MediaItem) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mime = accept === 'image' ? 'image/jpeg,image/png,image/webp,image/avif,image/gif' : accept === 'video' ? 'video/mp4,video/webm' : 'image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm';
  const handle = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError('');
    for (const f of Array.from(files)) {
      const r = await uploadFile(f);
      if (r.ok && r.item) onUploaded(r.item);
      else setError(`${f.name}: ${r.error ?? 'não enviado'}`);
    }
    setBusy(false);
  };
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        handle(e.dataTransfer.files);
      }}
      className={`rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${over ? 'border-vinho bg-vinho/5' : 'border-grafite/15'}`}
    >
      <p className="text-sm text-grafite/70">Arraste arquivos aqui ou</p>
      <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className="btn btn-vinho mt-2 min-h-[40px] px-5 text-sm">
        {busy ? 'Enviando e otimizando…' : 'Selecionar do computador'}
      </button>
      <input ref={inputRef} type="file" accept={mime} multiple className="sr-only" onChange={(e) => handle(e.target.files)} aria-label="Selecionar arquivos" />
      <p className="mt-2 text-xs text-grafite/50">{accept === 'video' ? 'MP4 ou WebM até 80 MB.' : 'JPG, PNG, WebP, AVIF ou GIF até 15 MB. Convertidas para WebP e sem metadados.'}</p>
      {error && <p role="alert" className="field-error">{error}</p>}
    </div>
  );
}

/** Modal de seleção de mídia (biblioteca enviada + acervo da marca). Usa <dialog> nativo: foco preso e Esc fecha. */
export function MediaPicker({ accept, acervo, onSelect, label }: { accept: 'image' | 'video'; acervo: string[]; onSelect: (m: { url: string; alt: string }) => void; label: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [tab, setTab] = useState<'lib' | 'acervo'>('lib');
  const [q, setQ] = useState('');
  const { items, loading, reload, setItems } = useMedia(q);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onClose = () => setQ('');
    d.addEventListener('close', onClose);
    return () => d.removeEventListener('close', onClose);
  }, []);

  const open = () => {
    ref.current?.showModal();
    reload();
  };
  const choose = (m: { url: string; alt: string }) => {
    onSelect(m);
    ref.current?.close();
  };
  const list = items.filter((m) => (accept === 'image' ? m.mime.startsWith('image/') : m.mime.startsWith('video/')));

  return (
    <>
      <button type="button" onClick={open} className="rounded-full bg-grafite px-3.5 py-1.5 text-sm font-semibold text-white">{label}</button>
      <dialog ref={ref} className="w-[min(960px,calc(100vw-24px))] rounded-3xl p-0 backdrop:bg-black/50" aria-label="Biblioteca de mídia">
        <div className="flex items-center justify-between border-b border-grafite/10 px-6 py-4">
          <h2 className="font-display text-xl font-bold">Escolher {accept === 'image' ? 'imagem' : 'vídeo'}</h2>
          <button type="button" onClick={() => ref.current?.close()} className="rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ring-grafite/20">Fechar</button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-6">
          {accept === 'image' && acervo.length > 0 && (
            <div role="tablist" className="mb-4 flex gap-2 text-sm font-semibold">
              <button type="button" role="tab" aria-selected={tab === 'lib'} onClick={() => setTab('lib')} className={`rounded-full px-4 py-1.5 ${tab === 'lib' ? 'bg-grafite text-white' : 'ring-1 ring-grafite/20'}`}>Biblioteca</button>
              <button type="button" role="tab" aria-selected={tab === 'acervo'} onClick={() => setTab('acervo')} className={`rounded-full px-4 py-1.5 ${tab === 'acervo' ? 'bg-grafite text-white' : 'ring-1 ring-grafite/20'}`}>Acervo da marca</button>
            </div>
          )}
          {tab === 'lib' ? (
            <>
              <UploadZone
                accept={accept}
                onUploaded={(m) => {
                  setItems((x) => [m, ...x]);
                }}
              />
              <div className="mt-5 flex items-center gap-3">
                <label htmlFor="media-q" className="sr-only">Buscar</label>
                <input id="media-q" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), reload())} placeholder="Buscar por nome ou descrição" className="field max-w-xs py-2 text-sm" />
                <button type="button" onClick={reload} className="text-sm font-semibold text-vinho">Buscar</button>
              </div>
              {loading ? (
                <p className="mt-6 text-sm text-grafite/50">Carregando…</p>
              ) : list.length ? (
                <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {list.map((m) => (
                    <li key={m.id}>
                      <button type="button" onClick={() => choose({ url: m.url, alt: m.alt })} className="group block w-full overflow-hidden rounded-xl text-left ring-1 ring-grafite/10 hover:ring-2 hover:ring-vinho">
                        {m.mime.startsWith('image/') ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.url} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
                        ) : (
                          <span className="flex aspect-[4/3] items-center justify-center bg-grafite text-xs text-white">Vídeo</span>
                        )}
                        <span className="block truncate px-2 py-1.5 text-xs">{m.alt || m.original_name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-6 text-sm text-grafite/55">Nenhum arquivo ainda. Envie o primeiro acima.</p>
              )}
            </>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {acervo.map((src) => (
                <li key={src}>
                  <button type="button" onClick={() => choose({ url: src, alt: '' })} className="block w-full overflow-hidden rounded-xl ring-1 ring-grafite/10 hover:ring-2 hover:ring-vinho">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
                    <span className="block truncate px-2 py-1.5 text-left text-xs">{src.split('/').pop()}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </dialog>
    </>
  );
}
