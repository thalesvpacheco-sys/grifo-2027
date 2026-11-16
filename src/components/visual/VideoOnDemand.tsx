'use client';

import { useState } from 'react';

/** Vídeo carregado sob demanda: só baixa o arquivo quando o visitante clica em reproduzir. */
export function VideoOnDemand({ src, poster, title, className = '' }: { src: string; poster?: string; title: string; className?: string }) {
  const [play, setPlay] = useState(false);
  if (!src) return null;
  return (
    <div className={`relative overflow-hidden rounded-[22px] bg-black ${className}`}>
      {play ? (
        <video className="h-full w-full object-cover" src={src} poster={poster} controls autoPlay playsInline preload="none" aria-label={title} />
      ) : (
        <button type="button" onClick={() => setPlay(true)} className="group absolute inset-0 flex h-full w-full items-center justify-center" aria-label={`Reproduzir vídeo: ${title}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {poster && <img src={poster} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />}
          <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#0f0f10] shadow-[0_20px_50px_-20px_rgba(0,0,0,.7)] transition-transform duration-300 group-hover:scale-110">
            <svg viewBox="0 0 24 24" className="ml-1 h-8 w-8" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" fill="currentColor" /></svg>
          </span>
          <span className="absolute bottom-5 left-6 font-display text-lg font-medium tracking-[-0.02em] text-white">{title}</span>
        </button>
      )}
    </div>
  );
}
