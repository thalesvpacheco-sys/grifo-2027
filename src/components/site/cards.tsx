import Image from 'next/image';
import Link from 'next/link';
import type { Doc, Img } from '@/lib/cms/content';
import { PlaceholderFlag } from '../ui/Duo';
import { Wing } from '../brand/Logo';
import { ARTICLE_CATEGORIES, SECTORS, COMPETENCIES } from '@/lib/cms/schema';

/* Componentes de card sem dependências de servidor (usáveis em Server e Client Components). */

/* ───────── Mídia com fallback identificado ───────── */
export function Media({ img, sizes, className = '', priority = false, fill = true }: { img?: Img; sizes: string; className?: string; priority?: boolean; fill?: boolean }) {
  if (!img?.src)
    return (
      <div className={`relative flex items-center justify-center overflow-hidden bg-grafite-800 ${className}`} role="img" aria-label="Imagem pendente">
        <Wing className="h-10 w-16 text-white/10" />
        <span className="absolute bottom-3 left-3 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white/60">Imagem pendente</span>
      </div>
    );
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image src={img.src} alt={img.alt || ''} fill={fill} sizes={sizes} priority={priority} unoptimized={/^https?:\/\//.test(img.src)} className="object-cover" />
    </div>
  );
}

/* ───────── Cards ───────── */
const label = (list: { value: string; label: string }[], v?: string) => list.find((x) => x.value === v)?.label ?? v ?? '';

export type CaseData = { title: string; client?: string; sector?: string; competencies?: string[]; summary?: string; cover?: Img; year?: string };

export function CaseCard({ doc, priority = false, large = false, tone = 'light' }: { doc: Doc<CaseData>; priority?: boolean; large?: boolean; tone?: 'light' | 'dark' }) {
  const d = doc.data;
  return (
    <article className="group relative flex h-full flex-col">
      <Media img={d.cover} sizes={large ? '(min-width:1024px) 60vw, 100vw' : '(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw'} priority={priority} className={`rounded-2xl ${large ? 'aspect-[16/10]' : 'aspect-[4/3]'} [&_img]:transition-transform [&_img]:duration-700 [&_img]:ease-out group-hover:[&_img]:scale-[1.04]`} />
      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
        <span className={`font-semibold ${tone === 'dark' ? 'text-ambar' : 'text-vinho'}`}>{label(SECTORS, d.sector)}</span>
        {d.competencies?.length ? <span className="opacity-70">{d.competencies.map((c) => label(COMPETENCIES, c)).join(', ')}</span> : null}
        {doc.placeholder && <PlaceholderFlag>Aguardando aprovação</PlaceholderFlag>}
      </div>
      <h3 className="mt-2 font-display text-h3 font-semibold">
        <Link href={`/projetos/${doc.slug}`} className="after:absolute after:inset-0 after:content-['']">
          {d.title}
        </Link>
      </h3>
      {d.summary && <p className="mt-2 max-w-md leading-relaxed opacity-70">{d.summary}</p>}
    </article>
  );
}

export type ArticleData = { title: string; excerpt?: string; category?: string; tags?: string[]; date?: string; cover?: Img; body?: string; author?: string };

export function formatDate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso + (iso.length === 10 ? 'T12:00:00' : ''));
  return isNaN(+d) ? '' : d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function ArticleCard({ doc, minutes }: { doc: Doc<ArticleData>; minutes?: number }) {
  const d = doc.data;
  return (
    <article className="hm-post group relative flex h-full min-h-[300px] flex-col p-7 lg:p-8">
      {d.cover?.src ? <Media img={d.cover} sizes="(min-width:1024px) 30vw, (min-width:768px) 45vw, 100vw" className="-mx-3 -mt-3 mb-7 aspect-[16/9] rounded-[18px] lg:-mx-4 lg:-mt-4 [&_img]:transition-transform [&_img]:duration-700 group-hover:[&_img]:scale-[1.03]" /> : null}
      <div className={`flex flex-wrap items-center gap-x-3 gap-y-2 text-sm ${d.cover?.src ? '' : 'pr-12'}`}>
        <span className="font-semibold text-vinho">{label(ARTICLE_CATEGORIES, d.category)}</span>
        <time dateTime={d.date} className="text-[#6f6e6b]">{formatDate(d.date)}</time>
        {minutes ? <span className="text-[#6f6e6b]">{minutes} min de leitura</span> : null}
        {doc.placeholder && <PlaceholderFlag>Rascunho editorial</PlaceholderFlag>}
      </div>
      <div className={`mt-auto ${d.cover?.src ? 'pt-5' : 'pt-10'}`}>
        <h3 className="font-display text-[clamp(1.35rem,1.8vw,1.7rem)] font-medium leading-[1.08] tracking-[-0.035em] text-[#0f0f10]">
          <Link href={`/insights/${doc.slug}`} className="after:absolute after:inset-0 after:rounded-[24px] after:content-['']">
            {d.title}
          </Link>
        </h3>
        {d.excerpt && <p className="mt-3 leading-relaxed text-[#6f6e6b]">{d.excerpt}</p>}
      </div>
      <span className="hm-card-arrow absolute right-6 top-6 bg-white text-[#0f0f10] transition-colors group-hover:bg-[#0f0f10] group-hover:text-white" aria-hidden="true">
        <svg viewBox="0 0 16 16"><path d="M4 12 12 4M5.5 4H12v6.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
    </article>
  );
}
