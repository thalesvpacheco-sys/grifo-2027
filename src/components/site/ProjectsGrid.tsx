'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { SECTORS, COMPETENCIES } from '@/lib/cms/schema';
import { PlaceholderFlag } from '../ui/Duo';
import { Frame } from './studio';
import { ProjectRows, type ProjectItem } from './ProjectRows';

export type { ProjectItem };
const label = (list: { value: string; label: string }[], v?: string) => list.find((x) => x.value === v)?.label ?? v ?? '';

/**
 * Portfólio boutique: projeto em destaque (o que tem a melhor imagem, mostrada inteira) e índice editorial
 * filtrável por setor e competência. Filtros acessíveis, resultado anunciado.
 */
export function ProjectsGrid({ items, showFlags = false }: { items: ProjectItem[]; showFlags?: boolean }) {
  const [sector, setSector] = useState('');
  const [comp, setComp] = useState('');
  const list = useMemo(() => items.filter(({ doc: c }) => (!sector || c.data.sector === sector) && (!comp || c.data.competencies?.includes(comp))), [items, sector, comp]);
  const usedSectors = SECTORS.filter((s) => items.some(({ doc: c }) => c.data.sector === s.value));
  const usedComps = COMPETENCIES.filter((s) => items.some(({ doc: c }) => c.data.competencies?.includes(s.value)));
  // destaque: primeiro projeto da lista com imagem horizontal em boa resolução
  const feat = list.find((x) => x.cover?.src && !x.cover.lowres && (x.cover.w ?? 0) >= 1000);

  if (!items.length)
    return <p className="hm-lead">Os projetos estão em fase de aprovação de portfólio e serão publicados em breve.</p>;

  return (
    <div className="on-light">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <p className="pj-count" aria-hidden="true">
          <b>{String(list.length).padStart(2, '0')}</b>
          <span>{list.length === 1 ? 'projeto' : 'projetos'}</span>
        </p>
        <div className="flex flex-col gap-5 sm:flex-row sm:gap-10">
          <fieldset>
            <legend className="mb-2.5 font-display text-[0.7rem] font-medium uppercase tracking-[0.2em] text-[#6f6e6b]">Setor</legend>
            <div className="flex flex-wrap gap-2">
              <button type="button" aria-pressed={!sector} className="hm-fchip" onClick={() => setSector('')}>Todos</button>
              {usedSectors.map((s) => (
                <button key={s.value} type="button" aria-pressed={sector === s.value} className="hm-fchip" onClick={() => setSector(s.value)}>{s.label}</button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2.5 font-display text-[0.7rem] font-medium uppercase tracking-[0.2em] text-[#6f6e6b]">Competência</legend>
            <div className="flex flex-wrap gap-2">
              <button type="button" aria-pressed={!comp} className="hm-fchip" onClick={() => setComp('')}>Todas</button>
              {usedComps.map((s) => (
                <button key={s.value} type="button" aria-pressed={comp === s.value} className="hm-fchip" onClick={() => setComp(s.value)}>{s.label}</button>
              ))}
            </div>
          </fieldset>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">{list.length} projeto(s) encontrado(s)</p>

      {feat && (
        <article className="pj-feat group" aria-labelledby={`feat-${feat.doc.slug}`}>
          <div className="pj-feat-media">
            <Frame img={feat.cover} sizes="(min-width:1360px) 1240px, 100vw" className="rounded-[22px]" showFlags={showFlags} />
          </div>
          <div className="mt-6 flex flex-col gap-5 px-1 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="flex flex-wrap items-center gap-1.5">
                <span className="pj-feat-k"><i aria-hidden="true" />Em destaque</span>
                <span className="hm-tag hm-tag--sector">{label(SECTORS, feat.doc.data.sector)}</span>
                {feat.doc.data.year ? <span className="hm-tag">{feat.doc.data.year}</span> : null}
                {showFlags && feat.doc.placeholder && <PlaceholderFlag>Aguardando aprovação</PlaceholderFlag>}
              </p>
              <h2 id={`feat-${feat.doc.slug}`} className="hm-h2 mt-5 max-w-[22ch]">{feat.doc.data.title}</h2>
              {feat.doc.data.summary && <p className="mt-4 max-w-[60ch] leading-relaxed text-[#6f6e6b]">{feat.doc.data.summary}</p>}
            </div>
            <Link href={`/projetos/${feat.doc.slug}`} className="hm-btn hm-btn--ink shrink-0">
              <span>Ver projeto</span>
              <span className="hm-btn-ico" aria-hidden="true">
                <svg viewBox="0 0 16 16"><path d="M4 12 12 4M5.5 4H12v6.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </Link>
          </div>
        </article>
      )}

      {list.length ? (
        <div className={feat ? 'mt-16 lg:mt-24' : 'mt-12'}>
          <ProjectRows key={`${sector}-${comp}`} items={list} showFlags={showFlags} />
        </div>
      ) : (
        <div className="mt-12 rounded-[24px] bg-[#f4f3f0] p-8">
          <p className="font-display text-xl font-medium">Nenhum projeto com essa combinação.</p>
          <button type="button" className="hm-btn hm-btn--line mt-5 !min-h-[44px]" onClick={() => { setSector(''); setComp(''); }}>Limpar filtros</button>
        </div>
      )}
    </div>
  );
}
