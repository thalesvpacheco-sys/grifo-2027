'use client';

import { createContext, useContext, useId, useState } from 'react';
import type { Field } from '@/lib/cms/schema';
import { emptyFor } from '@/lib/cms/validate';
import { MediaPicker } from './MediaPicker';
import { MarkdownField } from './MarkdownField';

type Ctx = { refs: Record<string, { value: string; label: string }[]>; routes: string[]; acervo: string[] };
export const EditorContext = createContext<Ctx>({ refs: {}, routes: [], acervo: [] });

type V = Record<string, unknown>;

export function FieldList({ fields, value, onChange, path }: { fields: Field[]; value: V; onChange: (v: V) => void; path: string }) {
  return (
    <div className="space-y-6">
      {fields.filter((f) => !f.showWhen || f.showWhen.equals.includes(String(value?.[f.showWhen.field] ?? ''))).map((f) => (
        <FieldInput key={f.name} field={f} value={value?.[f.name]} onChange={(nv) => onChange({ ...value, [f.name]: nv })} path={`${path}.${f.name}`} />
      ))}
    </div>
  );
}

function Help({ id, text }: { id: string; text?: string }) {
  return text ? <p id={id} className="mt-1 text-xs text-grafite/55">{text}</p> : null;
}

function Counter({ value, max }: { value: string; max?: number }) {
  if (!max) return null;
  const over = value.length > max;
  return <span className={`text-xs tabular-nums ${over ? 'font-semibold text-vinho' : 'text-grafite/45'}`}>{value.length}/{max}</span>;
}

