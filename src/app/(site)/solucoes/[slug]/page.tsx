import { notFound } from 'next/navigation';
import { getDoc, listDocs, type Cta, type Img } from '@/lib/cms/content';
import { buildMetadata, serviceLd } from '@/lib/seo';
import { JsonLd } from '@/components/site/JsonLd';
import { type HeroData } from '@/components/site/blocks';
import { ServiceGrid } from '@/components/site/ServiceGrid';
import { BFinal, BHead, BHero, BIndex, BPage, Object3D, Panel } from '@/components/home/boutique';
import { Kicker } from '@/components/home/parts';
import { VideoOnDemand } from '@/components/visual/VideoOnDemand';

type Solution = {
  name: string;
  tagline?: string;
  hero: HeroData;
  image?: Img;
  video?: { src: string; poster: string };
  services: { title?: string; text?: string; items?: { title: string; text?: string }[] };
  final: { title?: string; text?: string; cta?: Cta };
};

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P) {
  const { slug } = await params;
  const d = await getDoc<Solution>('solution', slug);
  if (!d) return {};
  return buildMetadata({ path: `/solucoes/${slug}`, seo: d.seo, title: `Grifo ${d.data.name}`, description: d.data.hero.text, image: d.data.image?.src });
}

export default async function SolutionPage({ params }: P) {
  const { slug } = await params;
  const d = await getDoc<Solution>('solution', slug);
  if (!d) notFound();
  const s = d.data;
  const others = (await listDocs<{ name: string; tagline?: string }>('solution')).filter((x) => x.slug !== slug);

  return (
    <BPage>
      <JsonLd data={serviceLd({ name: `Grifo ${s.name}`, description: d.seo?.description || s.hero.text, path: `/solucoes/${slug}`, offers: s.services.items?.map((x) => x.title) })} />
      <BHero
        hero={s.hero}
        crumbs={[{ name: 'Soluções', path: '/solucoes' }, { name: s.name, path: `/solucoes/${slug}` }]}
        ctaTrack={`solucao_${slug}_hero`}
        visual={<Object3D src={`/home/icone-${slug}-lg.webp`} priority />}
      />

      <Panel labelledby="serv-title">
        <BHead n={1} id="serv-title" title={s.services.title} text={s.services.text} />
        <div className="mt-16 lg:mt-24">
          <ServiceGrid items={s.services.items} />
        </div>
      </Panel>

      {s.video?.src && (
        <Panel tone="ink" label="Vídeo">
          <VideoOnDemand src={s.video.src} poster={s.video.poster} title={`Grifo ${s.name} em movimento`} className="aspect-video" />
        </Panel>
      )}

      <Panel tone="ink" glow labelledby="others-title">
        <div data-reveal>
          <Kicker>02</Kicker>
          <h2 id="others-title" className="hm-h2 mt-8 max-w-[18ch]">As outras frentes do ecossistema</h2>
        </div>
        <div className="mt-14 lg:mt-20">
          <BIndex dark icons base="/solucoes" prefix="Grifo " items={others.map((o) => ({ slug: o.slug, name: o.data.name, tagline: o.data.tagline }))} />
        </div>
      </Panel>

      <BFinal data={s.final} track={`solucao_${slug}_final`} />
    </BPage>
  );
}
