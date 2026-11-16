'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Escultura 3D "Asa Grifo" do hero: imagem renderizada (offline, iluminação de estúdio) e, em telas grandes,
 * um loop de vídeo curto da mesma escultura. Sem WebGL no navegador.
 * - A imagem é o LCP e aparece de imediato (é a mesma cena do primeiro quadro do vídeo).
 * - O vídeo só carrega depois da página pronta, em desktop, sem economia de dados e sem movimento reduzido.
 * - Pausa fora da tela; parallax sutil ao mover o cursor (desligado com movimento reduzido).
 */
export function HeroSculpture({ poster, srcSet, sizes, sources, className = '', alt = '' }: { poster: string; srcSet?: string; sizes?: string; sources: { src: string; type: string }[]; className?: string; alt?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const par = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const wide = window.matchMedia('(min-width: 1024px)').matches;
    const save = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduce || !wide || save) return;
    const start = () => setLoad(true);
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const t = w.requestIdleCallback ? w.requestIdleCallback(start, { timeout: 2500 }) : window.setTimeout(start, 1200);
    return () => { if (!w.requestIdleCallback) clearTimeout(t as number); };
  }, []);

  useEffect(() => {
    const v = vid.current;
    const el = box.current;
    if (!load || !v || !el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }, { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, [load]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.matchMedia('(pointer: fine)').matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        if (par.current) par.current.style.transform = `translate3d(${x * -12}px, ${y * -9}px, 0)`;
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => { window.removeEventListener('pointermove', onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div ref={box} className={`hm-sculpt ${playing ? 'is-playing' : ''} ${className}`} aria-hidden={alt ? undefined : true}>
      <div ref={par} className="hm-sculpt-par">
        <div className="hm-float absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={poster} srcSet={srcSet} sizes={sizes} alt={alt} data-poster="" fetchPriority="high" width={1680} height={1440} />
          {load && (
            <video ref={vid} muted loop playsInline preload="auto" onPlaying={() => setPlaying(true)} tabIndex={-1}>
              {sources.map((s) => <source key={s.src} src={s.src} type={s.type} />)}
            </video>
          )}
        </div>
      </div>
    </div>
  );
}
