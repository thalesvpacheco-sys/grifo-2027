import { notFound } from 'next/navigation';
import { getDoc, listDocs, type Img } from '@/lib/cms/content';
import { absUrl, buildMetadata } from '@/lib/seo';
import { readingTime, renderMarkdown } from '@/lib/markdown';
import { ArticleCard, Media, formatDate, type ArticleData } from '@/components/site/blocks';
import { BCrumbs, BPage } from '@/components/home/boutique';
import { HButton } from '@/components/home/parts';
import { PlaceholderFlag } from '@/components/ui/Duo';
import { JsonLd } from '@/components/site/JsonLd';
import { ShareButtons } from '@/components/site/ShareButtons';
import { ARTICLE_CATEGORIES } from '@/lib/cms/schema';

type P = { params: Promise<{ slug: string }> };
type Author = { name: string; role?: string; photo?: Img };

export async function generateMetadata({ params }: P) {
  const { slug } = await params;
  const d = await getDoc<ArticleData>('article', slug);
  if (!d) return {};
  return buildMetadata({ path: `/insights/${slug}`, seo: d.seo, title: d.data.title, description: d.data.excerpt, image: d.data.cover?.src, type: 'article', publishedTime: d.data.date });
}

export default async function ArticlePage({ params }: P) {
  const { slug } = await params;
  const d = await getDoc<ArticleData>('article', slug);
  if (!d) notFound();
  const a = d.data;
  const [author, all] = await Promise.all([a.author ? getDoc<Author>('team', a.author) : null, listDocs<ArticleData>('article')]);
  const related = all.filter((x) => x.slug !== slug && (x.data.category === a.category || x.data.tags?.some((t) => a.tags?.includes(t)))).slice(0, 3);
  const cat = ARTICLE_CATEGORIES.find((c) => c.value === a.category)?.label;
  const minutes = readingTime(a.body);
  const url = absUrl(`/insights/${slug}`);

  return (
    <BPage>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: a.title,
          description: a.excerpt,
          datePublished: a.date,
          dateModified: new Date(d.updatedAt).toISOString(),
          author: { '@type': author ? 'Person' : 'Organization', name: author?.data.name || 'Grifo Agency' },
          publisher: { '@type': 'Organization', name: 'Grifo Agency', logo: { '@type': 'ImageObject', url: absUrl('/brand/grifo-logo.svg') } },
          mainEntityOfPage: url,
          inLanguage: 'pt-BR',
          ...(cat ? { articleSection: cat } : {}),
          ...(a.tags?.length ? { keywords: a.tags.join(', ') } : {}),
          wordCount: (a.body || '').split(/\s+/).filter(Boolean).length,
          image: a.cover?.src ? (a.cover.src.startsWith('http') ? a.cover.src : absUrl(a.cover.src)) : absUrl('/brand/og-default.jpg'),
        }}
      />
      <section className="hm-panel hm-panel--hero" aria-labelledby="page-title">
        <div className="hm-in pb-10 pt-[calc(var(--header-h)+34px)] lg:pb-14 lg:pt-[calc(var(--header-h)+48px)]">
          <BCrumbs items={[{ name: 'Insights', path: '/insights' }, { name: a.title, path: `/insights/${slug}` }]} />
          <div className="hero-seq mt-16 max-w-[62rem] lg:mt-24">
            {cat ? <p className="hm-pill"><i aria-hidden="true" />{cat}</p> : <span />}
            <h1 id="page-title" className="hm-h1 hm-h1--article mt-7">{a.title}</h1>
            {a.excerpt ? <p className="hm-lead mt-8 max-w-[56ch] !text-[#4b4a47]">{a.excerpt}</p> : <span />}
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-black/10 pt-6 text-sm text-[#6f6e6b]">
            {author && <span>Por <strong className="font-medium text-[#0f0f10]">{author.data.name}</strong></span>}
            {a.date && <time dateTime={a.date}>{formatDate(a.date)}</time>}
            <span>{minutes} min de leitura</span>
            {d.placeholder && <PlaceholderFlag>Rascunho editorial — revisar</PlaceholderFlag>}
          </div>
        </div>
      </section>

      <article className="hm-panel">
        <div className="hm-in hm-pad">
          {a.cover?.src && (
            <Media img={a.cover} sizes="(min-width:1360px) 1300px, 100vw" priority className="mb-14 aspect-[21/9] rounded-[22px] lg:mb-20" />
          )}
          <div className="grid gap-12 lg:grid-cols-12">
            <aside className="order-2 lg:order-1 lg:col-span-3">
              <div className="space-y-8 lg:sticky lg:top-28">
                <ShareButtons url={url} title={a.title} />
                {a.tags?.length ? (
                  <div>
                    <p className="font-display text-[0.7rem] font-medium uppercase tracking-[0.2em] text-[#6f6e6b]">Tags</p>
                    <ul className="mt-3 flex flex-wrap gap-1.5 text-sm">{a.tags.map((t) => <li key={t} className="hm-tag">#{t}</li>)}</ul>
                  </div>
                ) : null}
              </div>
            </aside>
            <div className="order-1 lg:order-2 lg:col-span-8 lg:col-start-5">
              <div className="prose-grifo" dangerouslySetInnerHTML={{ __html: renderMarkdown(a.body) }} />
              <div className="mt-16 flex flex-col gap-6 rounded-[24px] bg-[#0f0f10] p-8 text-white sm:p-10 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="font-display text-[1.7rem] font-medium leading-tight tracking-[-0.03em]">Quer aplicar isso no seu negócio?</p>
                  <p className="mt-2 text-[#a4a3a0]">Conte seu desafio para a equipe Grifo.</p>
                </div>
                <HButton href="/contato" label="Vamos conversar" variant="white" track={`artigo_${slug}`} className="shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="hm-panel hm-panel--mist" aria-labelledby="rel-title">
          <div className="hm-in hm-pad">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2 id="rel-title" className="hm-h2">Leia também</h2>
              <HButton href="/insights" label="Ver todos os insights" variant="line" />
            </div>
            <ul className="mt-14 grid gap-2.5 md:grid-cols-3">
              {related.map((r) => <li key={r.id}><ArticleCard doc={r} minutes={readingTime(r.data.body)} /></li>)}
            </ul>
          </div>
        </section>
      )}
    </BPage>
  );
}
