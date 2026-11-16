import Link from 'next/link';
import type { ElementType, ReactNode } from 'react';
import type { Cta, Doc } from '@/lib/cms/content';
import { breadcrumbLd } from '@/lib/seo';
import { JsonLd } from '../site/JsonLd';
import { PlaceholderFlag } from '../ui/Duo';
import { Arrow, HButton, HTitle, Kicker } from './parts';
import { ObjParallax } from './ObjParallax';

/* ═════════ Sistema boutique 2027 — páginas internas ═════════
 * Mesma linguagem aprovada na Home: fundo de tela névoa, painéis arredondados (branco, névoa, preto),
 * Outfit 500 com tracking fechado, segunda linha do título em cinza, vinho e âmbar só em detalhes.
 * Nenhum texto novo: os componentes só organizam o conteúdo que vem do CMS.
 */

type HeroData = { eyebrow?: string; title?: string; text?: string; cta?: Cta; cta2?: Cta };
type Tone = 'white' | 'mist' | 'ink' | 'hero';
const TONE: Record<Tone, string> = { white: '', mist: 'hm-panel--mist', ink: 'hm-panel--ink', hero: 'hm-panel--hero' };
export const nn = (n: number) => String(n).padStart(2, '0');

export function BPage({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`hm hm-stack ${className}`}>{children}</div>;
}

export function Panel({
  tone = 'white',
  glow = false,
  id,
  labelledby,
  label,
  className = '',
  inner = 'hm-pad',
  as: Tag = 'section',
  children,
}: {
  tone?: Tone;
  glow?: boolean;
  id?: string;
  labelledby?: string;
  label?: string;
  className?: string;
  inner?: string;
  as?: ElementType;
  children: ReactNode;
}) {
  return (
    <Tag id={id} aria-labelledby={labelledby} aria-label={label} className={`hm-panel ${TONE[tone]} ${glow ? 'hm-glow' : ''} ${className}`}>
      <div className={`hm-in relative ${inner}`}>{children}</div>
    </Tag>
  );
}

