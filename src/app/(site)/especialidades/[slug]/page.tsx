import { notFound } from 'next/navigation';
import { getDoc, getDocsBySlugs, listDocs, placeholdersVisible, type Cta, type Img } from '@/lib/cms/content';
import { sized } from '@/lib/media-meta';
import { PortfolioShowcase } from '@/components/site/PortfolioShowcase';
import { buildMetadata, serviceLd } from '@/lib/seo';
import { JsonLd } from '@/components/site/JsonLd';
import { Media, type CaseData, type HeroData, type MetricData } from '@/components/site/blocks';
import { BHead, BHero, BItems, BMetrics, BPage, Object3D, Panel, nn } from '@/components/home/boutique';
import { HButton, HTitle, Kicker } from '@/components/home/parts';
import { Journey } from '@/components/visual/Journey';
import { CoreStack } from '@/components/visual/CoreStack';
import { MiccaApplied } from '@/components/visual/Micca';
import { EcosystemArc } from '@/components/visual/EcosystemArc';
import { LeadForm } from '@/components/forms/LeadForm';
import { TrackView } from '@/components/site/TrackView';
import { issueFormToken } from '@/lib/leads/service';

type Sec = { title?: string; text?: string };
type Specialty = {
  name: string;
  tagline?: string;
  hero: HeroData;
  challenge: Sec;
  product: Sec & { image?: Img };
  fronts: Sec & { items?: { title: string; text?: string }[] };
  journey: Sec & { steps?: { title: string; objective?: string; deliverables?: string[] }[] };
  plan: Sec & { layers?: string[] };
  modules: Sec & { coreLabel?: string; coreText?: string; optional?: string[]; note?: string };
  micca: { title?: string; items?: { pillar: string; text: string }[] };
  segments: Sec & { items?: { title: string; text?: string }[] };
  proof: Sec & { cases?: string[] };
  final: Sec & { cta?: Cta };
  formDemand?: string;
};

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P) {
  const { slug } = await params;
  const d = await getDoc<Specialty>('specialty', slug);
  if (!d) return {};
  return buildMetadata({ path: `/especialidades/${slug}`, seo: d.seo, title: d.data.name, description: d.data.hero.text });
}

