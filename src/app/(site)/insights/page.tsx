import { getDoc, listDocs } from '@/lib/cms/content';
import { buildMetadata } from '@/lib/seo';
import { readingTime } from '@/lib/markdown';
import { type ArticleData, type HeroData } from '@/components/site/blocks';
import { BHero, BPage, Panel } from '@/components/home/boutique';
import { InsightsList } from '@/components/site/InsightsList';

export async function generateMetadata() {
  const d = await getDoc<{ hero: HeroData }>('insightsPage', 'insights');
  return buildMetadata({ path: '/insights', seo: d?.seo, title: 'Insights' });
}

export default async function InsightsPage() {
  const [page, articles] = await Promise.all([getDoc<{ hero: HeroData }>('insightsPage', 'insights'), listDocs<ArticleData>('article')]);
  const list = [...articles]
    .sort((a, b) => (b.data.date || '').localeCompare(a.data.date || ''))
    .map((a) => ({ ...a, data: { ...a.data, body: undefined }, minutes: readingTime(a.data.body) }));
  return (
    <BPage>
      <BHero hero={page?.data.hero} crumbs={[{ name: 'Insights', path: '/insights' }]} size="mega" />
      <Panel label="Artigos">
        <InsightsList articles={list} />
      </Panel>
    </BPage>
  );
}