/** Trilha de navegação visível + JSON-LD BreadcrumbList. */
export function BCrumbs({ items, dark = false }: { items: { name: string; path: string }[]; dark?: boolean }) {
  const all = [{ name: 'Início', path: '/' }, ...items];
  return (
    <>
      <nav aria-label="Trilha de navegação" className={`hm-crumbs ${dark ? 'hm-crumbs--dark' : ''}`}>
        <ol>
          {all.map((it, i) => (
            <li key={it.path}>
              {i === all.length - 1 ? <span aria-current="page">{it.name}</span> : <Link href={it.path}>{it.name}</Link>}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbLd(all)} />
    </>
  );
}

/** Objeto 3D renderizado offline (imagem com fundo transparente), flutuando com sombra de contato. */
export function Object3D({ src, srcSet, sizes = '(min-width:1024px) 34vw, 46vw', priority = false, className = '', delay = 0 }: { src: string; srcSet?: string; sizes?: string; priority?: boolean; className?: string; delay?: number }) {
  return (
    <span className={`hm-obj ${className}`} aria-hidden="true" style={delay ? { ['--d' as string]: `${delay}s` } : undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} srcSet={srcSet} sizes={srcSet ? sizes : undefined} alt="" width={720} height={720} decoding="async" loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : undefined} />
    </span>
  );
}

/** Hero das páginas internas: painel claro (ou preto), selo, título em duas tonalidades, texto e CTAs. */
export function BHero({
  hero,
  crumbs,
  ctaTrack = 'hero',
  visual,
  tone = 'light',
  size = 'page',
  children,
}: {
  hero?: HeroData;
  crumbs?: { name: string; path: string }[];
  ctaTrack?: string;
  visual?: ReactNode;
  tone?: 'light' | 'ink';
  size?: 'page' | 'mega';
  children?: ReactNode;
}) {
  if (!hero) return null;
  const dark = tone === 'ink';
  const hasFoot = hero.text || hero.cta?.label || hero.cta2?.label;
  return (
    <section className={`hm-panel hm-ihero ${dark ? 'hm-panel--ink hm-glow' : 'hm-panel--hero'} ${visual ? 'hm-ihero--vis' : ''}`} aria-labelledby="page-title">
      {visual && <div className="hm-ihero-vis">{visual}</div>}
      {visual && <ObjParallax />}
      <div className="hm-in hm-ihero-in relative">
        {crumbs && <BCrumbs items={crumbs} dark={dark} />}
        <div className={`hero-seq hm-ihero-title ${visual ? 'lg:max-w-[62%]' : 'max-w-[72rem]'}`}>
          {hero.eyebrow ? <p className={`hm-pill ${dark ? 'hm-pill--dark' : ''}`}><i aria-hidden="true" />{hero.eyebrow}</p> : null}
          <HTitle as="h1" id="page-title" text={hero.title} className={`hm-h1 ${size === 'mega' ? '' : 'hm-h1--page'} ${hero.eyebrow ? 'mt-7' : ''}`} />
        </div>
        {hasFoot ? (
          <div className={`hero-seq mt-10 grid gap-8 border-t pt-8 lg:mt-14 lg:grid-cols-12 lg:items-end ${dark ? 'border-white/10' : 'border-black/10'}`}>
            {hero.text ? <p className={`hm-lead max-w-[50ch] lg:col-span-7 ${dark ? '' : '!text-[#4b4a47]'}`}>{hero.text}</p> : <span className="lg:col-span-7" />}
            <div className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
              <HButton href={hero.cta?.href} label={hero.cta?.label} variant={dark ? 'white' : 'ink'} track={`${ctaTrack}_primary`} />
              <HButton href={hero.cta2?.href} label={hero.cta2?.label} variant={dark ? 'line-dark' : 'line'} track={`${ctaTrack}_secondary`} />
            </div>
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}

/** Cabeçalho de seção: numeral, título (linha 2 em cinza) e texto/CTA à direita. */
export function BHead({
  n,
  title,
  text,
  id,
  cta,
  ctaVariant = 'ink',
  track,
  wide = false,
  as,
  children,
}: {
  n?: number;
  title?: string;
  text?: string;
  id?: string;
  cta?: Cta;
  ctaVariant?: 'ink' | 'white' | 'line' | 'line-dark';
  track?: string;
  wide?: boolean;
  as?: ElementType;
  children?: ReactNode;
}) {
  if (!title && !text && !children) return null;
  const side = text || cta?.label || children;
  return (
    <div className="grid gap-10 lg:grid-cols-12" data-reveal>
      <div className={wide ? 'lg:col-span-8' : 'lg:col-span-7'}>
        {n != null && <Kicker>{nn(n)}</Kicker>}
        <HTitle as={as} id={id} text={title} className={`hm-h2 ${n != null ? 'mt-8' : ''}`} />
      </div>
      {side ? (
        <div className={`lg:self-end ${wide ? 'lg:col-span-4' : 'lg:col-span-4 lg:col-start-9'}`}>
          {text && <p className="hm-lead">{text}</p>}
          {cta?.label ? <div className={text ? 'mt-8' : ''}><HButton href={cta.href} label={cta.label} variant={ctaVariant} track={track} /></div> : null}
          {children}
        </div>
      ) : null}
    </div>
  );
}

/** Lista de itens (serviços, frentes, segmentos, valores) em cartões. Itens só com título ganham escala maior. */
export function BItems({ items, numbered = false, dark = false, cols = 3, className = '' }: { items?: { title: string; text?: string }[]; numbered?: boolean; dark?: boolean; cols?: 2 | 3 | 4; className?: string }) {
  if (!items?.length) return null;
  const titlesOnly = items.every((it) => !it.text);
  const grid = cols === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : cols === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3';
  return (
    <ul className={`grid gap-2.5 ${grid} ${className}`} data-reveal role="list">
      {items.map((it, i) => (
        <li key={i} data-stagger style={{ ['--i' as string]: i % 8 }} className={`hm-item ${dark ? 'hm-item--dark' : ''} flex flex-col p-7 lg:p-8 ${titlesOnly ? 'min-h-[180px]' : 'min-h-[220px]'}`}>
          <span className="hm-num" aria-hidden="true">{numbered ? nn(i + 1) : <i className="hm-dot" />}</span>
          <h3 className={`mt-auto pt-10 font-display font-medium tracking-[-0.03em] ${titlesOnly ? 'text-[clamp(1.35rem,1.9vw,1.75rem)] leading-[1.1]' : 'text-[1.3rem] leading-[1.15]'}`}>{it.title}</h3>
          {it.text && <p className="hm-item-t mt-2.5 leading-relaxed">{it.text}</p>}
        </li>
      ))}
    </ul>
  );
}

type MetricData = { value: string; label: string; detail?: string; validated?: boolean };
export function BMetrics({ metrics, dark = false }: { metrics: Doc<MetricData>[]; dark?: boolean }) {
  if (!metrics.length) return null;
  return (
    <dl className={`grid gap-2.5 ${metrics.length >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`} data-reveal>
      {metrics.map((m, i) => (
        <div key={m.id} data-stagger style={{ ['--i' as string]: i }} className={`hm-metric ${dark ? 'hm-metric--dark' : ''} flex min-h-[240px] flex-col justify-between p-7 lg:min-h-[290px] lg:p-9`}>
          <dt className="sr-only">{m.data.label}</dt>
          <dd className="contents">
            <span className="flex items-start justify-between gap-3">
              <span className="hm-num">{nn(i + 1)}</span>
              {!m.data.validated && <PlaceholderFlag>Confirmar antes de publicar</PlaceholderFlag>}
            </span>
            <span>
              <span className="block font-display text-[clamp(3.6rem,7.5vw,7rem)] font-medium leading-[.85] tracking-[-0.06em]">
                {m.data.value.replace('+', '')}
                {m.data.value.includes('+') && <span className="text-ambar">+</span>}
              </span>
              <span className="mt-5 block font-display text-lg font-medium tracking-[-0.01em]">{m.data.label}</span>
              {m.data.detail && <span className={`mt-0.5 block text-sm ${dark ? 'text-[#a4a3a0]' : 'text-[#6f6e6b]'}`}>{m.data.detail}</span>}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Índice de frentes/especialidades em cartões (mesma família dos cartões da Home). */
export function BIndex({ items, base, prefix = '', dark = false, icons = false, linkLabel }: { items: { slug: string; name: string; tagline?: string }[]; base: string; prefix?: string; dark?: boolean; icons?: boolean; linkLabel?: string }) {
  return (
    <ul className={`grid gap-2.5 sm:grid-cols-2 ${items.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`} data-reveal role="list">
      {items.map((s, i) => (
        <li key={s.slug} data-stagger style={{ ['--i' as string]: i }}>
          <Link href={`${base}/${s.slug}`} className={`hm-card ${dark ? 'hm-eco' : 'hm-spec'} group flex h-full min-h-[300px] flex-col p-7 lg:min-h-[400px] lg:p-8`}>
            <span className="flex h-11 items-start justify-between">
              <span className={`hm-num pt-0.5 ${dark ? '!text-[#8f8e8b]' : ''}`}>{nn(i + 1)}</span>
              <span className="hm-card-arrow" aria-hidden="true"><Arrow /></span>
            </span>
            {icons ? (
              <span className="hm-eco-ico" aria-hidden="true" style={{ ['--d' as string]: `${i * -1.6}s` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/home/icone-${s.slug}.webp`} alt="" width={360} height={360} loading="lazy" decoding="async" />
              </span>
            ) : null}
            <span className={`${icons ? 'mt-8' : 'mt-16 lg:mt-24'} block min-h-[2.08em] font-display text-[clamp(1.55rem,1.95vw,2.05rem)] font-medium leading-[1.04] tracking-[-0.035em]`}>
              {prefix ? <span className={`block ${dark ? 'text-[#8f8e8b]' : 'text-[#81807c] group-hover:text-[#8f8e8b]'}`}>{prefix.trim()}</span> : null}
              <span className="block">{s.name}</span>
            </span>
            {s.tagline && <span className={`${dark ? 'text-[#a4a3a0]' : 'hm-spec-tag'} mt-4 block leading-relaxed`}>{s.tagline}</span>}
            {linkLabel ? <span className="hm-link mt-auto pt-8 text-sm"><span>{linkLabel}</span></span> : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Chamada final: painel preto com a escultura da asa em preto acetinado. */
export function BFinal({ data, track = 'final', n, sculpture = true }: { data?: { title?: string; text?: string; cta?: Cta }; track?: string; n?: number; sculpture?: boolean }) {
  if (!data?.title) return null;
  return (
    <section className="hm-panel hm-panel--ink hm-glow" aria-labelledby={`${track}-title`}>
      {sculpture && (
        <div aria-hidden="true" className="hm-final-sculpt hidden md:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/home/asa-noir.webp" alt="" loading="lazy" decoding="async" className="hm-float" />
        </div>
      )}
      <div className="hm-in relative hm-pad lg:py-36">
        <div className="max-w-[min(100%,46rem)]" data-reveal>
          {n != null && <Kicker>{nn(n)}</Kicker>}
          <HTitle id={`${track}-title`} text={data.title} className={`hm-h1 hm-h1--final ${n != null ? 'mt-8' : ''}`} />
        </div>
        <div className="mt-12 grid max-w-[46rem] gap-8" data-reveal>
          {data.text && <p className="hm-lead max-w-[44ch]">{data.text}</p>}
          <div><HButton href={data.cta?.href} label={data.cta?.label} variant="white" track={track} /></div>
        </div>
      </div>
    </section>
  );
}