function FieldInput({ field: f, value, onChange, path }: { field: Field; value: unknown; onChange: (v: unknown) => void; path: string }) {
  const uid = useId();
  const ctx = useContext(EditorContext);
  const id = `${uid}-${f.name}`;
  const helpId = `${id}-help`;
  const label = (
    <div className="mb-1.5 flex items-baseline justify-between gap-2">
      <label htmlFor={id} className="text-sm font-semibold">
        {f.label}
        {'required' in f && f.required ? <span className="text-vinho" aria-hidden="true"> *</span> : null}
      </label>
      {(f.kind === 'text' || f.kind === 'textarea') && <Counter value={String(value ?? '')} max={f.max} />}
    </div>
  );
  const describedBy = f.help ? helpId : undefined;

  switch (f.kind) {
    case 'text':
      return (
        <div>
          {label}
          <input id={id} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} aria-describedby={describedBy} aria-required={f.required} className="field py-2.5" />
          <Help id={helpId} text={f.help} />
        </div>
      );
    case 'textarea':
      return (
        <div>
          {label}
          <textarea id={id} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} rows={f.rows ?? 3} aria-describedby={describedBy} aria-required={f.required} className="field resize-y py-2.5" />
          <Help id={helpId} text={f.help} />
        </div>
      );
    case 'markdown':
      return (
        <div>
          {label}
          <MarkdownField id={id} value={String(value ?? '')} onChange={onChange} describedBy={describedBy} />
          <Help id={helpId} text={f.help ?? 'Use ## para subtítulos, **negrito**, *itálico*, - listas e [texto](link).'} />
        </div>
      );
    case 'url':
      return (
        <div>
          {label}
          <input id={id} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder ?? 'https://'} inputMode="url" aria-describedby={describedBy} className="field py-2.5" />
          <Help id={helpId} text={f.help} />
        </div>
      );
    case 'number':
      return (
        <div className="max-w-[200px]">
          {label}
          <input id={id} type="number" value={Number(value ?? 0)} onChange={(e) => onChange(Number(e.target.value))} aria-describedby={describedBy} className="field py-2.5" />
          <Help id={helpId} text={f.help} />
        </div>
      );
    case 'date':
      return (
        <div className="max-w-[240px]">
          {label}
          <input id={id} type="date" value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} aria-describedby={describedBy} className="field py-2.5" />
          <Help id={helpId} text={f.help} />
        </div>
      );
    case 'boolean':
      return (
        <div>
          <label htmlFor={id} className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
            <input id={id} type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} aria-describedby={describedBy} className="h-5 w-5 accent-[#8D2525]" />
            {f.label}
          </label>
          <Help id={helpId} text={f.help} />
        </div>
      );
    case 'select':
      return (
        <div className="max-w-md">
          {label}
          <select id={id} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} aria-describedby={describedBy} className="field field-select py-2.5">
            <option value="">— Selecione —</option>
            {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <Help id={helpId} text={f.help} />
        </div>
      );
    case 'multiselect': {
      const arr = Array.isArray(value) ? (value as string[]) : [];
      return (
        <fieldset aria-describedby={describedBy}>
          <legend className="mb-1.5 text-sm font-semibold">{f.label}</legend>
          <div className="flex flex-wrap gap-2">
            {f.options.map((o) => {
              const on = arr.includes(o.value);
              return (
                <label key={o.value} className={`cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 transition-colors ${on ? 'bg-grafite text-white ring-grafite' : 'ring-grafite/20 hover:bg-grafite/5'}`}>
                  <input type="checkbox" className="sr-only" checked={on} onChange={() => onChange(on ? arr.filter((x) => x !== o.value) : [...arr, o.value])} />
                  {o.label}
                </label>
              );
            })}
          </div>
          <Help id={helpId} text={f.help} />
        </fieldset>
      );
    }
    case 'tags':
      return <TagsInput id={id} label={label} value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} help={f.help} helpId={helpId} />;
    case 'image': {
      const v = (value ?? { src: '', alt: '' }) as { src: string; alt: string };
      return (
        <div>
          <p className="mb-1.5 text-sm font-semibold" id={id}>{f.label}</p>
          <div className="flex flex-wrap items-start gap-4 rounded-xl border border-grafite/10 p-3">
            <div className="flex h-24 w-36 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-grafite/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {v.src ? <img src={v.src} alt="" className="h-full w-full object-cover" /> : <span className="text-xs text-grafite/40">Sem imagem</span>}
            </div>
            <div className="min-w-[220px] flex-1 space-y-2">
              <div className="flex flex-wrap gap-2">
                <MediaPicker accept="image" acervo={ctx.acervo} onSelect={(m) => onChange({ src: m.url, alt: v.alt || m.alt })} label={v.src ? 'Trocar imagem' : 'Escolher imagem'} />
                {v.src && <button type="button" onClick={() => onChange({ src: '', alt: '' })} className="rounded-full px-3 py-1.5 text-sm font-semibold text-vinho ring-1 ring-vinho/30">Remover</button>}
              </div>
              <div>
                <label htmlFor={`${id}-alt`} className="text-xs font-semibold text-grafite/70">Texto alternativo (descreva a imagem)</label>
                <input id={`${id}-alt`} value={v.alt} onChange={(e) => onChange({ ...v, alt: e.target.value })} aria-invalid={!!v.src && !v.alt} className="field py-2 text-sm" />
                {v.src && !v.alt && <p className="field-error text-xs">Descreva a imagem para leitores de tela.</p>}
              </div>
            </div>
          </div>
          <Help id={helpId} text={f.help} />
        </div>
      );
    }
    case 'video': {
      const v = (value ?? { src: '', poster: '' }) as { src: string; poster: string };
      return (
        <div>
          <p className="mb-1.5 text-sm font-semibold">{f.label}</p>
          <div className="space-y-2 rounded-xl border border-grafite/10 p-3 text-sm">
            <p className="truncate text-grafite/70">{v.src || 'Nenhum vídeo selecionado.'}</p>
            <div className="flex flex-wrap gap-2">
              <MediaPicker accept="video" acervo={[]} onSelect={(m) => onChange({ ...v, src: m.url })} label={v.src ? 'Trocar vídeo' : 'Escolher vídeo'} />
              <MediaPicker accept="image" acervo={ctx.acervo} onSelect={(m) => onChange({ ...v, poster: m.url })} label={v.poster ? 'Trocar capa' : 'Escolher capa'} />
              {v.src && <button type="button" onClick={() => onChange({ src: '', poster: '' })} className="rounded-full px-3 py-1.5 font-semibold text-vinho ring-1 ring-vinho/30">Remover</button>}
            </div>
          </div>
          <Help id={helpId} text={f.help ?? 'Vídeos carregam só quando o visitante clica em reproduzir.'} />
        </div>
      );
    }
    case 'cta': {
      const v = (value ?? { label: '', href: '' }) as { label: string; href: string };
      const listId = `${id}-routes`;
      return (
        <fieldset className="rounded-xl border border-grafite/10 p-3">
          <legend className="px-1 text-sm font-semibold">{f.label}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor={`${id}-l`} className="text-xs font-semibold text-grafite/70">Texto do botão</label>
              <input id={`${id}-l`} value={v.label} onChange={(e) => onChange({ ...v, label: e.target.value })} className="field py-2 text-sm" />
            </div>
            <div>
              <label htmlFor={`${id}-h`} className="text-xs font-semibold text-grafite/70">Destino (página, âncora ou link)</label>
              <input id={`${id}-h`} list={listId} value={v.href} onChange={(e) => onChange({ ...v, href: e.target.value })} placeholder="/contato" className="field py-2 text-sm" />
              <datalist id={listId}>{ctx.routes.map((r) => <option key={r} value={r} />)}</datalist>
            </div>
          </div>
          {v.label && !v.href && <p className="field-error text-xs">Todo botão precisa de um destino real.</p>}
        </fieldset>
      );
    }
    case 'reference': {
      const opts = ctx.refs[f.to] ?? [];
      if (!f.multiple)
        return (
          <div className="max-w-md">
            {label}
            <select id={id} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} className="field field-select py-2.5">
              <option value="">— Nenhum —</option>
              {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        );
      const arr = Array.isArray(value) ? (value as string[]) : [];
      const move = (i: number, d: number) => {
        const n = [...arr];
        const [x] = n.splice(i, 1);
        n.splice(i + d, 0, x);
        onChange(n);
      };
      return (
        <div>
          <p className="mb-1.5 text-sm font-semibold">{f.label}</p>
          <ol className="space-y-1.5">
            {arr.map((s, i) => (
              <li key={s} className="flex items-center gap-2 rounded-lg bg-grafite/[.04] px-3 py-2 text-sm">
                <span className="flex-1 truncate">{opts.find((o) => o.value === s)?.label ?? s}</span>
                <button type="button" aria-label="Mover para cima" disabled={i === 0} onClick={() => move(i, -1)} className="px-1.5 disabled:opacity-30">↑</button>
                <button type="button" aria-label="Mover para baixo" disabled={i === arr.length - 1} onClick={() => move(i, 1)} className="px-1.5 disabled:opacity-30">↓</button>
                <button type="button" aria-label="Remover" onClick={() => onChange(arr.filter((x) => x !== s))} className="px-1.5 text-vinho">✕</button>
              </li>
            ))}
          </ol>
          <label htmlFor={id} className="sr-only">Adicionar</label>
          <select id={id} value="" onChange={(e) => e.target.value && onChange([...arr, e.target.value])} className="field field-select mt-2 max-w-md py-2 text-sm">
            <option value="">+ Adicionar…</option>
            {opts.filter((o) => !arr.includes(o.value)).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      );
    }
    case 'group':
      return (
        <details open={!f.collapsed} className="group/g rounded-xl border border-grafite/10 open:bg-[#fbfaf8]">
          <summary className="cursor-pointer list-none rounded-xl px-4 py-3 font-display text-base font-semibold hover:bg-grafite/[.03]">
            <span className="mr-2 inline-block text-grafite/40 transition-transform group-open/g:rotate-90" aria-hidden="true">›</span>
            {f.label}
          </summary>
          <div className="border-t border-grafite/10 p-4">
            {f.help && <p className="mb-4 text-xs text-grafite/55">{f.help}</p>}
            <FieldList fields={f.fields} value={(value as V) ?? {}} onChange={onChange} path={path} />
          </div>
        </details>
      );
    case 'list':
      return <ListField field={f} value={Array.isArray(value) ? (value as V[]) : []} onChange={onChange} path={path} />;
  }
}

