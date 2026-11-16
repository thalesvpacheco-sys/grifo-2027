import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDoc, listDocs, placeholdersVisible, type Img } from '@/lib/cms/content';
import { buildMetadata } from '@/lib/seo';
import { renderMarkdown } from '@/lib/markdown';
import { sized, type SizedImg } from '@/lib/media-meta';
import { type CaseData } from '@/components/site/blocks';
import { BCrumbs, BFinal, BPage } from '@/components/home/boutique';
import { Frame, RATIO } from '@/components/site/studio';
import { ProjectRows, ProjectThumb } from '@/components/site/ProjectRows';
import { Gallery, type GalleryItem } from '@/components/case/Gallery';
import { MotionLoop } from '@/components/case/MotionLoop';
import { VideoOnDemand } from '@/components/visual/VideoOnDemand';
import { Duo, PlaceholderFlag } from '@/components/ui/Duo';
import { TrackView } from '@/components/site/TrackView';
import { JsonLd } from '@/components/site/JsonLd';
import { SECTORS, COMPETENCIES, CASE_CHAPTERS } from '@/lib/cms/schema';
import { env } from '@/lib/env';

/* ═════════ Case Study Studio ═════════
 * Narrativa montada por blocos editáveis no painel. Cases sem blocos continuam funcionando:
 * os campos existentes (Contexto, Desafio, Estratégia, Execução, Resultados, Galeria) viram capítulos,
 * em ordem e tratamento visual definidos pela linguagem do projeto (setor ou escolha no painel).
 * Nenhum bloco aparece sem dado real.
 */

type Video = { src: string; poster?: string };
type MediaItem = { image?: Img; video?: Video; title?: string; channel?: string; caption?: string; ratio?: string };
type Block = {
  type: string;
  hidden?: boolean;
  chapter?: string;
  eyebrow?: string;
  title?: string;
  text?: string;
  image?: Img;
  video?: Video;
  poster?: Img;
  ratio?: string;
  imageSide?: string;
  gallery?: string;
  items?: MediaItem[];
  steps?: { label?: string; text?: string }[];
  quote?: string;
  source?: string;
  metrics?: { value?: string; label?: string; source?: string; verified?: boolean }[];
  credits?: string[];
  cases?: string[];
  next?: string;
};
type Case = CaseData & {
  context?: string;
  challenge?: string;
  strategy?: string;
  execution?: string;
  results?: string;
  gallery?: { image: Img; caption?: string }[];
  credits?: string[];
  layout?: string;
  heroMedia?: { video?: Video; poster?: Img };
  blocks?: Block[];
};
type P = { params: Promise<{ slug: string }> };
type Chapter = 'context' | 'challenge' | 'strategy' | 'execution' | 'results' | 'gallery';

export async function generateMetadata({ params }: P) {
  const { slug } = await params;
  const d = await getDoc<Case>('case', slug);
  if (!d) return {};
  const meta = await buildMetadata({ path: `/projetos/${slug}`, seo: d.seo, title: d.data.title, description: d.data.summary, image: d.data.cover?.src });
  // Cases pendentes nunca são indexados (aparecem apenas em pré-visualização/homologação).
  return d.placeholder ? { ...meta, robots: { index: false, follow: false } } : meta;
}

