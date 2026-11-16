'use client';

import { useState } from 'react';

/**
 * Core Plan em camadas: placas sobrepostas em perspectiva (CSS 3D, sem WebGL).
 * Passar o cursor ou focar uma camada a destaca — profundidade e camadas, como na referência da página 9.
 */
export function CoreStack({ layers }: { layers: string[] }) {
  const [hi, setHi] = useState<number | null>(null);
  if (!layers.length) return null;
  const n = layers.length;
  return (
    <div className="grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
      <div className="relative mx-auto aspect-square w-full max-w-[460px] [perspective:1400px]" aria-hidden="true">
        <div className="absolute inset-[12%] [transform-style:preserve-3d] [transform:rotateX(58deg)_rotateZ(-38deg)]">
          {layers.map((_, i) => {
            const z = (n - 1 - i) * 22;
            const top = i === 0;
            const lifted = hi === i;
            return (
              <div
                key={i}
                className={`absolute inset-0 rounded-[10px] transition-transform duration-500 ease-out ${top ? 'bg-[#0f0f10]' : 'bg-white'} ${lifted ? 'ring-[3px] ring-ambar' : ''}`}
                style={{
                  transform: `translateZ(${z + (lifted ? 28 : 0)}px)`,
                  boxShadow: top ? '0 0 0 1px rgba(255,255,255,.08), 6px 6px 0 #2a2a2d' : '6px 6px 0 rgba(15,15,16,.12), 0 0 0 1px rgba(15,15,16,.06)',
                }}
              />
            );
          })}
        </div>
        <div className="absolute inset-x-[10%] bottom-[6%] h-10 rounded-[50%] bg-black/20 blur-2xl" />
      </div>
      <ol className="space-y-1">
        {layers.map((l, i) => (
          <li key={l}>
            <button
              type="button"
              onMouseEnter={() => setHi(i)}
              onMouseLeave={() => setHi(null)}
              onFocus={() => setHi(i)}
              onBlur={() => setHi(null)}
              className={`flex w-full items-center gap-4 border-b border-black/10 py-3 text-left transition-colors ${hi === i ? 'text-[#0f0f10]' : 'text-[#4b4a47]'}`}
              aria-label={`Camada ${i + 1}: ${l}`}
            >
              <span className={`h-[2px] transition-all duration-300 ${hi === i ? 'w-10 bg-ambar' : 'w-5 bg-black/20'}`} aria-hidden="true" />
              <span className="font-display text-xs tabular-nums text-[#6f6e6b]">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-display text-lg font-medium tracking-[-0.01em]">{l}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
