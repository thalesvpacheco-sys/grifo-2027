'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RATIO } from '../site/studio';
import { MotionLoop } from './MotionLoop';

export type GalleryItem = { src: string; alt: string; w?: number; h?: number; lowres?: boolean; caption?: string; title?: string; channel?: string; ratio?: string; video?: { src: string; poster?: string } };

/**
 * Galeria de estúdio com lightbox acessível (<dialog> nativo: foco preso, Esc fecha, setas navegam).
 * Composições: mosaico assimétrico, grade, sequência horizontal e coluna única.
 * Peças sociais mantêm a proporção original (4:5, 9:16, 1:1); nada é distorcido.
 */
export function Gallery({ items, layout = 'mosaic', tone = 'light' }: { items: GalleryItem[]; layout?: string; tone?: 'light' | 'dark' }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [idx, setIdx] = useState(0);
  const valid = items.filter((i) => i.src || i.video?.src);
  const open = (i: number, el: HTMLElement) => {
    opener.current = el;
    setIdx(i);
    dlg.current?.showModal();
  };
  const close = () => dlg.current?.close();
  const go = useCallback((d: number) => setIdx((i) => (i + d + valid.length) % valid.length), [valid.length]);

  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    const onClose = () => opener.current?.focus();
    d.addEventListener('keydown', onKey);
    d.addEventListener('close', onClose);
    return () => {
      d.removeEventListener('keydown', onKey);
      d.removeEventListener('close', onClose);
    };
  }, [go]);

  if (!valid.length) return null;
  const dark = tone === 'dark';
  const cur = valid[idx];

  const cell = (i: number) => {
    if (valid.length === 1) return 'col-span-12';
    if (layout === 'grid') return valid.length === 2 ? 'sm:col-span-6' : 'sm:col-span-6 lg:col-span-4';
    if (layout === 'stack') return 'col-span-12';
    if (layout === 'sequence') return 'w-[78vw] shrink-0 snap-start sm:w-[46vw] lg:w-[34vw]';
    // mosaico: alterna escalas para criar ritmo editorial
    const pattern = ['sm:col-span-12 lg:col-span-8', 'sm:col-span-6 lg:col-span-4', 'sm:col-span-6 lg:col-span-5', 'sm:col-span-12 lg:col-span-7'];
    return valid.length === 1 ? 'col-span-12' : pattern[i % pattern.length];
  };

  const thumb = (it: GalleryItem, i: number) => {
    let aspect = it.ratio && RATIO[it.ratio] ? RATIO[it.ratio] : '';
    // Mesma regra do Frame: se o quadro pedido cortaria demais a peça (ex.: arte horizontal num quadro 4:5 ou 9:16),
    // vale a proporção do arquivo — o conteúdo importante nunca é cortado.
    if (aspect && it.w && it.h && it.ratio && !it.video?.src) {
      const [a, b] = it.ratio.split(':').map(Number);
      const target = a / b, natural = it.w / it.h;
      if (Math.abs(natural - target) / Math.min(natural, target) > 0.2) aspect = '';
    }
    const style = !aspect && it.w && it.h ? { aspectRatio: `${it.w} / ${it.h}` } : undefined;
    return (
      <figure className="group">
        {it.video?.src ? (
          <MotionLoop src={it.video.src} poster={it.video.poster} label={it.title || it.alt || 'Peça da campanha'} className={`rounded-2xl ${aspect || 'aspect-video'}`} />
        ) : (
          <button type="button" onClick={(e) => open(i, e.currentTarget)} className={`relative block w-full overflow-hidden rounded-2xl ${it.lowres ? 'lowres-frame isolate mx-auto p-5 sm:p-8' : 'bg-grafite-800'} ${it.lowres ? '' : aspect}`} style={it.lowres ? (it.w ? { maxWidth: `${it.w + 64}px` } : undefined) : style} aria-label={`Ampliar imagem: ${it.alt || it.title || `imagem ${i + 1}`}`}>
            {it.lowres && it.w && it.h ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.src} alt="" aria-hidden="true" loading="lazy" decoding="async" className="lowres-ambient" />
                <Image src={it.src} alt={it.alt} width={it.w} height={it.h} sizes={`${it.w}px`} className="relative mx-auto h-auto max-h-full w-auto max-w-full rounded-[6px] object-contain ring-1 ring-white/10" />
              </>
            ) : (
              <span className="media-zoom absolute inset-0 block">
                <Image src={it.src} alt={it.alt} fill sizes={layout === 'stack' ? '100vw' : '(min-width:1024px) 50vw, 100vw'} className="object-cover" />
              </span>
            )}
            <span aria-hidden="true" className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              <svg viewBox="0 0 24 24" className="h-4 w-4"><path d="M4 9V4h5M20 15v5h-5M15 4h5v5M9 20H4v-5" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
            </span>
          </button>
        )}
        {(it.title || it.channel || it.caption) && (
          <figcaption className={`mt-3 flex flex-wrap gap-x-3 text-sm ${dark ? 'text-white/70' : 'text-grafite/70'}`}>
            {it.title && <span className={`font-semibold ${dark ? 'text-white' : 'text-grafite'}`}>{it.title}</span>}
            {it.channel && <span>{it.channel}</span>}
            {it.caption && <span>{it.caption}</span>}
          </figcaption>
        )}
      </figure>
    );
  };

  return (
    <>
      {layout === 'sequence' ? (
        <ul className="scrollbar-none -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12" tabIndex={0} aria-label="Sequência de peças (role horizontalmente)">
          {valid.map((it, i) => <li key={i} className={cell(i)}>{thumb(it, i)}</li>)}
        </ul>
      ) : (
        <ul className="grid grid-cols-12 gap-x-5 gap-y-10">
          {valid.map((it, i) => <li key={i} className={`col-span-12 ${cell(i)}`}>{thumb(it, i)}</li>)}
        </ul>
      )}

      <dialog ref={dlg} aria-label="Visualização ampliada" className="lightbox-backdrop fixed inset-0 m-0 h-[100dvh] max-h-none w-screen max-w-none p-0 text-white backdrop:bg-transparent" onClick={(e) => e.target === e.currentTarget && close()}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-5 py-4 sm:px-8">
            <p className="font-display text-sm tabular-nums text-white/70" aria-live="polite">{idx + 1} / {valid.length}</p>
            <button type="button" onClick={close} className="flex h-11 w-11 items-center justify-center rounded-full ring-1 ring-white/30 hover:bg-white hover:text-grafite" aria-label="Fechar">
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" /></svg>
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20">
            {cur && cur.src && (
              <Image key={cur.src} src={cur.src} alt={cur.alt} width={cur.w || 1600} height={cur.h || 1000} sizes="100vw" className={`h-auto max-h-full w-auto max-w-full object-contain ${cur.lowres ? '' : ''}`} style={cur.lowres && cur.w ? { maxWidth: `${cur.w * 1.5}px` } : undefined} />
            )}
            {valid.length > 1 && (
              <>
                <button type="button" onClick={() => go(-1)} className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 hover:bg-white hover:text-grafite sm:left-6" aria-label="Imagem anterior">‹</button>
                <button type="button" onClick={() => go(1)} className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 hover:bg-white hover:text-grafite sm:right-6" aria-label="Próxima imagem">›</button>
              </>
            )}
          </div>
          <p className="min-h-[3.5rem] px-5 py-4 text-center text-sm text-white/75 sm:px-8">{[cur?.title, cur?.channel, cur?.caption || cur?.alt].filter(Boolean).join(' · ')}</p>
        </div>
      </dialog>
    </>
  );
}
