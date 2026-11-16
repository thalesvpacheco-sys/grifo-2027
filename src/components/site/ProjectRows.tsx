import Link from 'next/link';
import type { Doc } from '@/lib/cms/content';
import type { SizedImg } from '@/lib/media-meta';
import { SECTORS, COMPETENCIES } from '@/lib/cms/schema';
import { PlaceholderFlag } from '../ui/Duo';
import { Wing } from '../brand/Logo';
import type { CaseData } from './cards';

export type ProjectItem = { doc: Doc<CaseData>; cover?: SizedImg };
const label = (list: { value: string; label: string }[], v?: string) => list.find((x) => x.value === v)?.label ?? v ?? '';

/** Miniatura do projeto: a imagem aparece pequena (nítida mesmo em arquivos de baixa resolução); sem imagem, monograma. */
export function ProjectThumb({ item, className = '' }: { item: ProjectItem; className?: string }) {
  const c = item.cover;
  return (
    <span className={`pj-thumb ${className}`} aria-hidden="true">
      {c?.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={c.src} alt="" loading="lazy" decoding="async" width={c.w || 320} height={c.h || 240} />
      ) : (
        <span className="pj-mono">
          <Wing className="h-4 w-7 text-ambar" />
          <b>{item.doc.data.title.slice(0, 2)}</b>
        </span>
      )}
    </span>
  );
}

/** Índice editorial de projetos: uma linha por projeto (número, miniatura, título, setor, competências e ano). */
export function ProjectRows({ items, showFlags = false, start = 1 }: { items: ProjectItem[]; showFlags?: boolean; start?: number }) {
  return (
    <ol className="pj-list" role="list">
      {items.map((it, i) => {
        const d = it.doc.data;
        return (
          <li key={it.doc.id}>
            <article className="pj-row group">
              <span className="pj-n" aria-hidden="true">{String(i + start).padStart(2, '0')}</span>
              <ProjectThumb item={it} />
              <div className="pj-main">
                <h3 className="pj-title">
                  <Link href={`/projetos/${it.doc.slug}`} className="after:absolute after:inset-0 after:rounded-[22px] after:content-['']">{d.title}</Link>
                </h3>
                {d.summary && <p className="pj-sum">{d.summary}</p>}
              </div>
              <p className="pj-meta">
                <span className="hm-tag hm-tag--sector">{label(SECTORS, d.sector)}</span>
                {d.competencies?.map((c) => <span key={c} className="hm-tag">{label(COMPETENCIES, c)}</span>)}
                {showFlags && it.doc.placeholder && <PlaceholderFlag>Aguardando aprovação</PlaceholderFlag>}
              </p>
              <span className="pj-year">{d.year || '—'}</span>
              <span className="pj-arrow" aria-hidden="true">
                <svg viewBox="0 0 16 16"><path d="M4 12 12 4M5.5 4H12v6.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </article>
          </li>
        );
      })}
    </ol>
  );
}
