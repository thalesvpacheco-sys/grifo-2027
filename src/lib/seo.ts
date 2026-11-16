import 'server-only';
import type { Metadata } from 'next';
import { env } from './env';
import { getSettings, type Doc } from './cms/content';

export async function buildMetadata(opts: {
  path: string;
  title?: string;
  description?: string;
  seo?: Doc['seo'];
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
}): Promise<Metadata> {
  const s = await getSettings();
  const title = opts.seo?.title || opts.title || s.siteName;
  const description = opts.seo?.description || opts.description || s.description;
  const img = opts.seo?.ogImage?.src || opts.image || s.ogImage?.src || '/brand/og-default.jpg';
  const url = env.siteUrl + (opts.path === '/' ? '' : opts.path);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    robots: opts.seo?.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: opts.type ?? 'website',
      locale: 'pt_BR',
      url,
      siteName: s.siteName,
      title,
      description,
      images: [{ url: img.startsWith('http') ? img : env.siteUrl + img, width: 1200, height: 630 }],
      ...(opts.publishedTime ? { publishedTime: opts.publishedTime } : {}),
    },
    twitter: { card: 'summary_large_image', title, description, images: [img.startsWith('http') ? img : env.siteUrl + img] },
  };
}

export function absUrl(p: string) {
  return env.siteUrl + p;
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absUrl(it.path) })),
  };
}

/** Schema.org Service para frentes e especialidades (provedor: a organização Grifo). */
export function serviceLd(o: { name: string; description?: string; path: string; serviceType?: string; offers?: string[]; audience?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: o.name,
    ...(o.description ? { description: o.description } : {}),
    serviceType: o.serviceType || o.name,
    url: absUrl(o.path),
    inLanguage: 'pt-BR',
    areaServed: { '@type': 'Country', name: 'Brasil' },
    provider: { '@type': 'Organization', name: 'Grifo Agency', url: env.siteUrl },
    ...(o.audience ? { audience: { '@type': 'BusinessAudience', name: o.audience } } : {}),
    ...(o.offers?.length
      ? { hasOfferCatalog: { '@type': 'OfferCatalog', name: o.name, itemListElement: o.offers.map((n) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: n } })) } }
      : {}),
  };
}

/** Link de telefone em formato internacional (números brasileiros sem DDI recebem +55). */
export function telHref(phone: string) {
  const d = phone.replace(/[^\d+]/g, '');
  return `tel:${d.startsWith('+') ? d : d.length >= 10 && d.length <= 11 ? `+55${d}` : d}`;
}
