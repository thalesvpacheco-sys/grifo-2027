import Link from 'next/link';
import type { Cta, Doc } from '@/lib/cms/content';
import { Duo, PlaceholderFlag } from '../ui/Duo';
import { CtaLink } from '../ui/ButtonLink';
import { JsonLd } from './JsonLd';
import { breadcrumbLd } from '@/lib/seo';
import { StudioFinal } from './studio';
import { Media, CaseCard, ArticleCard, formatDate, type CaseData, type ArticleData } from './cards';
export { Media, CaseCard, ArticleCard, formatDate, type CaseData, type ArticleData };

export type HeroData = { eyebrow?: string; title?: string; text?: string; cta?: Cta; cta2?: Cta };

/* ───────── Breadcrumb visível + JSON-LD ───────── */
export function Breadcrumbs({ items, tone = 'dark' }: { items: { name: string; path: string }[]; tone?: 'dark' | 'light' }) {
  const all = [{ name: 'Início', path: '/' }, ...items];
  return (
    <>
      <nav aria-label="Trilha de navegação" className={`text-sm ${tone === 'dark' ? 'text-white/55' : 'text-grafite/70'}`}>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {all.map((it, i) => (
            <li key={it.path} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden="true">/</span>}
              {i === all.length - 1 ? (
                <span aria-current="page" className={tone === 'dark' ? 'text-white/85' : 'text-grafite'}>{it.name}</span>
              ) : (
                <Link href={it.path} className="link-underline hover:text-current">{it.name}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbLd(all)} />
    </>
  );
}

/* ───────── Hero de páginas internas ─────────
 * 2027: superfície grafite com brilho metálico sutil (sem WebGL), título em escala editorial,
 * faixas da asa em grande escala e filete de base. Variações por tom (grafite / vinho).
 */
export function PageHero({
  hero,
  crumbs,
  tone = 'grafite',
  aside,
  ctaTrack = 'hero',
  size = 'h1',
  children,
}: {
  hero?: HeroData;
  crumbs?: { name: string; path: string }[];
  tone?: 'grafite' | 'vinho';
  aside?: React.ReactNode;
  ctaTrack?: string;
  size?: 'h1' | 'mega';
  children?: React.ReactNode;
}) {
  if (!hero) return null;
  const v = tone === 'vinho';
  return (
    <section className={`relative isolate overflow-hidden pb-16 pt-[calc(var(--header-h)+44px)] text-white sm:pb-24 ${v ? 'surface-vinho' : 'surface-sheen'}`}>
      {!aside && <HeroWings tone={tone} />}
      <div className="wrap relative">
        {crumbs && <Breadcrumbs items={crumbs} />}
        <div className={`mt-12 grid items-end gap-12 sm:mt-16 ${aside ? 'lg:grid-cols-12' : ''}`}>
          <div className={`hero-seq ${aside ? 'lg:col-span-7' : 'max-w-[68rem]'}`}>
            {hero.eyebrow ? <p className={`eyebrow ${v ? 'text-[#ffd18a]' : 'text-ambar'}`}>{hero.eyebrow}</p> : <span />}
            <Duo as="h1" text={hero.title} className={`mt-6 ${size === 'mega' ? 'text-mega' : 'text-h1'}`} />
            {hero.text ? <p className="mt-8 max-w-2xl text-lead text-white/80">{hero.text}</p> : <span />}
            {hero.cta?.label || hero.cta2?.label ? (
              <div className="mt-10 flex flex-wrap gap-3">
                <CtaLink cta={hero.cta} track={`${ctaTrack}_primary`} />
                <CtaLink cta={hero.cta2} variant="ghost-dark" track={`${ctaTrack}_secondary`} />
              </div>
            ) : (
              <span />
            )}
          </div>
          {aside && <div className="lg:col-span-5">{aside}</div>}
        </div>
        {children}
        <span aria-hidden="true" className="mt-16 block h-px w-full bg-white/12 sm:mt-20" />
      </div>
    </section>
  );
}

/** As três faixas da asa, em grande escala, entrando uma única vez no carregamento. */
export function HeroWings({ tone = 'grafite' }: { tone?: 'grafite' | 'vinho' }) {
  const c = tone === 'vinho' ? ['bg-[#a8352f]/70', 'bg-[#a8352f]/45', 'bg-ambar/30'] : ['bg-vinho/45', 'bg-vinho/25', 'bg-ambar/15'];
  return (
    <div aria-hidden="true" className="pointer-events-none absolute -right-[6vw] bottom-[14%] -z-10 hidden w-[34vw] max-w-[600px] flex-col gap-[1.2vw] lg:flex">
      <span className={`wing-bar block h-[3.4vw] max-h-[58px] rounded-l-[999px] ${c[0]}`} />
      <span className={`wing-bar ml-[14%] block h-[3.4vw] max-h-[58px] rounded-l-[999px] ${c[1]}`} />
      <span className={`wing-bar ml-[28%] block h-[3.4vw] max-h-[58px] rounded-l-[999px] ${c[2]}`} />
    </div>
  );
}

/* ───────── Cabeçalho de seção ───────── */
export function SectionHead({ title, text, tone = 'light', className = '', id, children }: { title?: string; text?: string; tone?: 'light' | 'dark'; className?: string; id?: string; children?: React.ReactNode }) {
  if (!title && !text) return null;
  return (
    <div className={`grid gap-6 lg:grid-cols-12 lg:gap-12 ${className}`}>
      <div className="lg:col-span-7">
        <span className="bar mb-6" aria-hidden="true" />
        <Duo id={id} text={title} className={`text-h2 ${tone === 'dark' ? 'text-white' : 'text-grafite'}`} />
      </div>
      {(text || children) && (
        <div className="self-end lg:col-span-5">
          {text && <p className={`text-lead ${tone === 'dark' ? 'text-white/70' : 'text-grafite/70'}`}>{text}</p>}
          {children}
        </div>
      )}
    </div>
  );
}

/* ───────── Chamada final ───────── */
export function FinalCta({ data, track = 'final', tone = 'paper' }: { data?: { title?: string; text?: string; cta?: Cta }; track?: string; tone?: 'vinho' | 'grafite' | 'paper' }) {
  return <StudioFinal data={data} track={track} tone={tone === 'vinho' ? 'vinho' : 'paper'} />;
}

export type MetricData = { value: string; label: string; detail?: string; validated?: boolean; contexts?: string[] };

export function MetricsRow({ metrics, tone = 'light' }: { metrics: Doc<MetricData>[]; tone?: 'light' | 'dark' }) {
  if (!metrics.length) return null;
  return (
    <dl className="grid gap-10 sm:grid-cols-3">
      {metrics.map((m) => (
        <div key={m.id} className={`border-t pt-5 ${tone === 'dark' ? 'border-white/20' : 'border-grafite/25'}`}>
          <dt className="sr-only">{m.data.label}</dt>
          <dd>
            <span className={`block font-display text-[clamp(3.5rem,8vw,6.5rem)] font-extrabold leading-none tracking-[-0.04em] ${tone === 'dark' ? 'text-white' : 'text-grafite'}`}>
              {m.data.value.replace('+', '')}
              {m.data.value.includes('+') && <span className="text-ambar">+</span>}
            </span>
            <span className="mt-3 block font-display text-lg font-semibold">{m.data.label}</span>
            {m.data.detail && <span className={`block text-sm ${tone === 'dark' ? 'text-white/60' : 'text-grafite/70'}`}>{m.data.detail}</span>}
            {!m.data.validated && (
              <span className="mt-3 block">
                <PlaceholderFlag>Confirmar antes de publicar</PlaceholderFlag>
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Lista de itens (serviços, frentes, segmentos) em grade editorial com numeração só quando é sequência.
 *  Itens só com título (sem descrição) ganham escala tipográfica maior para não parecerem vazios. */
export function ItemGrid({ items, numbered = false, tone = 'light', cols = 3 }: { items?: { title: string; text?: string }[]; numbered?: boolean; tone?: 'light' | 'dark'; cols?: 2 | 3 }) {
  if (!items?.length) return null;
  const titlesOnly = items.every((it) => !it.text);
  return (
    <ul className={`grid gap-x-10 gap-y-2 sm:grid-cols-2 ${cols === 3 ? 'lg:grid-cols-3' : ''}`} data-reveal>
      {items.map((it, i) => (
        <li key={i} data-stagger style={{ ['--i' as string]: i }} className={`flex gap-5 border-t ${titlesOnly ? 'py-8' : 'py-6'} ${tone === 'dark' ? 'border-white/15' : 'border-grafite/15'}`}>
          {numbered && <span className={`font-display text-2xl font-light tabular-nums ${tone === 'dark' ? 'text-ambar' : 'text-vinho'}`}>{String(i + 1).padStart(2, '0')}</span>}
          <div>
            <h3 className={`font-display ${titlesOnly ? 'text-[clamp(1.35rem,2vw,1.75rem)] font-semibold leading-snug tracking-[-0.015em]' : 'text-xl font-semibold'} ${tone === 'dark' ? 'text-white' : 'text-grafite'}`}>{it.title}</h3>
            {it.text && <p className={`mt-1.5 leading-relaxed ${tone === 'dark' ? 'text-white/65' : 'text-grafite/65'}`}>{it.text}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
