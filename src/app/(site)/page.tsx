import Link from 'next/link';
import { preload } from 'react-dom';
import { notFound } from 'next/navigation';
import { getDoc, listDocs, getDocsBySlugs, placeholdersVisible, type Cta } from '@/lib/cms/content';
import { buildMetadata } from '@/lib/seo';
import { readingTime } from '@/lib/markdown';
import { sized } from '@/lib/media-meta';
import { PlaceholderFlag } from '@/components/ui/Duo';
import { type ArticleData, type CaseData, type HeroData, type MetricData } from '@/components/site/blocks';
import { Frame } from '@/components/site/studio';
import { formatDate } from '@/components/site/cards';
import { Wing } from '@/components/brand/Logo';
import { ARTICLE_CATEGORIES, SECTORS, COMPETENCIES } from '@/lib/cms/schema';
import { Arrow, HButton, HTitle, Kicker, Marquee } from '@/components/home/parts';
import { HeroSculpture } from '@/components/home/HeroSculpture';
import { MiccaRail } from '@/components/home/MiccaRail';

/* ═════════ HOME 2027 · Boutique ═════════
 * Layout novo; o conteúdo é 100% o aprovado no CMS (nove seções, mesma ordem, mesmos textos e CTAs).
 * Monocromático (branco, névoa, grafite, preto); vinho e âmbar só em detalhes.
 * 3D: escultura "Asa Grifo" renderizada offline (tools/render-3d) — imagem + loop de vídeo, sem WebGL no navegador.
 */

type Sec = { title?: string; text?: string; cta?: Cta };
type Home = {
  hero: HeroData;
  proof: Sec & { showMetrics?: boolean };
  ecosystem: Sec;
  specialties: Sec;
  micca: Sec;
  projects: Sec & { cases?: string[] };
  process: { title?: string; steps?: { title: string; text?: string }[] };
  insights: Sec;
  final: Sec;
};
type Solution = { name: string; tagline?: string; services?: { items?: { title: string }[] } };

export async function generateMetadata() {
  const d = await getDoc<Home>('home', 'home');
  return buildMetadata({ path: '/', seo: d?.seo, title: 'Grifo Agency', description: d?.data.hero.text });
}

const label = (list: { value: string; label: string }[], v?: string) => list.find((x) => x.value === v)?.label ?? v ?? '';

