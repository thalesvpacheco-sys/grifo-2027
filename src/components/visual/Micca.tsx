'use client';

import { useId, useRef, useState, type KeyboardEvent } from 'react';

type Pillar = { letter?: string; name: string; summary?: string; text?: string };
type App = { sector: string; label?: string; items?: { pillar: string; text: string }[] };

/** Teclas de seta/Home/End para listas de abas (padrão WAI-ARIA Tabs). */
export function useRovingTabs(count: number, value: number, onChange: (i: number) => void, orientation: 'horizontal' | 'vertical' = 'horizontal') {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (e: KeyboardEvent) => {
    const next = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    const prev = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
    let i = value;
    if (e.key === next) i = (value + 1) % count;
    else if (e.key === prev) i = (value - 1 + count) % count;
    else if (e.key === 'Home') i = 0;
    else if (e.key === 'End') i = count - 1;
    else return;
    e.preventDefault();
    onChange(i);
    refs.current[i]?.focus();
  };
  return { refs, onKeyDown };
}

/**
 * MICCA interativo da página de metodologia: a palavra MICCA em tipografia monumental, uma letra por pilar.
 * Cada letra é uma aba (clique, passar o mouse ou setas do teclado); a trilha âmbar mostra a sequência da
 * Meta ao Atendimento e o painel abaixo traz o pilar ativo com o exemplo aplicado no setor escolhido.
 */
