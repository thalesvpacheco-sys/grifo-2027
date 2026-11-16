import { notFound } from 'next/navigation';
import { getDoc, type Cta } from '@/lib/cms/content';
import { buildMetadata } from '@/lib/seo';
import { type HeroData } from '@/components/site/blocks';
import { BFinal, BHead, BHero, BPage, Panel } from '@/components/home/boutique';
import { Micca } from '@/components/visual/Micca';

type MiccaDoc = {
  hero: HeroData;
  pillars: { letter?: string; name: string; summary?: string; text?: string }[];
  applications: { sector: string; label?: string; items?: { pillar: string; text: string }[] }[];
  why: { title?: string; text?: string };
  final: { title?: string; text?: string; cta?: Cta };
};

export async function generateMetadata() {
  const d = await getDoc<MiccaDoc>('micca', 'metodologia-micca');
  return buildMetadata({ path: '/metodologia-micca', seo: d?.seo, title: 'Metodologia MICCA', description: d?.data.hero.text });
}

export default async function MiccaPage() {
  const d = await getDoc<MiccaDoc>('micca', 'metodologia-micca');
  if (!d) notFound();
  const m = d.data;
  return (
    <BPage>
      <BHero
        hero={m.hero}
        crumbs={[{ name: 'Metodologia MICCA', path: '/metodologia-micca' }]}
        ctaTrack="micca_hero"
        size="mega"
      />
      <Panel tone="ink" glow labelledby="pillars-title">
        <h2 id="pillars-title" className="sr-only">Os cinco pilares</h2>
        <Micca pillars={m.pillars} applications={m.applications} />
      </Panel>
      {m.why?.title && (
        <Panel tone="mist" labelledby="why-title">
          <BHead n={1} wide id="why-title" title={m.why.title} text={m.why.text} />
        </Panel>
      )}
      <BFinal data={m.final} track="micca_final" />
    </BPage>
  );
}
