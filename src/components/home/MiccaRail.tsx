'use client';

import { useId, useState } from 'react';

type Pillar = { letter?: string; name: string; summary?: string; text?: string };

/**
 * MICCA na Home: cinco painéis lado a lado; o pilar ativo se expande e mostra o texto completo do CMS.
 * Funciona por clique, teclado (setas) e foco. No celular, vira uma lista vertical expansível.
 * Sem JavaScript, todos os textos já estão no HTML (o painel inicial aberto é o primeiro).
 */
export function MiccaRail({ pillars }: { pillars: Pillar[] }) {
  const [active, setActive] = useState(0);
  const uid = useId();
  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const n = (i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1) + pillars.length) % pillars.length;
    setActive(n);
    document.getElementById(`${uid}-b${n}`)?.focus();
  };
  return (
    <div className="hm-micca flex-col lg:h-[460px] lg:flex-row">
      {pillars.map((p, i) => {
        const on = i === active;
        return (
          <button
            key={i}
            id={`${uid}-b${i}`}
            type="button"
            aria-expanded={on}
            aria-controls={`${uid}-p${i}`}
            onClick={() => setActive(i)}
            onFocus={() => setActive(i)}
            onMouseEnter={() => setActive(i)}
            onKeyDown={(e) => onKey(e, i)}
            className="hm-mi flex min-h-[96px] flex-col justify-between p-6 lg:min-h-0 lg:p-8"
          >
            <span className="flex w-full items-start justify-between gap-4">
              {/* pilar ativo: a palavra aparece à frente da letra em destaque */}
              <span className="hm-mi-head">
                <span className="hm-mi-letter" aria-hidden="true">{p.letter || p.name.charAt(0)}</span>
                <span className="hm-mi-word">{p.name}</span>
              </span>
              <span className={`hm-num mt-2 ${on ? '!text-[#9d9c99]' : ''}`}>{String(i + 1).padStart(2, '0')}</span>
            </span>
            <span className="block w-full">
              <span className={`hm-mi-name block font-display text-xl font-medium tracking-[-0.02em] ${on ? 'text-white' : 'text-[#0f0f10]'} lg:text-2xl`}>{p.name}</span>
              <span id={`${uid}-p${i}`} className={`hm-mi-body ${on ? 'block' : 'hidden'} lg:max-w-[34ch]`}>
                {p.summary && <span className="mt-1 block text-sm text-[#a4a3a0]">{p.summary}</span>}
                <span className="hm-mi-bar mt-5 block" aria-hidden="true" />
                {p.text && <span className="mt-5 block text-[1rem] leading-relaxed text-[#d6d5d1]">{p.text}</span>}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