function ListField({ field: f, value, onChange, path }: { field: Extract<Field, { kind: 'list' }>; value: V[]; onChange: (v: unknown) => void; path: string }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  // Blocos tipados (ex.: blocos de case) mostram o tipo antes do título.
  const typeField = f.fields.find((x) => x.name === 'type' && x.kind === 'select') as Extract<Field, { kind: 'select' }> | undefined;
  const typeLabel = (it: V) => (typeField ? typeField.options.find((o) => o.value === it.type)?.label : undefined);
  const titleOf = (it: V, i: number) => {
    const base = String(it.title || it.name || it.label || it.pillar || it.year || it.segment || (it.image as V)?.alt || '').split('\n')[0];
    const tl = typeLabel(it);
    if (tl) return `${tl}${base ? ` — ${base}` : ''}${it.hidden ? ' (oculto)' : ''}`;
    return base || `${f.itemLabel ?? 'Item'} ${i + 1}`;
  };
  const move = (i: number, d: number) => {
    const n = [...value];
    const [x] = n.splice(i, 1);
    n.splice(i + d, 0, x);
    onChange(n);
    setOpenIdx(i + d);
  };
  const canAdd = !f.max || value.length < f.max;
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-semibold">
        {f.label} <span className="font-normal text-grafite/45">({value.length}{f.max ? `/${f.max}` : ''})</span>
      </legend>
      {f.help && <p className="mb-2 text-xs text-grafite/55">{f.help}</p>}
      <ol className="space-y-2">
        {value.map((it, i) => (
          <li key={i} className="rounded-xl border border-grafite/10 bg-white">
            <div className="flex items-center gap-1 pr-2">
              <button type="button" aria-expanded={openIdx === i} onClick={() => setOpenIdx(openIdx === i ? null : i)} className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5 text-left text-sm">
                <span className="w-6 shrink-0 text-xs tabular-nums text-grafite/40">{i + 1}</span>
                <span className="truncate font-medium">{titleOf(it, i)}</span>
              </button>
              <button type="button" aria-label={`Mover ${titleOf(it, i)} para cima`} disabled={i === 0} onClick={() => move(i, -1)} className="rounded px-2 py-1 text-sm disabled:opacity-25">↑</button>
              <button type="button" aria-label={`Mover ${titleOf(it, i)} para baixo`} disabled={i === value.length - 1} onClick={() => move(i, 1)} className="rounded px-2 py-1 text-sm disabled:opacity-25">↓</button>
              <button
                type="button"
                aria-label={`Remover ${titleOf(it, i)}`}
                onClick={() => {
                  if (confirm(`Remover "${titleOf(it, i)}"?`)) onChange(value.filter((_, k) => k !== i));
                }}
                className="rounded px-2 py-1 text-sm text-vinho"
              >
                ✕
              </button>
            </div>
            {openIdx === i && (
              <div className="border-t border-grafite/10 p-4">
                <FieldList fields={f.fields} value={it} onChange={(nv) => onChange(value.map((x, k) => (k === i ? nv : x)))} path={`${path}.${i}`} />
              </div>
            )}
          </li>
        ))}
      </ol>
      {canAdd && (
        <button
          type="button"
          onClick={() => {
            onChange([...value, emptyFor(f.fields)]);
            setOpenIdx(value.length);
          }}
          className="mt-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-grafite/20 hover:bg-grafite/5"
        >
          + Adicionar {(f.itemLabel ?? 'item').toLowerCase()}
        </button>
      )}
    </fieldset>
  );
}

function TagsInput({ id, label, value, onChange, help, helpId }: { id: string; label: React.ReactNode; value: string[]; onChange: (v: unknown) => void; help?: string; helpId: string }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const parts = draft.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length) onChange([...value, ...parts.filter((p) => !value.includes(p))]);
    setDraft('');
  };
  return (
    <div>
      {label}
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-grafite/20 bg-white p-2 focus-within:border-vinho">
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-grafite/[.07] py-1 pl-3 pr-1 text-sm">
            {t}
            <button type="button" aria-label={`Remover ${t}`} onClick={() => onChange(value.filter((x) => x !== t))} className="rounded-full px-1.5 text-grafite/60 hover:text-vinho">✕</button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add();
            } else if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={add}
          placeholder="Digite e pressione Enter"
          aria-describedby={helpId}
          className="min-w-[160px] flex-1 border-0 bg-transparent px-2 py-1 text-sm outline-none"
        />
      </div>
      <Help id={helpId} text={help} />
    </div>
  );
}
