'use client';

import { useRef, useState, useTransition } from 'react';
import { renderMarkdownAction } from '@/app/admin/actions';

const TOOLS: { label: string; title: string; wrap?: [string, string]; line?: string }[] = [
  { label: 'B', title: 'Negrito', wrap: ['**', '**'] },
  { label: 'I', title: 'Itálico', wrap: ['*', '*'] },
  { label: 'H2', title: 'Subtítulo', line: '## ' },
  { label: 'H3', title: 'Subtítulo menor', line: '### ' },
  { label: '•', title: 'Lista', line: '- ' },
  { label: '1.', title: 'Lista numerada', line: '1. ' },
  { label: '❝', title: 'Citação', line: '> ' },
  { label: 'Link', title: 'Link', wrap: ['[', '](https://)'] },
];

/** Editor Markdown com barra de formatação e prévia renderizada pelo servidor (mesma sanitização do site). */
export function MarkdownField({ id, value, onChange, describedBy }: { id: string; value: string; onChange: (v: string) => void; describedBy?: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const [html, setHtml] = useState('');
  const [pending, start] = useTransition();

  const apply = (t: (typeof TOOLS)[number]) => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const sel = value.slice(s, e);
    let next: string;
    let cursor: number;
    if (t.wrap) {
      next = value.slice(0, s) + t.wrap[0] + (sel || 'texto') + t.wrap[1] + value.slice(e);
      cursor = s + t.wrap[0].length + (sel || 'texto').length;
    } else {
      const ls = value.lastIndexOf('\n', s - 1) + 1;
      next = value.slice(0, ls) + t.line + value.slice(ls);
      cursor = e + (t.line?.length ?? 0);
    }
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-grafite/20 bg-white focus-within:border-vinho">
      <div className="flex flex-wrap items-center gap-1 border-b border-grafite/10 bg-[#fbfaf8] px-2 py-1.5">
        <div role="tablist" aria-label="Modo do editor" className="mr-2 flex rounded-full bg-grafite/[.06] p-0.5 text-xs font-semibold">
          <button type="button" role="tab" aria-selected={tab === 'edit'} onClick={() => setTab('edit')} className={`rounded-full px-3 py-1 ${tab === 'edit' ? 'bg-white shadow-sm' : ''}`}>Escrever</button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'preview'}
            onClick={() => {
              setTab('preview');
              start(async () => setHtml(await renderMarkdownAction(value)));
            }}
            className={`rounded-full px-3 py-1 ${tab === 'preview' ? 'bg-white shadow-sm' : ''}`}
          >
            Prévia
          </button>
        </div>
        {tab === 'edit' &&
          TOOLS.map((t) => (
            <button key={t.title} type="button" title={t.title} aria-label={t.title} onClick={() => apply(t)} className="min-w-[32px] rounded-md px-2 py-1 text-sm font-semibold text-grafite/70 hover:bg-grafite/[.07]">
              {t.label}
            </button>
          ))}
      </div>
      {tab === 'edit' ? (
        <textarea id={id} ref={ref} value={value} onChange={(e) => onChange(e.target.value)} rows={12} aria-describedby={describedBy} className="block w-full resize-y border-0 px-4 py-3 font-mono text-[0.92rem] leading-relaxed outline-none" />
      ) : (
        <div className="prose-grifo min-h-[200px] max-w-none px-5 py-4" aria-busy={pending}>
          {pending ? <p className="text-grafite/50">Gerando prévia…</p> : <div dangerouslySetInnerHTML={{ __html: html || '<p><em>Sem conteúdo.</em></p>' }} />}
        </div>
      )}
    </div>
  );
}
