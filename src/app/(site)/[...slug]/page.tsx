import { notFound, permanentRedirect } from 'next/navigation';
import { findRedirect, getDoc } from '@/lib/cms/content';
import { buildMetadata } from '@/lib/seo';
import { renderMarkdown } from '@/lib/markdown';
import { formatDate } from '@/components/site/blocks';
import { BCrumbs, BPage } from '@/components/home/boutique';

/**
 * Rota coringa:
 *  1. páginas legais editáveis (/politica-de-privacidade, /politica-de-cookies, /termos-de-uso…);
 *  2. redirecionamentos permanentes cadastrados no painel (URLs do site antigo → novas rotas);
 *  3. caso contrário, 404.
 */
type P = { params: Promise<{ slug: string[] }> };
type Legal = { title: string; updatedAt?: string; body: string };

export async function generateMetadata({ params }: P) {
  const { slug } = await params;
  if (slug.length !== 1) return {};
  const d = await getDoc<Legal>('legal', slug[0]);
  if (!d) return {};
  return buildMetadata({ path: `/${slug[0]}`, seo: d.seo, title: d.data.title });
}

export default async function CatchAll({ params }: P) {
  const { slug } = await params;
  const path = '/' + slug.map(decodeURIComponent).join('/');
  if (slug.length === 1) {
    const d = await getDoc<Legal>('legal', slug[0]);
    if (d)
      return (
        <BPage>
          <section className="hm-panel hm-panel--hero" aria-labelledby="page-title">
            <div className="hm-in pb-10 pt-[calc(var(--header-h)+34px)] lg:pb-14 lg:pt-[calc(var(--header-h)+48px)]">
              <BCrumbs items={[{ name: d.data.title, path }]} />
              <h1 id="page-title" className="hm-h1 hm-h1--article mt-16 max-w-[20ch] lg:mt-24">{d.data.title}</h1>
              {d.data.updatedAt && <p className="mt-6 text-[#6f6e6b]">Última atualização: {formatDate(d.data.updatedAt)}</p>}
            </div>
          </section>
          <article className="hm-panel">
            <div className="hm-in hm-pad">
              <div className="prose-grifo mx-auto" dangerouslySetInnerHTML={{ __html: renderMarkdown(d.data.body) }} />
            </div>
          </article>
        </BPage>
      );
  }
  const to = findRedirect(path);
  if (to && to !== path) permanentRedirect(to);
  notFound();
}
