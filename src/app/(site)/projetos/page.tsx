import { getDoc, listDocs, placeholdersVisible, type Cta } from '@/lib/cms/content';
import { buildMetadata } from '@/lib/seo';
import { sized } from '@/lib/media-meta';
import { type CaseData, type HeroData } from '@/components/site/blocks';
import { BFinal, BHero, BPage, Panel } from '@/components/home/boutique';
import { ProjectsGrid } from '@/components/site/ProjectsGrid';

type PageData = { hero: HeroData; final: { title?: string; text?: string; cta?: Cta } };

export async function generateMetadata() {
  const d = await getDoc<PageData>('projectsPage', 'projetos');
  return buildMetadata({ path: '/projetos', seo: d?.seo, title: 'Projetos' });
}

export default async function ProjectsPage() {
  const [page, cases, showFlags] = await Promise.all([getDoc<PageData>('projectsPage', 'projetos'), listDocs<CaseData>('case'), placeholdersVisible()]);
  const items = await Promise.all(cases.map(async (doc) => ({ doc, cover: await sized(doc.data.cover) })));
  return (
    <BPage>
      <BHero hero={page?.data.hero} crumbs={[{ name: 'Projetos', path: '/projetos' }]} size="mega" />
      <Panel label="Lista de projetos">
        <ProjectsGrid items={items} showFlags={showFlags} />
      </Panel>
      <BFinal data={page?.data.final} track="projetos_final" />
    </BPage>
  );
}