export default async function HomePage() {
  const doc = await getDoc<Home>('home', 'home');
  if (!doc) notFound();
  const h = doc.data;
  // A escultura do hero é o maior elemento da primeira dobra: pré-carregada com prioridade alta.
  preload('/home/asa-ceramica.webp', { as: 'image', fetchPriority: 'high', imageSrcSet: '/home/asa-ceramica-840.webp 840w, /home/asa-ceramica.webp 1680w', imageSizes: '(min-width:1024px) 46vw, 96vw' });
  const [solutions, specialties, micca, metrics, cases, articles, showFlags] = await Promise.all([
    listDocs<Solution>('solution'),
    listDocs<{ name: string; tagline?: string }>('specialty'),
    getDoc<{ pillars: { letter?: string; name: string; summary?: string; text?: string }[] }>('micca', 'metodologia-micca'),
    listDocs<MetricData>('metric'),
    getDocsBySlugs<CaseData>('case', h.projects.cases),
    listDocs<ArticleData>('article'),
    placeholdersVisible(),
  ]);
  const homeMetrics = metrics.filter((m) => m.data.contexts?.includes('home'));
  const latest = [...articles].sort((a, b) => (b.data.date || '').localeCompare(a.data.date || '')).slice(0, 3);
  const work = await Promise.all(cases.map(async (c) => ({ doc: c, cover: await sized(c.data.cover) })));
  const catLabel = (v?: string) => ARTICLE_CATEGORIES.find((c) => c.value === v)?.label ?? v;
  const marquee = [...solutions.map((s) => `Grifo ${s.data.name}`), ...specialties.map((s) => s.data.name)];

  // Ritmo da vitrine (mesma ordem do CMS): banners horizontais em boa resolução ocupam a linha inteira;
  // os demais formam pares 7/5 e 5/7 de mesma altura; pares sem imagem ficam baixos (sem quadro gigante vazio).
  type Slot = { cell: string; ratio: string };
  const slots: Slot[] = [];
  {
    const wide = (i: number) => { const c = work[i].cover; return !!c?.src && !c.lowres && !!c.w && !!c.h && c.w / c.h > 2.1; };
    let flip = false;
    for (let i = 0; i < work.length; ) {
      if (wide(i)) { slots[i] = { cell: 'lg:col-span-12', ratio: '' }; i += 1; continue; } // proporção do próprio arquivo: nada cortado
      const j = i + 1 < work.length && !wide(i + 1) ? i + 1 : -1;
      if (j < 0) { slots[i] = { cell: work[i].cover?.src ? 'lg:col-span-12' : 'lg:col-span-6', ratio: work[i].cover?.src ? '21:9' : '16:10' }; i += 1; continue; }
      const empty = !work[i].cover?.src && !work[j].cover?.src;
      const [a, b] = flip ? ['lg:col-span-5', 'lg:col-span-7'] : ['lg:col-span-7', 'lg:col-span-5'];
      slots[i] = { cell: a, ratio: empty ? 'empty' : a.endsWith('7') ? '16:10' : '8:7' };
      slots[j] = { cell: b, ratio: empty ? 'empty' : b.endsWith('7') ? '16:10' : '8:7' };
      flip = !flip;
      i += 2;
    }
  }

  return (
    <div className="hm hm-stack">
      {/* 01 · HERO — escultura 3D da asa, título e CTAs imediatamente disponíveis */}
      <section className="hm-panel hm-panel--hero min-h-[calc(100svh-20px)] sm:min-h-[calc(100svh-28px)]" aria-labelledby="hero-title">
        <HeroSculpture
          poster="/home/asa-ceramica.webp"
          srcSet="/home/asa-ceramica-840.webp 840w, /home/asa-ceramica.webp 1680w"
          sizes="(min-width:1024px) 46vw, 96vw"
          sources={[{ src: '/home/asa-ceramica-loop.mp4', type: 'video/mp4' }]}
          className="right-[-6%] top-[78px] aspect-[7/6] w-[96%] sm:right-[-4%] sm:top-[4%] sm:w-[72%] lg:right-[-1%] lg:top-[6%] lg:w-[46%] lg:max-w-[800px]"
        />
        <div className="hm-in relative flex min-h-[inherit] flex-col pb-6 pt-[calc(var(--header-h)+28px)] sm:pb-8 lg:pt-[calc(var(--header-h)+40px)]">
          <div className="mt-[72vw] sm:mt-[44vw] lg:mt-auto">
            <div className="hero-seq">
              <p className="hm-pill"><i aria-hidden="true" />{h.hero.eyebrow}</p>
              <h1 id="hero-title" className="hm-h1 mt-7 max-w-[11.5ch] text-[#0f0f10] lg:max-w-[12.5ch]">{h.hero.title}</h1>
            </div>
            <div className="hero-seq mt-10 grid gap-8 border-t border-black/10 pt-8 lg:mt-14 lg:grid-cols-12 lg:items-end">
              <p className="hm-lead max-w-[46ch] !text-[#4b4a47] lg:col-span-6">{h.hero.text}</p>
              <div className="flex flex-wrap gap-3 lg:col-span-6 lg:justify-end">
                <HButton href={h.hero.cta?.href} label={h.hero.cta?.label} variant="ink" track="home_hero_primary" />
                {/* "Vamos conversar" sai do hero: o mesmo convite já está fixo no cabeçalho */}
              </div>
            </div>
          </div>
          <div className="mt-10 border-t border-black/[.07] pt-6">
            <Marquee items={marquee} label="Frentes e especialidades da Grifo" />
          </div>
        </div>
      </section>

      {/* 02 · PROVA DE EXPERIÊNCIA */}
      <section className="hm-panel" aria-labelledby="proof-title">
        <div className="hm-in hm-pad">
          <div className="grid gap-10 lg:grid-cols-12" data-reveal>
            <div className="lg:col-span-8">
              <Kicker>01</Kicker>
              <HTitle id="proof-title" text={h.proof.title} className="hm-h2 mt-8" />
            </div>
            {h.proof.text && <p className="hm-lead lg:col-span-4 lg:self-end">{h.proof.text}</p>}
          </div>
          {h.proof.showMetrics && homeMetrics.length > 0 && (
            <dl className="mt-16 grid gap-2.5 sm:grid-cols-3 lg:mt-24" data-reveal>
              {homeMetrics.map((m, i) => (
                <div key={m.id} data-stagger style={{ ['--i' as string]: i }} className="hm-metric flex min-h-[260px] flex-col justify-between p-7 lg:min-h-[320px] lg:p-9">
                  <dt className="sr-only">{m.data.label}</dt>
                  <dd className="contents">
                    <span className="flex items-start justify-between">
                      <span className="hm-num">{String(i + 1).padStart(2, '0')}</span>
                      {!m.data.validated && <PlaceholderFlag>Confirmar antes de publicar</PlaceholderFlag>}
                    </span>
                    <span>
                      <span className="block font-display text-[clamp(4rem,8.5vw,8rem)] font-medium leading-[.85] tracking-[-0.06em]">
                        {m.data.value.replace('+', '')}
                        {m.data.value.includes('+') && <span className="text-ambar">+</span>}
                      </span>
                      <span className="mt-5 block font-display text-lg font-medium tracking-[-0.01em]">{m.data.label}</span>
                      {m.data.detail && <span className="mt-0.5 block text-sm text-[#6f6e6b]">{m.data.detail}</span>}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {/* 03 · ECOSSISTEMA — quatro frentes */}
      <section className="hm-panel hm-panel--ink hm-glow" aria-labelledby="eco-title">
        <div className="hm-in hm-pad">
          <div className="grid gap-10 lg:grid-cols-12" data-reveal>
            <div className="lg:col-span-7">
              <Kicker>02</Kicker>
              <HTitle id="eco-title" text={h.ecosystem.title} className="hm-h2 mt-8" />
            </div>
            {h.ecosystem.text && <p className="hm-lead lg:col-span-4 lg:col-start-9 lg:self-end">{h.ecosystem.text}</p>}
          </div>
          {/* rótulos do diagrama de arquitetura do ZIP original: Consulting conduz (direção estratégica) e as demais frentes apoiam */}
          <p className="mt-16 flex items-center gap-3 font-display text-sm text-[#8f8e8b] lg:mt-24"><Wing className="h-2.5 w-4 text-ambar" /><span className="font-semibold text-white">grifo</span> o ecossistema</p>
          <ul className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4" data-reveal role="list">
            {solutions.map((s, i) => (
              <li key={s.slug} data-stagger style={{ ['--i' as string]: i }}>
                <Link href={`/solucoes/${s.slug}`} className="hm-card hm-eco group flex h-full flex-col p-7 lg:p-8">
                  {/* linha superior com altura fixa: número (e o rótulo do diagrama em Consulting) + seta */}
                  <span className="flex h-11 items-start justify-between">
                    <span className="flex items-center gap-3 pt-0.5">
                      <span className="hm-num !text-[#8f8e8b]">{String(i + 1).padStart(2, '0')}</span>
                      {s.slug === 'consulting' && <span className="text-[0.66rem] font-medium uppercase tracking-[0.18em] text-ambar">Direção estratégica</span>}
                    </span>
                    <span className="hm-card-arrow" aria-hidden="true"><Arrow /></span>
                  </span>
                  {/* ícone 3D flutuante, na mesma linha visual em todos os cartões */}
                  <span className="hm-eco-ico" aria-hidden="true" style={{ ['--d' as string]: `${i * -1.6}s` }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/home/icone-${s.slug}.webp`} alt="" width={360} height={360} loading="lazy" decoding="async" />
                  </span>
                  {/* título sempre em duas linhas ("Grifo" / frente): todos os títulos e textos começam na mesma altura */}
                  <span className="mt-8 block font-display text-[clamp(1.65rem,2.1vw,2.15rem)] font-medium leading-[1.04] tracking-[-0.04em]">
                    <span className="block text-[#8f8e8b]">Grifo</span>
                    <span className="block">{s.data.name}</span>
                  </span>
                  {s.data.tagline && <span className="mt-4 block min-h-[4.9em] leading-relaxed text-[#a4a3a0]">{s.data.tagline}</span>}
                  {s.data.services?.items?.length ? (
                    <span className="mt-auto flex flex-wrap gap-1.5 border-t border-white/10 pt-5">
                      {s.data.services.items.slice(0, 3).map((it) => (
                        <span key={it.title} className="rounded-full bg-white/[.06] px-3 py-1.5 text-[0.78rem] text-[#c9c8c5]">{it.title}</span>
                      ))}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 04 · ESPECIALIDADES — quatro mercados */}
      <section className="hm-panel" aria-labelledby="spec-title">
        <div className="hm-in hm-pad">
          <div className="grid gap-10 lg:grid-cols-12" data-reveal>
            <div className="lg:col-span-8">
              <Kicker>03</Kicker>
              <HTitle id="spec-title" text={h.specialties.title} className="hm-h2 mt-8" />
            </div>
            {h.specialties.text && <p className="hm-lead lg:col-span-4 lg:self-end">{h.specialties.text}</p>}
          </div>
          <ul className="mt-16 grid gap-2.5 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4" data-reveal role="list">
            {specialties.map((s, i) => (
              <li key={s.slug} data-stagger style={{ ['--i' as string]: i }}>
                <Link href={`/especialidades/${s.slug}`} className="hm-card hm-spec group flex h-full min-h-[300px] flex-col p-7 sm:min-h-[380px] lg:min-h-[400px] lg:p-8">
                  <span className="flex h-11 items-start justify-between">
                    <span className="hm-num pt-0.5 transition-colors">{String(i + 1).padStart(2, '0')}</span>
                    <span className="hm-card-arrow" aria-hidden="true"><Arrow /></span>
                  </span>
                  {/* títulos alinhados pelo topo, com espaço reservado para duas linhas; textos começam na mesma altura */}
                  <span className="mt-16 block min-h-[2.08em] font-display text-[clamp(1.55rem,1.95vw,2.05rem)] font-medium leading-[1.04] tracking-[-0.035em] lg:mt-24">{s.data.name}</span>
                  {s.data.tagline && <span className="hm-spec-tag mt-4 block leading-relaxed">{s.data.tagline}</span>}
                  <span className="hm-link mt-auto pt-8 text-sm"><span>Conhecer a especialidade</span></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 05 · MICCA — os cinco pilares, um de cada vez */}
      <section className="hm-panel hm-panel--mist" aria-labelledby="micca-title">
        <div className="hm-in hm-pad">
          <div className="grid gap-10 lg:grid-cols-12" data-reveal>
            <div className="lg:col-span-7">
              <Kicker>04</Kicker>
              <HTitle id="micca-title" text={h.micca.title} className="hm-h2 mt-8" />
            </div>
            <div className="lg:col-span-4 lg:col-start-9 lg:self-end">
              {h.micca.text && <p className="hm-lead">{h.micca.text}</p>}
              <div className="mt-8"><HButton href={h.micca.cta?.href} label={h.micca.cta?.label} variant="ink" track="home_micca" /></div>
            </div>
          </div>
          {micca?.data.pillars?.length ? (
            <div className="mt-16 lg:mt-24" data-reveal>
              <MiccaRail pillars={micca.data.pillars} />
            </div>
          ) : null}
        </div>
      </section>

      {/* 06 · PROJETOS — vitrine */}
      {work.length > 0 && (
        <section className="hm-panel" aria-labelledby="proj-title">
          <div className="hm-in hm-pad">
            <div className="grid gap-10 lg:grid-cols-12" data-reveal>
              <div className="lg:col-span-7">
                <Kicker>05</Kicker>
                <HTitle id="proj-title" text={h.projects.title} className="hm-h2 mt-8" />
              </div>
              <div className="lg:col-span-4 lg:col-start-9 lg:self-end">
                {h.projects.text && <p className="hm-lead">{h.projects.text}</p>}
                <div className="mt-8"><HButton href={h.projects.cta?.href} label={h.projects.cta?.label} variant="line" track="home_projects" /></div>
              </div>
            </div>
            <ul className="mt-16 grid gap-x-2.5 gap-y-12 lg:mt-24 lg:grid-cols-12" data-reveal role="list">
              {work.map(({ doc, cover }, i) => {
                const r = slots[i];
                const d = doc.data;
                return (
                  <li key={doc.id} data-stagger style={{ ['--i' as string]: i % 5 }} className={r.cell}>
                    <article className="hm-work group relative">
                      <div className="hm-work-media">
                        {cover?.src ? (
                          <Frame img={cover} ratio={r.ratio || undefined} sizes={r.cell.includes('12') ? '(min-width:1024px) 90vw, 100vw' : '(min-width:1024px) 55vw, 100vw'} className="rounded-[22px]" showFlags={showFlags} />
                        ) : (
                          <div className={`relative flex items-center justify-center ${r.ratio === 'empty' ? 'h-[220px] lg:h-[260px]' : r.ratio === '8:7' ? 'aspect-[8/7]' : 'aspect-[16/10]'}`} role="img" aria-label="Imagem pendente">
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
                        <span className="hm-card-arrow mt-1 shrink-0 bg-[#f4f3f0] text-[#0f0f10] transition-colors group-hover:bg-[#0f0f10] group-hover:text-white" aria-hidden="true"><Arrow /></span>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* 07 · PROCESSO */}
      <section className="hm-panel hm-panel--ink" aria-labelledby="process-title">
        <div className="hm-in hm-pad">
          <div className="max-w-4xl" data-reveal>
            <Kicker>06</Kicker>
            <HTitle id="process-title" text={h.process.title} className="hm-h2 mt-8" />
          </div>
          {h.process.steps?.length ? (
            <ol className="mt-16 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:mt-24 lg:grid-cols-5" data-reveal>
              {h.process.steps.map((s, i) => (
                <li key={i} className="hm-step" style={{ ['--i' as string]: i }}>
                  <span className="hm-step-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}<sup>●</sup></span>
                  <span className="hm-step-t mt-10 block font-display text-xl font-medium tracking-[-0.02em] text-white">{s.title}</span>
                  {s.text && <span className="hm-step-d mt-2 block text-[#9d9c99]">{s.text}</span>}
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      </section>

      {/* 08 · INSIGHTS — somente artigos publicados (rascunhos só em homologação, sinalizados) */}
      {latest.length > 0 && (
        <section className="hm-panel" aria-labelledby="ins-title">
          <div className="hm-in hm-pad">
            <div className="grid gap-10 lg:grid-cols-12" data-reveal>
              <div className="lg:col-span-8">
                <Kicker>07</Kicker>
                <HTitle id="ins-title" text={h.insights.title} className="hm-h2 mt-8" />
              </div>
              <div className="lg:col-span-4 lg:self-end lg:text-right">
                {h.insights.text && <p className="hm-lead">{h.insights.text}</p>}
                <div className="mt-8"><HButton href={h.insights.cta?.href} label={h.insights.cta?.label} variant="line" track="home_insights" /></div>
              </div>
            </div>
            <div className="mt-16 grid gap-2.5 lg:mt-24 lg:grid-cols-12" data-reveal>
              {latest.map((a, i) => (
                <article key={a.id} data-stagger style={{ ['--i' as string]: i }} className={`hm-post group relative flex flex-col p-7 lg:p-9 ${i === 0 ? 'min-h-[360px] lg:col-span-7 lg:row-span-2 lg:min-h-[520px]' : 'min-h-[250px] lg:col-span-5'}`}>
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                    <span className="font-semibold text-vinho">{catLabel(a.data.category)}</span>
                    <time dateTime={a.data.date} className="text-[#6f6e6b]">{formatDate(a.data.date)}</time>
                    <span className="text-[#6f6e6b]">{readingTime(a.data.body)} min de leitura</span>
                    {a.placeholder && <PlaceholderFlag>Rascunho editorial</PlaceholderFlag>}
                  </p>
                  <div className="mt-auto pt-10">
                    <h3 className={`font-display font-medium leading-[1.05] tracking-[-0.035em] ${i === 0 ? 'text-[clamp(2rem,3.4vw,3.2rem)]' : 'text-[clamp(1.35rem,1.8vw,1.7rem)]'}`}>
                      <Link href={`/insights/${a.slug}`} className="after:absolute after:inset-0 after:rounded-[24px] after:content-['']">{a.data.title}</Link>
                    </h3>
                    {a.data.excerpt && <p className={`mt-4 max-w-[52ch] leading-relaxed text-[#6f6e6b] ${i === 0 ? 'text-lead' : ''}`}>{a.data.excerpt}</p>}
                  </div>
                  <span className="hm-card-arrow absolute right-6 top-6 bg-white text-[#0f0f10] transition-colors group-hover:bg-[#0f0f10] group-hover:text-white lg:right-8 lg:top-8" aria-hidden="true"><Arrow /></span>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 09 · CTA FINAL — momento de marca distinto do hero: escultura em preto acetinado */}
      {h.final?.title && (
        <section className="hm-panel hm-panel--ink hm-glow" aria-labelledby="home_final-title">
          <div aria-hidden="true" className="hm-final-sculpt hidden md:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/home/asa-noir.webp" alt="" loading="lazy" decoding="async" className="hm-float" />
          </div>
          <div className="hm-in relative hm-pad lg:py-40">
            <div className="max-w-[min(100%,46rem)]" data-reveal>
              <Kicker>08</Kicker>
              <h2 id="home_final-title" className="hm-h1 mt-8 !text-[clamp(2.5rem,5.6vw,5.8rem)]">{h.final.title}</h2>
            </div>
            <div className="mt-12 grid max-w-[46rem] gap-8" data-reveal>
              {h.final.text && <p className="hm-lead max-w-[44ch]">{h.final.text}</p>}
              <div><HButton href={h.final.cta?.href} label={h.final.cta?.label} variant="white" track="home_final" /></div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