/* Linguagem visual por tipo de projeto: muda superfícies, ordem padrão e tratamento da galeria. */
const THEMES = {
  imobiliario: { order: ['context', 'challenge', 'strategy', 'execution', 'gallery', 'results'], gallery: 'mosaic', surface: 'surface-paper', tone: 'light', opening: 'surface-sheen' },
  educacao: { order: ['context', 'challenge', 'strategy', 'gallery', 'execution', 'results'], gallery: 'grid', surface: 'surface-white', tone: 'light', opening: 'surface-vinho' },
  automotivo: { order: ['context', 'challenge', 'gallery', 'strategy', 'execution', 'results'], gallery: 'stack', surface: 'surface-ink', tone: 'dark', opening: 'surface-ink' },
  branding: { order: ['context', 'gallery', 'strategy', 'execution', 'challenge', 'results'], gallery: 'mosaic', surface: 'surface-paper', tone: 'light', opening: 'surface-sheen' },
  editorial: { order: ['context', 'challenge', 'strategy', 'execution', 'gallery', 'results'], gallery: 'mosaic', surface: 'surface-paper', tone: 'light', opening: 'surface-sheen' },
} as const;
type ThemeKey = keyof typeof THEMES;
const themeFor = (c: Case): ThemeKey =>
  c.layout && c.layout in THEMES ? (c.layout as ThemeKey) : c.sector === 'imobiliario' ? 'imobiliario' : c.sector === 'educacao' ? 'educacao' : c.sector === 'concessionarias' ? 'automotivo' : 'editorial';

const chapterLabel = (k: string) => CASE_CHAPTERS.find((x) => x.value === k)?.label ?? k;

async function toGallery(items: MediaItem[] | undefined): Promise<GalleryItem[]> {
  return Promise.all(
    (items ?? []).map(async (m) => {
      const s = (await sized(m.image)) as SizedImg | undefined;
      return { src: s?.src || '', alt: s?.alt || m.title || '', w: s?.w, h: s?.h, lowres: s?.lowres, title: m.title, channel: m.channel, caption: m.caption, ratio: m.ratio, video: m.video?.src ? { src: m.video.src, poster: m.video.poster } : undefined };
    }),
  );
}

