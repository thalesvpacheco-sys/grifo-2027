import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { publicPath } from '@/lib/cms/schema';

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  const rows = db()
    .prepare("SELECT type, slug, published_seo, updated_at, placeholder FROM documents WHERE published IS NOT NULL AND type NOT IN ('settings','redirect','team','metric')")
    .all() as { type: string; slug: string; published_seo: string | null; updated_at: number; placeholder: number }[];
  const out: MetadataRoute.Sitemap = [
    { url: `${env.siteUrl}/solucoes`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${env.siteUrl}/especialidades`, changeFrequency: 'monthly', priority: 0.6 },
  ];
  for (const r of rows) {
    if (r.placeholder && !env.showPlaceholders) continue;
    if (JSON.parse(r.published_seo || '{}').noindex) continue;
    const p = publicPath(r.type, r.slug);
    if (!p) continue;
    out.push({
      url: env.siteUrl + (p === '/' ? '' : p),
      lastModified: new Date(r.updated_at),
      changeFrequency: r.type === 'article' ? 'monthly' : 'weekly',
      priority: p === '/' ? 1 : r.type === 'specialty' || r.type === 'solution' ? 0.8 : 0.6,
    });
  }
  return out;
}