export default async function SpecialtyPage({ params }: P) {
  const { slug } = await params;
  const d = await getDoc<Specialty>('specialty', slug);
  if (!d) notFound();
  const s = d.data;
  const [cases, metrics, contact] = await Promise.all([
    getDocsBySlugs<CaseData>('case', s.proof?.cases),
    listDocs<MetricData>('metric'),
    getDoc<{ successTitle?: string; successText?: string }>('contactPage', 'contato'),
  ]);
  const ctxMetrics = metrics.filter((m) => m.data.contexts?.includes(slug));
  const [showFlags, proofItems] = await Promise.all([placeholdersVisible(), Promise.all(cases.map(async (doc) => ({ doc, cover: await sized(doc.data.cover) })))]);
  const isCore = slug === 'imobiliario';

  let k = 0;
  const next = () => ++k;

  return (
    <BPage>
      <TrackView event="view_specialty" params={{ specialty: slug }} />
      <JsonLd data={serviceLd({ name: s.name, description: d.seo?.description || s.hero.text, path: `/especialidades/${slug}`, serviceType: 'Marketing especializado', audience: s.name, offers: s.fronts?.items?.map((x) => x.title) })} />
      <BHero
        hero={s.hero}
        tone={isCore ? 'ink' : 'light'}
        crumbs={[{ name: 'Especialidades', path: '/especialidades' }, { name: s.name, path: `/especialidades/${slug}` }]}
        ctaTrack={`especialidade_${slug}_hero`}
        visual={<Object3D src={`/home/icone-${slug}-lg.webp`} priority />}
      />

      {/* Desafio */}
      {s.challenge?.title && (
        <Panel labelledby="challenge-title">
          <BHead n={next()} wide id="challenge-title" title={s.challenge.title} text={s.challenge.text} />
        </Panel>
      )}

      {/* Produto (Grifo Core) */}
      {s.product?.title && (
        <Panel tone="ink" glow labelledby="product-title">
          <div className="grid items-center gap-14 lg:grid-cols-12">
            <div className="lg:col-span-6" data-reveal>
              <Kicker>{nn(next())}</Kicker>
              <HTitle id="product-title" text={s.product.title} className="hm-h2 mt-8" />
              {s.product.text && <p className="hm-lead mt-8 max-w-[52ch]">{s.product.text}</p>}
            </div>
            <div className="lg:col-span-6" data-reveal>
              {isCore ? (
                <div className="rounded-[24px] bg-[#18181a] p-6 sm:p-10"><EcosystemArc center="grifo core" centerSub="a solução para incorporadoras" /></div>
              ) : (
                <Media img={s.product.image} sizes="(min-width:1024px) 45vw, 100vw" className="aspect-[16/10] rounded-[24px]" />
              )}
            </div>
          </div>
        </Panel>
      )}

      {/* Frentes / soluções */}
      {s.fronts?.items?.length ? (
        <Panel tone="mist" labelledby={s.fronts.title ? 'fronts-title' : undefined} label={s.fronts.title ? undefined : s.name}>
          <BHead n={s.fronts.title ? next() : undefined} id="fronts-title" title={s.fronts.title} text={s.fronts.text} />
          <div className={s.fronts.title ? 'mt-16 lg:mt-24' : ''}>
            <BItems items={s.fronts.items} numbered={isCore || !s.fronts.items.some((x) => x.text)} />
          </div>
        </Panel>
      ) : null}

      {/* Jornada interativa */}
      {s.journey?.steps?.length ? (
        <Panel tone="ink" labelledby="journey-title">
          <BHead n={next()} id="journey-title" title={s.journey.title} text={s.journey.text} />
          <div className="mt-16 lg:mt-24">
            <Journey steps={s.journey.steps} />
          </div>
        </Panel>
      ) : null}

      {/* Plano em camadas */}
      {s.plan?.layers?.length ? (
        <Panel tone="mist" labelledby="plan-title">
          <BHead n={next()} id="plan-title" title={s.plan.title} text={s.plan.text} />
          <div className="mt-14 lg:mt-20">
            <CoreStack layers={s.plan.layers} />
          </div>
        </Panel>
      ) : null}

      {/* Módulos */}
      {s.modules?.coreLabel ? (
        <Panel labelledby="modules-title">
          <BHead n={next()} id="modules-title" title={s.modules.title} text={s.modules.text} />
          <div className="mt-16 grid gap-2.5 lg:mt-24 lg:grid-cols-12" data-reveal>
            <div className="flex min-h-[320px] flex-col justify-between rounded-[24px] bg-[#0f0f10] p-8 text-white lg:col-span-5 lg:p-10">
              <p className="flex items-center gap-2.5 font-display text-[0.72rem] font-medium uppercase tracking-[0.2em] text-[#d6d5d1]"><i className="hm-dot" aria-hidden="true" />Núcleo obrigatório</p>
              <div className="mt-16">
                <p className="font-display text-[clamp(1.9rem,2.6vw,2.5rem)] font-medium leading-[1.05] tracking-[-0.04em]">{s.modules.coreLabel}</p>
                {s.modules.coreText && <p className="mt-4 text-[#a4a3a0]">{s.modules.coreText}</p>}
              </div>
            </div>
            <div className="rounded-[24px] bg-[#f4f3f0] p-8 lg:col-span-7 lg:p-10">
              <p className="font-display text-[0.72rem] font-medium uppercase tracking-[0.2em] text-[#6f6e6b]">Módulos opcionais</p>
              <ul className="mt-8 flex flex-wrap gap-2">
                {s.modules.optional?.map((m) => (
                  <li key={m} className="rounded-full bg-white px-5 py-3 font-display text-[1.05rem] font-medium tracking-[-0.01em] shadow-[inset_0_0_0_1px_rgba(15,15,16,.06)]">
                    {m}
                  </li>
                ))}
              </ul>
              {s.modules.note && <p className="mt-10 border-t border-black/10 pt-6 text-[#6f6e6b]">{s.modules.note}</p>}
            </div>
          </div>
        </Panel>
      ) : null}

      {/* MICCA aplicado */}
      {s.micca?.items?.length ? (
        <Panel tone="ink" glow labelledby="micca-title">
          <div className="grid gap-10 lg:grid-cols-12" data-reveal>
            <div className="lg:col-span-8">
              <Kicker>{nn(next())}</Kicker>
              <HTitle id="micca-title" text={s.micca.title} className="hm-h2 mt-8" />
            </div>
            <div className="lg:col-span-4 lg:self-end lg:text-right">
              <HButton href="/metodologia-micca" label="Conheça o método MICCA" variant="line-dark" track={`especialidade_${slug}_micca`} />
            </div>
          </div>
          <div className="mt-16 lg:mt-24">
            <MiccaApplied items={s.micca.items} />
          </div>
        </Panel>
      ) : null}

      {/* Segmentos */}
      {s.segments?.items?.length ? (
        <Panel labelledby={s.segments.title ? 'seg-title' : undefined} label={s.segments.title ? undefined : s.name}>
          <BHead n={s.segments.title ? next() : undefined} id="seg-title" title={s.segments.title} text={s.segments.text} />
          <div className={s.segments.title ? 'mt-16 lg:mt-24' : ''}>
            <BItems items={s.segments.items} />
          </div>
        </Panel>
      ) : null}

      {/* Prova */}
      {s.proof?.title && (ctxMetrics.length > 0 || cases.length > 0) ? (
        <Panel labelledby="proof-title">
          <BHead n={next()} id="proof-title" title={s.proof.title} text={s.proof.text} />
          {ctxMetrics.length > 0 && (
            <div className="mt-16 lg:mt-24">
              <BMetrics metrics={ctxMetrics} />
            </div>
          )}
          {proofItems.length > 0 && (
            <div className="mt-16 lg:mt-24">
              <PortfolioShowcase items={proofItems} showFlags={showFlags} compact={proofItems.length > 2} />
            </div>
          )}
        </Panel>
      ) : null}

      {/* Chamada final + formulário */}
      <Panel tone="ink" glow id="formulario" labelledby="form-title">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5" data-reveal>
            <Kicker>{nn(next())}</Kicker>
            <HTitle id="form-title" text={s.final.title} className="hm-h2 mt-8" />
            {s.final.text && <p className="hm-lead mt-8">{s.final.text}</p>}
          </div>
          <div className="hm-formcard hm-formcard--dark p-6 sm:p-10 lg:col-span-7">
            <LeadForm
              token={issueFormToken()}
              form={isCore ? 'assessment' : 'especialidade'}
              defaultSegment={slug}
              defaultDemand={s.formDemand}
              tone="dark"
              submitLabel={s.final.cta?.label || 'Enviar'}
              successTitle={contact?.data.successTitle}
              successText={contact?.data.successText}
            />
          </div>
        </div>
      </Panel>
    </BPage>
  );
}
