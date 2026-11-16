import Link from 'next/link';
import type { Doc } from '@/lib/cms/content';
import type { SizedImg } from '@/lib/media-meta';
import { SECTORS, COMPETENCIES } from '@/lib/cms/schema';
import { PlaceholderFlag } from '../ui/Duo';
import { Wing } from '../brand/Logo';
import { Frame } from './studio';
import type { CaseData } from './cards';

export type ShowcaseItem = { doc: Doc<CaseData>; cover?: SizedImg };

const label = (list: { value: string; label: string }[], v?: string) => list.find((x) => x.value === v)?.label ?? v ?? '';

/**
 * Vitrine de projetos (mesmo ritmo aprovado na Home), na ordem do CMS:
 *  - banners horizontais em boa resolução ocupam a linha inteira, na proporção do arquivo (nada cortado);
 *  - os demais formam pares 7/5 e 5/7 de mesma altura;
 *  - pares sem imagem ficam baixos (sem quadro gigante vazio).
 * `compact`: grade regular de três colunas (filtros ativos, relacionados).
 */
type Slot = { cell: string; ratio: string };
function pack(items: ShowcaseItem[], compact: boolean): Slot[] {
  if (compact) return items.map(() => ({ cell: 'lg:col-span-4', ratio: '4:3' }));
  const slots: Slot[] = [];
  const wide = (i: number) => { const c = items[i].cover; return !!c?.src && !c.lowres && !!c.w && !!c.h && c.w / c.h > 2.1; };
  let flip = false;
  for (let i = 0; i < items.length; ) {
    if (wide(i)) { slots[i] = { cell: 'lg:col-span-12', ratio: '' }; i += 1; continue; }
    const j = i + 1 < items.length && !wide(i + 1) ? i + 1 : -1;
    if (j < 0) { slots[i] = { cell: items[i].cover?.src ? 'lg:col-span-12' : 'lg:col-span-6', ratio: items[i].cover?.src ? '21:9' : '16:10' }; i += 1; continue; }
    const empty = !items[i].cover?.src && !items[j].cover?.src;
    const [a, b] = flip ? ['lg:col-span-5', 'lg:col-span-7'] : ['lg:col-span-7', 'lg:col-span-5'];
    slots[i] = { cell: a, ratio: empty ? 'empty' : a.endsWith('7') ? '16:10' : '8:7' };
    slots[j] = { cell: b, ratio: empty ? 'empty' : b.endsWith('7') ? '16:10' : '8:7' };
    flip = !flip;
    i += 2;
  }
  return slots;
}

export function PortfolioShowcase({ items, showFlags = false, compact = false }: { items: ShowcaseItem[]; showFlags?: boolean; compact?: boolean }) {
  if (!items.length) return null;
  const slots = pack(items, compact);
  return (
    <ul className="grid gap-x-2.5 gap-y-12 sm:grid-cols-2 lg:grid-cols-12" data-reveal role="list">
      {items.map(({ doc, cover }, i) => {
        const r = slots[i];
        const full = r.cell.includes('12');
        const d = doc.data;
        return (
          <li key={doc.id} data-stagger style={{ ['--i' as string]: i % 6 }} className={`${compact ? '' : 'sm:col-span-2'} ${r.cell}`}>
            <article className="hm-work group relative">
              <div className="hm-work-media">
                {cover?.src ? (
                  <Frame img={cover} ratio={r.ratio || undefined} sizes={full ? '(min-width:1024px) 90vw, 100vw' : compact ? '(min-width:1024px) 30vw, (min-width:640px) 50vw, 100vw' : '(min-width:1024px) 55vw, 100vw'} className="rounded-[22px]" showFlags={showFlags} />
                ) : (
                  <div className={`relative flex items-center justify-center ${r.ratio === 'empty' ? 'h-[220px] lg:h-[260px]' : r.ratio === '8:7' ? 'aspect-[8/7]' : r.ratio === '4:3' ? 'aspect-[4/3]' : 'aspect-[16/10]'}`} role="img" aria-label="Imagem pendente">
                    <Wing className="h-10 w-16 text-black/10" />
                    <span className="absolute bottom-4 left-4 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-black/55">Imagem pendente</span>
                  </div>
                )}
              </div>
              <div className="mt-5 flex items-start justify-between gap-6 px-1">
                <div>
                  <h3 className="hm-h3">
                    <Link href={`/projetos/${doc.slug}`} className="after:absolute after:inset-0 after:rounded-[22px] after:content-['']">{d.title}</Link>
                  </h3>
                  <p className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="hm-tag hm-tag--sector">{label(SECTORS, d.sector)}</span>
                    {d.competencies?.map((c) => <span key={c} className="hm-tag">{label(COMPETENCIES, c)}</span>)}
                    {d.year ? <span className="hm-tag">{d.year}</span> : null}
                    {doc.placeholder && <PlaceholderFlag>Aguardando aprovação</PlaceholderFlag>}
                  </p>
                  {d.summary && <p className="mt-3 max-w-[52ch] text-[0.98rem] leading-relaxed text-[#6f6e6b]">{d.summary}</p>}
                </div>
                <span className="hm-card-arrow mt-1 shrink-0 bg-[#f4f3f0] text-[#0f0f10] transition-colors group-hover:bg-[#0f0f10] group-hover:text-white" aria-hidden="true">
                  <svg viewBox="0 0 16 16"><path d="M4 12 12 4M5.5 4H12v6.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
