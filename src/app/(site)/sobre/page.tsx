import { notFound } from 'next/navigation';
import { getDoc, listDocs, type Cta, type Img } from '@/lib/cms/content';
import { buildMetadata } from '@/lib/seo';
import { Media, type HeroData, type MetricData } from '@/components/site/blocks';
import { PlaceholderFlag } from '@/components/ui/Duo';
import { BFinal, BHead, BHero, BItems, BMetrics, BPage, Object3D, Panel, nn } from '@/components/home/boutique';
import { HTitle, Kicker } from '@/components/home/parts';
import { VideoOnDemand } from '@/components/visual/VideoOnDemand';
import { EcosystemArc } from '@/components/visual/EcosystemArc';
import { Gallery } from '@/components/case/Gallery';
import { sized } from '@/lib/media-meta';

type Sec = { title?: string; text?: string };
type About = {
  hero: HeroData;
  vision: Sec;
  manifesto: { title?: string; video?: { src: string; poster?: string }; poster?: Img };
  timeline: { title?: string; items?: { year: string; title: string; text?: string; pending?: boolean }[] };
  team: Sec;
  metrics: Sec;
  culture: Sec & { values?: { title: string; text?: string }[]; gallery?: { image: Img; caption?: string }[] };
  final: Sec & { cta?: Cta };
};
type Team = { name: string; role?: string; photo?: Img; bio?: string; linkedin?: string };

export async function generateMetadata() {
  const d = await getDoc<About>('about', 'sobre');
  return buildMetadata({ path: '/sobre', seo: d?.seo, title: 'Sobre a Grifo', description: d?.data.hero.text });
}

export default async function AboutPage() {
  const d = await getDoc<About>('about', 'sobre');
  if (!d) notFound();
  const a = d.data;
  const [team, metrics] = await Promise.all([listDocs<Team>('team'), listDocs<MetricData>('metric')]);
  const people = team.filter((t) => t.slug !== 'equipe-grifo');
  const m = metrics.filter((x) => x.data.contexts?.includes('sobre'));
  const gallery = await Promise.all(
    (a.culture.gallery ?? []).map(async (g) => {
      const z = await sized(g.image);
      return { src: z?.src || '', alt: z?.alt || '', w: z?.w, h: z?.h, lowres: z?.lowres, caption: g.caption };
    }),
  );

  let k = 0; // numeração dos capítulos (apenas números)
  const next = () => ++k;

  return (
    <BPage>
      <BHero
        hero={a.hero}
        crumbs={[{ name: 'Sobre', path: '/sobre' }]}
        ctaTrack="sobre_hero"
        visual={<Object3D src="/home/asa-noir.webp" priority />}
      />

      <Panel labelledby="vision-title">
        <div className="grid items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-6" data-reveal>
            <Kicker>{nn(next())}</Kicker>
            <HTitle id="vision-title" text={a.vision.title} className="hm-h2 mt-8" />
            {a.vision.text && <p className="hm-lead mt-8 max-w-[52ch]">{a.vision.text}</p>}
          </div>
          <div className="rounded-[24px] bg-[#18181a] p-6 sm:p-10 lg:col-span-6" data-reveal>
            <EcosystemArc />
          </div>
        </div>
      </Panel>

      {a.manifesto?.video?.src && (
        <Panel tone="ink" labelledby="manifesto-title">
          <h2 id="manifesto-title" className="hm-h3 mb-8 text-white">{a.manifesto.title}</h2>
          <VideoOnDemand src={a.manifesto.video.src} poster={a.manifesto.poster?.src || a.manifesto.video.poster} title={a.manifesto.title || 'Manifesto Grifo'} className="aspect-video" />
        </Panel>
      )}

      {a.timeline?.items?.length ? (
        <Panel tone="mist" labelledby="tl-title">
          <BHead n={next()} id="tl-title" title={a.timeline.title} />
          <ol className="mt-16 grid gap-2.5 md:grid-cols-3 lg:mt-24" data-reveal>
            {a.timeline.items.map((t, i) => (
              <li key={t.year + t.title} data-stagger style={{ ['--i' as string]: i }} className="hm-item flex min-h-[280px] flex-col p-7 lg:p-9">
                <p className="font-display text-[clamp(3.4rem,6vw,5.6rem)] font-medium leading-[.85] tracking-[-0.06em]">{t.year}</p>
                <h3 className="mt-auto pt-12 font-display text-xl font-medium tracking-[-0.02em]">{t.title}</h3>
                {t.text && <p className="hm-item-t mt-2 leading-relaxed">{t.text}</p>}
                {t.pending && <span className="mt-4 block"><PlaceholderFlag>Confirmar marco</PlaceholderFlag></span>}
              </li>
            ))}
          </ol>
        </Panel>
      ) : null}

      {m.length > 0 && (
        <Panel labelledby="metrics-title">
          <BHead n={next()} id="metrics-title" title={a.metrics.title} text={a.metrics.text} />
          <div className="mt-16 lg:mt-24"><BMetrics metrics={m} /></div>
        </Panel>
      )}

      {/* "Quem faz a Grifo acontecer" (equipe): oculto por enquanto, a pedido da gerência (13/11/2026) */}

      <Panel tone="ink" labelledby="culture-title">
        <BHead n={next()} id="culture-title" title={a.culture.title} text={a.culture.text} />
        <div className="mt-16 lg:mt-24"><BItems items={a.culture.values} dark /></div>
      </Panel>

      <BFinal data={a.final} track="sobre_final" />
    </BPage>
  );
}
