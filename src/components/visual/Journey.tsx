'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useRovingTabs } from './Micca';

type Step = { title: string; objective?: string; deliverables?: string[] };

/** Jornada interativa de 12 etapas (Grifo Core). Abas acessíveis com navegação por teclado. */
export function Journey({ steps }: { steps: Step[] }) {
  const uid = useId();
  const [sel, setSel] = useState(0);
  const tabs = useRovingTabs(steps.length, sel, setSel);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = tabs.refs.current[sel];
    const rail = railRef.current;
    if (el && rail) {
      const left = el.offsetLeft - rail.clientWidth / 2 + el.clientWidth / 2;
      rail.scrollTo({ left, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  }, [sel, tabs.refs]);

  if (!steps.length) return null;
  const s = steps[sel];
  const pct = ((sel + 1) / steps.length) * 100;

  return (
    <div>
      <div ref={railRef} className="relative -mx-5 overflow-x-auto px-5 pb-4 scrollbar-none sm:-mx-8 sm:px-8 2xl:mx-0 2xl:px-0">
        <div role="tablist" aria-label="Etapas da jornada de lançamento" className="relative flex min-w-max gap-1 2xl:grid 2xl:min-w-0 2xl:grid-cols-12" onKeyDown={tabs.onKeyDown}>
          <span aria-hidden="true" className="absolute inset-x-0 top-[22px] h-[2px] bg-white/15" />
          <span aria-hidden="true" className="absolute left-0 top-[22px] h-[2px] bg-ambar transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
          {steps.map((st, i) => (
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
              className="group relative flex w-[108px] flex-col items-center gap-3 px-1 text-center 2xl:w-auto"
            >
              <span
                className={`relative z-[1] flex h-11 w-11 items-center justify-center rounded-full font-display text-sm font-medium tabular-nums transition-all duration-300 ${
                  i === sel ? 'scale-110 bg-white text-[#0f0f10] shadow-[0_0_0_6px_rgba(229,161,46,.18)]' : i < sel ? 'bg-[#34343a] text-white' : 'bg-[#18181a] text-[#a4a3a0] ring-1 ring-white/15 group-hover:ring-white/50'
                }`}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className={`text-[12.5px] font-medium leading-tight transition-colors ${i === sel ? 'text-white' : 'text-[#8f8e8b] group-hover:text-white/85'}`}>{st.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div id={`${uid}-p`} role="tabpanel" aria-labelledby={`${uid}-t-${sel}`} aria-live="polite" className="mt-10 grid gap-8 rounded-[24px] bg-[#18181a] p-6 ring-1 ring-white/[.06] sm:p-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="flex items-center gap-2.5 font-display text-[0.72rem] font-medium uppercase tracking-[0.2em] text-[#a4a3a0]"><i className="hm-dot" aria-hidden="true" />
            Etapa {String(sel + 1).padStart(2, '0')} de {steps.length}
          </p>
          <h3 className="hm-h2 mt-5 text-white">{s.title}</h3>
        </div>
        <div className="lg:col-span-7">
          {s.objective && (
            <>
              <p className="text-sm font-medium text-[#8f8e8b]">Objetivo</p>
              <p className="mt-1 text-lead text-white/85">{s.objective}</p>
            </>
          )}
          {s.deliverables?.length ? (
            <>
              <p className="mt-6 text-sm font-medium text-[#8f8e8b]">Entregas</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {s.deliverables.map((d) => (
                  <li key={d} className="rounded-full bg-white/[.06] px-4 py-2 text-sm text-[#e4e3df]">
                    {d}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          <div className="mt-8 flex gap-2">
            <button type="button" className="hm-btn hm-btn--line-dark !min-h-[46px] !px-5 !text-sm disabled:opacity-40" disabled={sel === 0} onClick={() => setSel(sel - 1)}>
              Etapa anterior
            </button>
            <button type="button" className="hm-btn hm-btn--white !min-h-[46px] !px-5 !text-sm disabled:opacity-40" disabled={sel === steps.length - 1} onClick={() => setSel(sel + 1)}>
              Próxima etapa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