export default async function CasePage({ params }: P) {
  const { slug } = await params;
  const d = await getDoc<Case>('case', slug);
  if (!d) notFound();
  const c = d.data;
  const [all, showFlags] = await Promise.all([listDocs<Case>('case'), placeholdersVisible()]);
  const theme = THEMES[themeFor(c)];
  const dark = theme.tone === 'dark';
  const sector = SECTORS.find((s) => s.value === c.sector);
  const cover = await sized(c.cover);
  // arquivo pequeno: vira "peça impressa" no hero, exibida no tamanho real (nunca ampliada e borrada)
  const plate = !!cover?.src && !!cover.lowres && !c.heroMedia?.video?.src;
  const blocks = (c.blocks ?? []).filter((b) => b.type && !b.hidden);
  const placed = new Set(blocks.filter((b) => b.type === 'chapter' && b.chapter).map((b) => b.chapter as Chapter));

  // Sequência final: blocos do painel; capítulos existentes não posicionados entram na ordem padrão do tema
  // (narrativa antes dos blocos; galeria e resultados depois).
  type Step = { kind: 'chapter'; chapter: Chapter; block?: Block } | { kind: 'block'; block: Block };
  const legacyHas = (k: Chapter) => (k === 'gallery' ? !!c.gallery?.length : !!c[k]);
  const before: Step[] = [], after: Step[] = [];
  for (const k of theme.order as readonly Chapter[]) {
    if (placed.has(k) || !legacyHas(k)) continue;
    (blocks.length && (k === 'gallery' || k === 'results') ? after : before).push({ kind: 'chapter', chapter: k });
  }
  const middle: Step[] = blocks.map((b) => (b.type === 'chapter' && b.chapter ? { kind: 'chapter', chapter: b.chapter as Chapter, block: b } : { kind: 'block', block: b }));
  const sequence = [...before, ...middle, ...after];
  // numeração dos capítulos de texto calculada antes da renderização (determinística)
  const nums = new Map<number, number>();
  sequence.forEach((st, k) => {
    if (st.kind === 'chapter' && st.chapter !== 'gallery' && c[st.chapter]) nums.set(k, nums.size + 1);
  });

  // Navegação real entre cases visíveis (publicados; em homologação inclui pendentes sinalizados).
  const i = all.findIndex((x) => x.slug === slug);
  const others = all.filter((x) => x.slug !== slug);
  const explicitNext = blocks.find((b) => b.type === 'nextProject')?.next;
  const next = (explicitNext && others.find((x) => x.slug === explicitNext)) || (all.length > 1 ? all[(i + 1) % all.length] : undefined);
  const prev = all.length > 2 ? all[(i - 1 + all.length) % all.length] : undefined;
  const relBlock = blocks.find((b) => b.type === 'relatedProjects');
  const relatedDocs = relBlock?.cases?.length ? others.filter((x) => relBlock.cases!.includes(x.slug)) : others.filter((x) => x.data.sector === c.sector);
  const related = await Promise.all(relatedDocs.slice(0, 3).map(async (doc) => ({ doc, cover: await sized(doc.data.cover) })));
  const nextCover = next ? await sized(next.data.cover) : undefined;

  const ctaHref =
    c.sector === 'imobiliario' ? '/especialidades/imobiliario#formulario' : c.sector === 'educacao' ? '/especialidades/educacao#formulario' : c.sector === 'concessionarias' ? '/especialidades/concessionarias#formulario' : c.sector === 'tecnologia' ? '/especialidades/tecnologia#formulario' : '/contato';

  const legacyGallery: GalleryItem[] = await toGallery(c.gallery?.map((g) => ({ image: g.image, caption: g.caption })));
  const credits = blocks.find((b) => b.type === 'credits')?.credits?.length ? blocks.find((b) => b.type === 'credits')!.credits! : c.credits ?? [];
  const md = (s?: string) => ({ __html: renderMarkdown(String(s ?? '')) });
  const prose = `prose-grifo ${dark ? 'prose-dark' : ''}`;

  /* ── Renderizadores ── */
  const ChapterSec = async ({ k, block, n }: { k: Chapter; block?: Block; n: number }) => {
    if (k === 'gallery') {
      if (!legacyGallery.length) return null;
      return (
        <section aria-labelledby={`ch-${k}`} className="hm-in py-16 sm:py-24">
          <h2 id={`ch-${k}`} className="sr-only">{block?.title || chapterLabel(k)}</h2>
          {block?.title && <Duo text={block.title} className={`mb-12 text-h2 ${dark ? 'text-white' : ''}`} />}
          <Gallery items={legacyGallery} layout={theme.gallery} tone={theme.tone} />
        </section>
      );
    }
    const body = c[k];
    if (!body) return null;
    const short = String(body).length < 320; // capítulos curtos viram declarações editoriais, sem vazios
    return (
      <section aria-labelledby={`ch-${k}`} className={`hm-in grid gap-8 lg:grid-cols-12 ${short ? 'py-10 sm:py-14' : 'py-16 sm:py-24'}`} data-reveal>
        <header className="lg:col-span-4">
          <div className={short ? '' : 'lg:sticky lg:top-28'}>
            <p aria-hidden="true" className="hm-kicker">{String(n).padStart(2, '0')}</p>
            <h2 id={`ch-${k}`} className={`mt-6 font-display text-[clamp(1.6rem,2.4vw,2.2rem)] font-medium tracking-[-0.04em] ${dark ? 'text-white' : 'text-[#0f0f10]'}`}>{chapterLabel(k)}</h2>
            {block?.title && <p className={`mt-3 font-display text-xl font-light ${dark ? 'text-white/75' : 'text-grafite/75'}`}>{block.title}</p>}
          </div>
        </header>
        <div className={`${prose} lg:col-span-7 lg:col-start-6 lg:self-end ${short ? '!max-w-none [&>p]:font-display [&>p]:text-[clamp(1.45rem,2.3vw,2.15rem)] [&>p]:font-light [&>p]:leading-[1.3] [&>p]:tracking-[-0.01em]' : '[&>p:first-child]:text-[1.3rem] [&>p:first-child]:leading-relaxed'}`} dangerouslySetInnerHTML={md(body)} />
      </section>
    );
  };

  const BlockSec = async ({ b, n }: { b: Block; n: number }) => {
    const head = (b.eyebrow || b.title) && (
      <div className="mb-10 max-w-4xl">
        {b.eyebrow && <p className={`eyebrow ${dark ? 'text-ambar' : 'text-vinho'}`}>{b.eyebrow}</p>}
        {b.title && <Duo text={b.title} className={`mt-4 text-h2 ${dark ? 'text-white' : 'text-grafite'}`} />}
      </div>
    );
    switch (b.type) {
      case 'textChapter':
        if (!b.title && !b.text) return null;
        return (
          <section className="hm-in grid gap-8 py-16 sm:py-24 lg:grid-cols-12" data-reveal>
            <div className="lg:col-span-4">{b.eyebrow && <p className={`eyebrow ${dark ? 'text-ambar' : 'text-vinho'}`}>{b.eyebrow}</p>}{b.title && <Duo text={b.title} className={`mt-4 text-h2 ${dark ? 'text-white' : ''}`} />}</div>
            {b.text && <div className={`${prose} lg:col-span-7 lg:col-start-6`} dangerouslySetInnerHTML={md(b.text)} />}
          </section>
        );
      case 'editorialSplit': {
        const img = await sized(b.image);
        if (!img?.src && !b.text) return null;
        const left = b.imageSide === 'left';
        return (
          <section className="hm-in grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-12" data-reveal>
            <div className={`lg:col-span-7 ${left ? '' : 'lg:order-2 lg:col-start-6'}`}><Frame img={img} ratio={b.ratio} sizes="(min-width:1024px) 58vw, 100vw" className="rounded-[22px]" showFlags={showFlags} /></div>
            <div className={`lg:col-span-4 ${left ? 'lg:col-start-9' : 'lg:order-1'}`}>
              {b.eyebrow && <p className={`eyebrow ${dark ? 'text-ambar' : 'text-vinho'}`}>{b.eyebrow}</p>}
              {b.title && <Duo text={b.title} className={`mt-4 text-h2 ${dark ? 'text-white' : ''}`} />}
              {b.text && <div className={`mt-6 ${prose}`} dangerouslySetInnerHTML={md(b.text)} />}
            </div>
          </section>
        );
      }
      case 'fullBleedMedia': {
        const img = await sized(b.image);
        if (!img?.src && !b.video?.src) return null;
        return (
          <section className="py-10 sm:py-16" data-reveal="mask">
            {head && <div className="hm-in">{head}</div>}
            {b.video?.src ? (
              <MotionLoop src={b.video.src} poster={b.poster?.src || img?.src} label={b.title || c.title} className={`${RATIO[b.ratio || ''] || 'aspect-[21/9]'} w-full`} />
            ) : img?.lowres ? (
              <div className="hm-in"><Frame img={img} ratio={b.ratio || '16:9'} sizes="100vw" className="rounded-[22px]" showFlags={showFlags} /></div>
            ) : (
              <Frame img={img} ratio={b.ratio} sizes="100vw" className="w-full" />
            )}
          </section>
        );
      }
      case 'imageGallery':
      case 'campaignRollout': {
        const items = await toGallery(b.items);
        if (!items.some((x) => x.src || x.video)) return null;
        const rollout = b.type === 'campaignRollout';
        const groups = rollout ? [...new Set(items.map((x) => x.channel || ''))] : [''];
        return (
          <section className="hm-in py-16 sm:py-24">
            {head}
            {b.text && <div className={`mb-12 max-w-3xl ${prose}`} dangerouslySetInnerHTML={md(b.text)} />}
            {rollout && groups.length > 1 ? (
              <div className="space-y-16">
                {groups.map((g) => (
                  <div key={g || '—'}>
                    {g && <h3 className={`mb-6 flex items-center gap-4 font-display text-lg font-semibold ${dark ? 'text-white' : ''}`}><span className="bar !w-8" aria-hidden="true" />{g}</h3>}
                    <Gallery items={items.filter((x) => (x.channel || '') === g)} layout={b.gallery || 'grid'} tone={theme.tone} />
                  </div>
                ))}
              </div>
            ) : (
              <Gallery items={items} layout={b.gallery || theme.gallery} tone={theme.tone} />
            )}
          </section>
        );
      }
      case 'video':
        if (!b.video?.src) return null;
        return (
          <section className="hm-in py-16 sm:py-24" data-reveal>
            {head}
            <VideoOnDemand src={b.video.src} poster={b.poster?.src || b.video.poster} title={b.title || c.title} className={RATIO[b.ratio || ''] || 'aspect-video'} />
          </section>
        );
      case 'motionAsset':
        if (!b.video?.src) return null;
        return (
          <section className="hm-in py-16 sm:py-24" data-reveal>
            {head}
            <MotionLoop src={b.video.src} poster={b.poster?.src || b.video.poster} label={b.title || c.title} className={`rounded-[22px] ${RATIO[b.ratio || ''] || 'aspect-video'}`} />
          </section>
        );
      case 'strategyDiagram': {
        const steps = (b.steps ?? []).filter((s) => s.label || s.text);
        if (!steps.length) return null;
        return (
          <section className={`mx-[10px] rounded-[22px] py-20 sm:mx-[14px] sm:py-28 ${dark ? 'bg-black/30' : 'bg-[#0f0f10] text-white'}`} aria-label={b.title || 'Estratégia'}>
            <div className="hm-in">
              {(b.eyebrow || b.title) && (
                <div className="mb-14 max-w-4xl">
                  {b.eyebrow && <p className="eyebrow text-ambar">{b.eyebrow}</p>}
                  {b.title && <Duo text={b.title} className="mt-4 text-h2 text-white" />}
                </div>
              )}
              {b.text && <div className="prose-grifo prose-dark mb-14 max-w-3xl" dangerouslySetInnerHTML={md(b.text)} />}
              <ol className="grid gap-px overflow-hidden rounded-[22px] bg-white/10 md:grid-cols-2 lg:auto-cols-fr lg:grid-flow-col" data-reveal>
                {steps.map((s, k) => (
                  <li key={k} data-stagger style={{ ['--i' as string]: k }} className="relative bg-[#18181a] p-7">
                    <p className="font-display text-sm font-semibold tabular-nums text-ambar">{String(k + 1).padStart(2, '0')}{s.label ? ` · ${s.label}` : ''}</p>
                    {s.text && <p className="mt-4 text-lg leading-snug text-white/90">{s.text}</p>}
                    {k < steps.length - 1 && <span aria-hidden="true" className="absolute right-4 top-6 hidden text-white/30 lg:block">→</span>}
                  </li>
                ))}
              </ol>
            </div>
          </section>
        );
      }
      case 'quote':
        if (!b.quote || !b.source) return null; // citação sem fonte nunca aparece
        return (
          <section className="hm-in py-20 sm:py-28" data-reveal>
            <figure className="mx-auto max-w-5xl">
              <blockquote className={`font-display text-[clamp(1.8rem,3.6vw,3.2rem)] font-light leading-[1.15] tracking-[-0.02em] ${dark ? 'text-white' : 'text-grafite'}`}>“{b.quote}”</blockquote>
              <figcaption className={`mt-8 flex items-center gap-4 font-semibold ${dark ? 'text-ambar' : 'text-vinho'}`}><span className="bar !w-10" aria-hidden="true" />{b.source}</figcaption>
            </figure>
          </section>
        );
      case 'metrics': {
        const ms = (b.metrics ?? []).filter((m) => m.verified && m.value && m.label && m.source);
        if (!ms.length) return null;
        return (
          <section className="hm-in py-16 sm:py-24" data-reveal>
            {head}
            <dl className="grid gap-10 sm:grid-cols-3">
              {ms.map((m, k) => (
                <div key={k} className={`border-t pt-5 ${dark ? 'border-white/20' : 'border-grafite/25'}`}>
                  <dt className="sr-only">{m.label}</dt>
                  <dd>
                    <span className={`block font-display text-[clamp(3rem,7vw,5.5rem)] font-medium leading-[.9] tracking-[-0.06em] ${dark ? 'text-white' : 'text-[#0f0f10]'}`}>{m.value}</span>
                    <span className="mt-3 block font-display text-lg font-semibold">{m.label}</span>
                    <span className={`mt-1 block text-xs ${dark ? 'text-white/50' : 'text-grafite/70'}`}>Fonte: {m.source}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        );
      }
      default:
        return null; // credits, relatedProjects e nextProject têm posição fixa no fim da página
    }
  };

  const caseLd = d.placeholder
    ? null
    : { '@context': 'https://schema.org', '@type': 'CreativeWork', name: c.title, ...(c.summary ? { description: c.summary } : {}), ...(c.year ? { dateCreated: c.year } : {}), ...(cover?.src ? { image: cover.src.startsWith('http') ? cover.src : env.siteUrl + cover.src } : {}), creator: { '@type': 'Organization', name: 'Grifo Agency' }, url: `${env.siteUrl}/projetos/${slug}` };

  return (
    <BPage>
      <TrackView event="view_case" params={{ case: slug, sector: c.sector || '' }} />
      {caseLd && <JsonLd data={caseLd} />}

      {/* 1 · Abertura: título, ficha técnica e peça principal (o título nunca é sobreposto à marca do cliente) */}
      <section className="hm-panel hm-panel--hero" aria-labelledby="page-title">
        <div className="hm-in pb-10 pt-[calc(var(--header-h)+34px)] lg:pb-14 lg:pt-[calc(var(--header-h)+48px)]">
          <BCrumbs items={[{ name: 'Projetos', path: '/projetos' }, { name: c.title, path: `/projetos/${slug}` }]} />
          <div className={`mt-14 grid gap-12 lg:mt-20 lg:items-center ${plate ? 'lg:grid-cols-12' : ''}`}>
            <div className={`hero-seq ${plate ? 'lg:col-span-7' : 'max-w-[68rem]'}`}>
              {sector?.label ? <p className="hm-pill"><i aria-hidden="true" />{sector.label}</p> : <span />}
              <h1 id="page-title" className="hm-h1 mt-7">{c.title}</h1>
              {c.summary ? <p className="hm-lead mt-8 max-w-[52ch] !text-[#4b4a47]">{c.summary}</p> : <span />}
              {d.placeholder && <p className="mt-6"><PlaceholderFlag>Case aguardando aprovação do cliente</PlaceholderFlag></p>}
            </div>
            {plate && cover?.src ? (
              <div className="flex justify-center lg:col-span-5 lg:justify-end" data-reveal>
                <figure className="pj-plate">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cover.src} alt={cover.alt || c.title} width={cover.w} height={cover.h} style={{ width: `min(100%, ${Math.round((cover.w || 300) * 1.6)}px)` }} fetchPriority="high" />
                </figure>
              </div>
            ) : null}
          </div>
          <dl className="pj-facts mt-14 lg:mt-20">
            {c.client && (<div><dt>Cliente</dt><dd>{c.client}</dd></div>)}
            {sector && (<div><dt>Setor</dt><dd>{sector.label}</dd></div>)}
            {c.year && (<div><dt>Ano</dt><dd>{c.year}</dd></div>)}
            {c.competencies?.length ? (<div><dt>Competências</dt><dd>{c.competencies.map((x) => COMPETENCIES.find((k) => k.value === x)?.label).join(' · ')}</dd></div>) : null}
          </dl>
        </div>
      </section>

      {/* Mídia principal em boa resolução (ou vídeo): painel próprio, inteira, sem corte */}
      {c.heroMedia?.video?.src || (cover?.src && !plate) ? (
        <section className="hm-panel hm-panel--ink" aria-label={`Peça principal: ${c.title}`}>
          <div className="hm-in py-6 sm:py-10" data-reveal="mask">
            {c.heroMedia?.video?.src ? (
              <MotionLoop src={c.heroMedia.video.src} poster={c.heroMedia.poster?.src || cover?.src} label={c.title} className="aspect-[21/9] rounded-[22px]" />
            ) : (
              <Frame img={cover} sizes="(min-width:1360px) 1300px, 100vw" priority className="rounded-[22px]" showFlags={showFlags} />
            )}
          </div>
        </section>
      ) : null}

      {/* 2–9 · Narrativa */}
      <article className={`hm-panel ${dark ? 'hm-panel--ink surface-ink text-white' : 'text-[#0f0f10]'} py-10 sm:py-16`} aria-label={`Estudo de caso: ${c.title}`}>
        {sequence.length ? (
          sequence.map((st, k) => (st.kind === 'chapter' ? <ChapterSec key={k} k={st.chapter} block={st.block} n={nums.get(k) ?? 0} /> : <BlockSec key={k} b={st.block} n={k} />))
        ) : (
          <p className="hm-in py-16 text-lead opacity-70">O estudo completo deste projeto será publicado após a aprovação do cliente.</p>
        )}

        {/* 10 · Créditos — somente informações confirmadas */}
        {credits.length ? (
          <section className="hm-in py-16 sm:py-20" aria-labelledby="credits-title">
            <div className={`grid gap-6 border-t pt-10 lg:grid-cols-12 ${dark ? 'border-white/15' : 'border-grafite/15'}`}>
              <h2 id="credits-title" className="font-display text-lg font-semibold lg:col-span-3">Créditos</h2>
              <ul className={`flex flex-wrap gap-2.5 lg:col-span-9 ${dark ? 'text-white/80' : 'text-grafite/75'}`}>
                {credits.map((x) => <li key={x} className={`rounded-full px-4 py-2 ring-1 ring-inset ${dark ? 'ring-white/20' : 'ring-grafite/20'}`}>{x}</li>)}
              </ul>
            </div>
          </section>
        ) : null}
      </article>

      {/* 11 · Próximo case (navegação real) */}
      {next && (
        <nav aria-label="Navegação entre projetos" className="hm-panel hm-panel--ink hm-glow">
          <div className="hm-in hm-pad">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="hm-kicker">Próximo projeto</p>
              {prev && (
                <Link href={`/projetos/${prev.slug}`} className="text-sm text-[#8f8e8b] transition-colors hover:text-white" rel="prev">
                  ← {prev.data.title}
                </Link>
              )}
            </div>
            <Link href={`/projetos/${next.slug}`} rel="next" className="pj-next group mt-10 lg:mt-14">
              <span className="min-w-0">
                <span className="pj-next-title">{next.data.title}</span>
                <span className="mt-4 block text-[#8f8e8b]">{SECTORS.find((s) => s.value === next.data.sector)?.label}{next.data.year ? ` · ${next.data.year}` : ''}</span>
              </span>
              <ProjectThumb item={{ doc: next, cover: nextCover }} className="pj-thumb--next" />
            </Link>
          </div>
        </nav>
      )}

      {related.length > 0 && (
        <section className="hm-panel" aria-labelledby="rel-title">
          <div className="hm-in hm-pad">
            <h2 id="rel-title" className="hm-h2 max-w-[20ch]">Outros projetos em {sector?.label}</h2>
            <div className="mt-12 lg:mt-16"><ProjectRows items={related} showFlags={showFlags} /></div>
          </div>
        </section>
      )}

      {/* 12 · Conversão contextual */}
      <BFinal data={{ title: 'Seu projeto pode ser o próximo.', text: 'Conte seu desafio de negócio para a equipe Grifo.', cta: { label: 'Vamos conversar', href: ctaHref } }} track={`case_${slug}`} />
    </BPage>
  );
}
