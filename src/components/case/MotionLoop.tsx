'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Motion de case: vídeo curto, mudo e em loop, que só baixa e toca quando está na tela.
 * Com prefers-reduced-motion ou economia de dados, mostra o quadro de capa com botão de reprodução.
 */
export function MotionLoop({ src, poster, label, className = '' }: { src: string; poster?: string; label: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [auto, setAuto] = useState(false);
  const [manual, setManual] = useState(false);

  useEffect(() => {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || nav.connection?.saveData) return;
    setAuto(true);
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v || !(auto || manual)) return;
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting) v.play().catch(() => undefined);
      else v.pause();
    }, { threshold: 0.25 });
    io.observe(v);
    return () => io.disconnect();
  }, [auto, manual]);

  if (!src) return null;
  if (!auto && !manual)
    return (
      <button type="button" onClick={() => setManual(true)} className={`group relative block w-full overflow-hidden bg-black ${className}`} aria-label={`Reproduzir animação: ${label}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {poster && <img src={poster} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />}
        <span className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-full bg-ambar text-grafite transition-transform group-hover:scale-110">
          <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" fill="currentColor" /></svg>
        </span>
      </button>
    );
  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
      <video ref={ref} className="absolute inset-0 h-full w-full object-cover" src={src} poster={poster} muted loop playsInline preload="metadata" aria-label={label} />
    </div>
  );
}
