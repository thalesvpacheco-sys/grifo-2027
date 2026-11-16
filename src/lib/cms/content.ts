import 'server-only';
import { cache } from 'react';
import { draftMode } from 'next/headers';
import { db } from '../db';
import { env } from '../env';

export type Img = { src: string; alt: string };
export type Cta = { label: string; href: string };
export type Doc<T = Record<string, unknown>> = {
  id: number;
  type: string;
  slug: string;
  title: string;
  data: T;
  seo: { title?: string; description?: string; ogImage?: Img; noindex?: boolean };
  placeholder: boolean;
  updatedAt: number;
  publishedAt: number | null;
};

type Row = {
  id: number;
  type: string;
  slug: string;
  title: string;
  draft: string;
  published: string | null;
  draft_seo: string;
  published_seo: string | null;
  placeholder: number;
  sort: number;
  updated_at: number;
  published_at: number | null;
};

async function isPreview(): Promise<boolean> {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    return false;
  }
}

function toDoc<T>(r: Row, preview: boolean): Doc<T> | null {
  const raw = preview ? r.draft : r.published;
  if (!raw) return null;
  return {
    id: r.id,
    type: r.type,
    slug: r.slug,
    title: r.title,
    data: JSON.parse(raw) as T,
    seo: JSON.parse((preview ? r.draft_seo : r.published_seo) || '{}'),
    placeholder: !!r.placeholder,
    updatedAt: r.updated_at,
    publishedAt: r.published_at,
  };
}

/** Placeholders aparecem apenas no preview do painel ou quando CONTENT_SHOW_PLACEHOLDERS=true. */
export const placeholdersVisible = cache(async () => env.showPlaceholders || (await isPreview()));

export const getDoc = cache(async <T = Record<string, unknown>>(type: string, slug: string): Promise<Doc<T> | null> => {
  const preview = await isPreview();
  const r = db().prepare('SELECT * FROM documents WHERE type = ? AND slug = ?').get(type, slug) as Row | undefined;
  if (!r) return null;
  const d = toDoc<T>(r, preview);
  if (!d) return null;
  if (d.placeholder && !(await placeholdersVisible())) return null;
  return d;
});

export const listDocs = cache(async <T = Record<string, unknown>>(type: string): Promise<Doc<T>[]> => {
  const preview = await isPreview();
  const showPh = await placeholdersVisible();
  const rows = db().prepare('SELECT * FROM documents WHERE type = ? ORDER BY sort ASC, published_at DESC, id ASC').all(type) as Row[];
  return rows.map((r) => toDoc<T>(r, preview)).filter((d): d is Doc<T> => !!d && (showPh || !d.placeholder));
});

export async function getDocsBySlugs<T>(type: string, slugs: string[] | undefined): Promise<Doc<T>[]> {
  if (!slugs?.length) return [];
  const all = await listDocs<T>(type);
  return slugs.map((s) => all.find((d) => d.slug === s)).filter((d): d is Doc<T> => !!d);
}

export type Settings = {
  siteName: string;
  tagline: string;
  description: string;
  ogImage?: Img;
  contact: { email: string; phone: string; whatsapp: string; address: string };
  socials: { name: string; url: string }[];
  legal: { company: string; cnpj: string; dpo: string };
  leadRouting: { segment: string; emails: string }[];
  gtmId: string;
  retentionMonths: number;
  privacyVersion: string;
};

export const getSettings = cache(async (): Promise<Settings> => {
  const r = db().prepare("SELECT published FROM documents WHERE type = 'settings' AND slug = 'global'").get() as { published: string } | undefined;
  const s = (r?.published ? JSON.parse(r.published) : {}) as Partial<Settings>;
  return {
    siteName: s.siteName || 'Grifo Agency',
    tagline: s.tagline || 'O ecossistema para marcas que fazem história.',
    description: s.description || '',
    ogImage: s.ogImage,
    contact: { email: '', phone: '', whatsapp: '', address: '', ...(s.contact ?? {}) },
    socials: (s.socials ?? []).filter((x) => x?.url),
    legal: { company: '', cnpj: '', dpo: '', ...(s.legal ?? {}) },
    leadRouting: s.leadRouting ?? [],
    gtmId: s.gtmId || env.gtmId,
    retentionMonths: Number(s.retentionMonths) || 24,
    privacyVersion: s.privacyVersion || '1',
  };
});

/** Leitura sem cache de request (para rotas de API). */
export function getSettingsSync(): Settings {
  const r = db().prepare("SELECT published FROM documents WHERE type = 'settings' AND slug = 'global'").get() as { published: string } | undefined;
  const s = (r?.published ? JSON.parse(r.published) : {}) as Partial<Settings>;
  return {
    siteName: s.siteName || 'Grifo Agency',
    tagline: s.tagline || '',
    description: s.description || '',
    contact: { email: '', phone: '', whatsapp: '', address: '', ...(s.contact ?? {}) },
    socials: s.socials ?? [],
    legal: { company: '', cnpj: '', dpo: '', ...(s.legal ?? {}) },
    leadRouting: s.leadRouting ?? [],
    gtmId: s.gtmId || env.gtmId,
    retentionMonths: Number(s.retentionMonths) || 24,
    privacyVersion: s.privacyVersion || '1',
  };
}

export function findRedirect(pathname: string): string | null {
  const rows = db().prepare("SELECT published FROM documents WHERE type = 'redirect' AND published IS NOT NULL").all() as { published: string }[];
  const norm = (p: string) => '/' + p.replace(/^\/+|\/+$/g, '').toLowerCase();
  for (const r of rows) {
    const d = JSON.parse(r.published) as { from?: string; to?: string };
    if (d.from && d.to && norm(d.from) === norm(pathname)) return d.to;
  }
  return null;
}
