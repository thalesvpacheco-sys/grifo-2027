import { getDoc, listDocs } from '@/lib/cms/content';
import { buildMetadata } from '@/lib/seo';
import { type HeroData, type MetricData } from '@/components/site/blocks';
import { BHero, BMetrics, BPage, Object3D, Panel } from '@/components/home/boutique';
import { HTitle, Kicker } from '@/components/home/parts';
import { LeadForm } from '@/components/forms/LeadForm';
import { issueFormToken } from '@/lib/leads/service';

type Core = { hero: HeroData; assessment: { title?: string; text?: string; checklist?: { title: string }[] } };

export async function generateMetadata() {
  const d = await getDoc<Core>('coreLanding', 'grifo-core');
  return buildMetadata({ path: '/grifo-core', seo: d?.seo, title: 'Grifo Core Assessment' });
}

export default async function CoreLanding() {
  const [d, metrics, contact] = await Promise.all([getDoc<Core>('coreLanding', 'grifo-core'), listDocs<MetricData>('metric'), getDoc<{ successTitle?: string; successText?: string }>('contactPage', 'contato')]);
  const c = d?.data;
  const m = metrics.filter((x) => x.data.contexts?.includes('imobiliario'));
  return (
    <BPage>
      <BHero
        hero={c?.hero}
        tone="ink"
        crumbs={[{ name: 'Grifo Core', path: '/grifo-core' }]}
        ctaTrack="core_hero"
        visual={<Object3D src="/home/icone-imobiliario-lg.webp" priority />}
      />
      {m.length > 0 && (
        <Panel label="Indicadores" inner="py-10 sm:py-14">
          <BMetrics metrics={m} />
        </Panel>
      )}
      <Panel tone="ink" glow id="assessment" labelledby="as-title">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5" data-reveal>
            <Kicker>01</Kicker>
            <HTitle id="as-title" text={c?.assessment.title} className="hm-h2 mt-8" />
            {c?.assessment.text && <p className="hm-lead mt-8">{c.assessment.text}</p>}
            {c?.assessment.checklist?.length ? (
              <ul className="mt-10 grid grid-cols-2 gap-2">
                {c.assessment.checklist.map((x) => (
                  <li key={x.title} className="flex items-center gap-3 rounded-full bg-white/[.05] px-4 py-3 font-display text-[1.02rem] tracking-[-0.01em] text-[#e4e3df]">
                    <i className="hm-dot shrink-0" aria-hidden="true" />
                    {x.title}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="hm-formcard hm-formcard--dark p-6 sm:p-10 lg:col-span-7">
            <LeadForm token={issueFormToken()} form="assessment" defaultSegment="imobiliario" defaultDemand="lancamento" tone="dark" submitLabel="Solicitar Grifo Core Assessment" successTitle={contact?.data.successTitle} successText={contact?.data.successText} />
          </div>
        </div>
      </Panel>
    </BPage>
  );
}
