import { listDocs } from '@/lib/cms/content';
import { buildMetadata } from '@/lib/seo';
import { EcosystemArc } from '@/components/visual/EcosystemArc';
import { BHero, BIndex, BPage, Object3D, Panel } from '@/components/home/boutique';

export async function generateMetadata() {
  return buildMetadata({ path: '/solucoes', title: 'Soluções de marketing integradas | Grifo Agency', description: 'Consulting, Marketing, Studios e Tech: quatro frentes integradas, da estratégia e das campanhas à produção audiovisual e à tecnologia.' });
}

export default async function SolutionsIndex() {
  const items = await listDocs<{ name: string; tagline?: string }>('solution');
  return (
    <BPage>
      <BHero
        hero={{ eyebrow: 'SOLUÇÕES', title: 'Diferentes especialidades.\nUma única visão de negócio.', text: 'Os melhores resultados acontecem quando estratégia, comunicação, conteúdo e tecnologia trabalham na mesma direção.' }}
        crumbs={[{ name: 'Soluções', path: '/solucoes' }]}
        visual={
          <span className="hm-cluster">
            {items.slice(0, 4).map((s, i) => (
              <Object3D key={s.slug} src={`/home/icone-${s.slug}-lg.webp`} priority={i < 2} delay={i * -1.7} />
            ))}
          </span>
        }
      />
      <Panel tone="ink" glow label="Frentes do ecossistema">
        <div className="mx-auto max-w-[760px] rounded-[24px] bg-[#18181a] p-6 sm:p-10" data-reveal>
          <EcosystemArc labels={Object.fromEntries(items.map((s) => [s.slug, s.data.name]))} />
        </div>
        <div className="mt-14 lg:mt-20">
          <BIndex dark icons base="/solucoes" prefix="Grifo " items={items.map((s) => ({ slug: s.slug, name: s.data.name, tagline: s.data.tagline }))} />
        </div>
      </Panel>
    </BPage>
  );
}