export function Micca({ pillars, applications }: { pillars: Pillar[]; applications?: App[] }) {
  const uid = useId();
  const [sel, setSel] = useState(0);
  const [sector, setSector] = useState(0);
  const tabs = useRovingTabs(pillars.length, sel, setSel);
  const sectorTabs = useRovingTabs(applications?.length ?? 0, sector, setSector);
  const n = pillars.length;

  if (!n) return null;

  return (
    <div className="mc" style={{ ['--mc-n' as string]: n, ['--mc-sel' as string]: sel }}>
      <div role="tablist" aria-label="Pilares do método MICCA" className="mc-word" onKeyDown={tabs.onKeyDown} data-reveal>
        {pillars.map((pl, i) => {
          const active = i === sel;
          return (
            <button
              key={i}
              ref={(el) => {
                tabs.refs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${uid}-tab-${i}`}
              aria-selected={active}
              aria-controls={`${uid}-panel`}
              aria-label={pl.name}
              tabIndex={active ? 0 : -1}
              onClick={() => setSel(i)}
              onMouseEnter={() => setSel(i)}
              className={`mc-l ${i < sel ? 'is-past' : ''}`}
            >
              <span className="mc-glyph" aria-hidden="true">{pl.letter || pl.name[0]}</span>
              <span className="mc-cap" aria-hidden="true">
                <span className="mc-cap-n">{String(i + 1).padStart(2, '0')}</span>
                <span className="mc-cap-t">{pl.name}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* trilha: a sequência de decisões, da Meta ao Atendimento */}
      <div className="mc-track" aria-hidden="true">
        <span className="mc-track-fill" />
        {pillars.map((_, i) => (
          <span key={i} className={`mc-node ${i <= sel ? 'is-on' : ''} ${i === sel ? 'is-cur' : ''}`} style={{ left: `calc((100% / ${n}) * ${i} + (100% / ${n}) / 2)` }} />
        ))}
      </div>

      <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-12 lg:gap-14">
        <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${sel}`} aria-live="polite" className="lg:col-span-7">
          {/* todos os pilares ficam no HTML (leitura sem JavaScript e indexação); só o ativo aparece */}
          {pillars.map((pl, i) => (
            <div key={i} className="mc-detail" data-mc-p={i} hidden={i !== sel}>
              <p className="font-display text-sm font-medium tabular-nums text-[#a4a3a0]">
                {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
              </p>
              <h3 className="mc-name mt-4">{pl.name}</h3>
              {pl.summary && <p className="mt-5 font-display text-xl font-normal tracking-[-0.02em] text-[#d6d5d1] lg:text-2xl">{pl.summary}</p>}
              {pl.text && <p className="mt-6 max-w-[52ch] text-[1.05rem] leading-relaxed text-[#a4a3a0]">{pl.text}</p>}
            </div>
          ))}
        </div>

        {applications && applications.length > 0 && (
          <div className="lg:col-span-5">
            <div className="mc-app">
              <p id={`${uid}-sector-label`} className="font-display text-[0.7rem] font-medium uppercase tracking-[0.2em] text-[#a4a3a0]">
                Veja o pilar aplicado em
              </p>
              <div role="tablist" aria-labelledby={`${uid}-sector-label`} className="mt-4 flex flex-wrap gap-2" onKeyDown={sectorTabs.onKeyDown}>
                {applications.map((a, i) => (
                  <button
                    key={a.sector}
                    ref={(el) => {
                      sectorTabs.refs.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`${uid}-s-${i}`}
                    aria-selected={i === sector}
                    aria-controls={`${uid}-spanel`}
                    tabIndex={i === sector ? 0 : -1}
                    onClick={() => setSector(i)}
                    className={`min-h-[40px] rounded-full px-4 py-2 font-display text-sm font-medium transition-colors ${
                      i === sector ? 'bg-white text-[#0f0f10]' : 'text-white/85 ring-1 ring-white/20 hover:bg-white/10'
                    }`}
                  >
                    {a.label || a.sector}
                  </button>
                ))}
              </div>
              <div id={`${uid}-spanel`} role="tabpanel" aria-labelledby={`${uid}-s-${sector}`} aria-live="polite" className="mt-7 border-t border-white/10 pt-6">
                {pillars.map((pl, i) =>
                  applications.map((a, k) => (
                    <div key={`${i}-${k}`} className="mc-apptext" data-mc-a={`${i}-${k}`} hidden={i !== sel || k !== sector}>
                      <p className="flex items-center gap-3 font-display text-sm font-medium text-[#d6d5d1]">
                        <span className="mc-chip" aria-hidden="true">{pl.letter || pl.name[0]}</span>
                        {pl.name} · {a.label || a.sector}
                      </p>
                      <p className="mt-4 font-display text-[1.35rem] font-normal leading-[1.35] tracking-[-0.02em] text-white">
                        {a.items?.find((x) => x.pillar === pl.name)?.text || 'Exemplo de aplicação em definição.'}
                      </p>
                    </div>
                  )),
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Lista compacta "MICCA aplicado" usada nas páginas de especialidade. */
export function MiccaApplied({ items }: { items: { pillar: string; text: string }[] }) {
  const uid = useId();
  const [sel, setSel] = useState(0);
  const tabs = useRovingTabs(items.length, sel, setSel, 'vertical');
  if (!items.length) return null;
  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div role="tablist" aria-orientation="vertical" aria-label="Pilares MICCA" className="flex gap-2 overflow-x-auto pb-2 scrollbar-none lg:col-span-5 lg:flex-col lg:overflow-visible" onKeyDown={tabs.onKeyDown}>
        {items.map((it, i) => (
          <button
            key={i}
            ref={(el) => {
              tabs.refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${uid}-t-${i}`}
            aria-selected={i === sel}
            aria-controls={`${uid}-p`}
            tabIndex={i === sel ? 0 : -1}
            onClick={() => setSel(i)}
            className={`group flex shrink-0 items-center gap-4 rounded-full py-2 pl-2 pr-6 text-left transition-colors lg:rounded-none lg:border-b lg:border-white/10 lg:py-4 lg:pl-0 ${i === sel ? 'text-white' : 'text-[#8f8e8b] hover:text-white'}`}
          >
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-t-full font-display text-xl font-medium transition-colors ${i === sel ? 'bg-white text-[#0f0f10] shadow-[inset_0_3px_0_#E5A12E]' : 'bg-white/[.07]'}`}>{it.pillar[0]}</span>
            <span className="font-display text-xl font-medium tracking-[-0.02em] lg:text-2xl">{it.pillar}</span>
          </button>
        ))}
      </div>
      <div id={`${uid}-p`} role="tabpanel" aria-labelledby={`${uid}-t-${sel}`} aria-live="polite" className="lg:col-span-7 lg:pl-8">
        <p className="font-display text-[clamp(1.6rem,3.2vw,2.6rem)] font-normal leading-[1.15] tracking-[-0.03em] text-white">{items[sel].text}</p>
      </div>
    </div>
  );
}
