'use client';

import { useMemo, useState } from 'react';
import { ArticleCard, type ArticleData } from './cards';
import { ARTICLE_CATEGORIES } from '@/lib/cms/schema';
import type { Doc } from '@/lib/cms/content';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Listagem editorial com busca, filtro por categoria e por tag. */
export function InsightsList({ articles }: { articles: (Doc<ArticleData> & { minutes: number })[] }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [tag, setTag] = useState('');
  const tags = useMemo(() => Array.from(new Set(articles.flatMap((a) => a.data.tags ?? []))).sort(), [articles]);
  const cats = ARTICLE_CATEGORIES.filter((c) => articles.some((a) => a.data.category === c.value));
  const list = articles.filter((a) => {
    if (cat && a.data.category !== cat) return false;
    if (tag && !a.data.tags?.includes(tag)) return false;
    if (q && !norm(`${a.data.title} ${a.data.excerpt} ${(a.data.tags ?? []).join(' ')}`).includes(norm(q))) return false;
    return true;
  });

  if (!articles.length) return <p className="hm-lead">Os primeiros artigos estão em produção editorial.</p>;

  return (
    <div className="on-light">
      <div className="grid gap-6 border-b border-black/10 pb-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-4">
          <label htmlFor="busca" className="field-label">Buscar</label>
          <input id="busca" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tema, palavra-chave…" className="field" />
        </div>
        <fieldset className="lg:col-span-8">
          <legend className="mb-2.5 font-display text-[0.7rem] font-medium uppercase tracking-[0.2em] text-[#6f6e6b]">Assunto</legend>
          <div className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={!cat} className="hm-fchip" onClick={() => setCat('')}>Todos</button>
            {cats.map((c) => (
              <button key={c.value} type="button" aria-pressed={cat === c.value} className="hm-fchip" onClick={() => setCat(c.value)}>{c.label}</button>
            ))}
          </div>
        </fieldset>
      </div>
      {tags.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-[#6f6e6b]">Tags:</span>
          {tags.map((t) => (
            <button key={t} type="button" aria-pressed={tag === t} onClick={() => setTag(tag === t ? '' : t)} className={`rounded-full px-3 py-1.5 transition-colors ${tag === t ? 'bg-[#0f0f10] text-white' : 'bg-[#f4f3f0] text-[#3d3c3a] hover:bg-[#e9e8e4]'}`}>#{t}</button>
          ))}
        </div>
      )}
      <p className="sr-only" aria-live="polite">{list.length} artigo(s)</p>
      {list.length ? (
        <ul className="mt-12 grid gap-2.5 md:grid-cols-2 lg:grid-cols-3">
          {list.map((a) => <li key={a.id}><ArticleCard doc={a} minutes={a.minutes} /></li>)}
        </ul>
      ) : (
        <div className="mt-12 rounded-[24px] bg-[#f4f3f0] p-8">
          <p className="font-display text-xl font-medium">Nenhum artigo encontrado.</p>
          <button type="button" className="hm-btn hm-btn--line mt-5 !min-h-[44px]" onClick={() => { setQ(''); setCat(''); setTag(''); }}>Limpar busca e filtros</button>
        </div>
      )}
    </div>
  );
}
