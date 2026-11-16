import type { Field } from './schema';

/**
 * Sanitiza dados de um documento conforme o schema do tipo:
 *  - descarta campos desconhecidos;
 *  - converte tipos (número, booleano, listas);
 *  - limita tamanhos;
 *  - aceita somente URLs seguras (relativas, âncoras, http/https, mailto, tel) — bloqueia javascript:, data: etc.
 */
const LIMITS = { text: 500, textarea: 4000, markdown: 120_000, url: 1000 };

export function safeHref(v: unknown): string {
  const s = String(v ?? '').trim().slice(0, LIMITS.url);
  if (!s) return '';
  if (/^(\/(?!\/)|#|\?)/.test(s)) return s; // relativo, âncora ou query
  if (/^https?:\/\/[^\s<>"']+$/i.test(s)) return s;
  if (/^mailto:[^\s<>"']+$/i.test(s) || /^tel:[+\d\s()-]+$/i.test(s)) return s;
  return '';
}

export function safeMediaSrc(v: unknown): string {
  const s = String(v ?? '').trim().slice(0, LIMITS.url);
  if (!s) return '';
  if (/^\/(media|acervo|brand|video)\/[\w./-]+$/.test(s) && !s.includes('..')) return s;
  if (/^https:\/\/[^\s<>"']+$/i.test(s)) return s;
  return '';
}

const str = (v: unknown, max: number) => String(v ?? '').replace(/\u0000/g, '').slice(0, max);

export function sanitizeFields(fields: Field[], input: unknown): Record<string, unknown> {
  const src = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const f of fields) out[f.name] = sanitizeField(f, src[f.name]);
  return out;
}

function sanitizeField(f: Field, v: unknown): unknown {
  switch (f.kind) {
    case 'text':
      return str(v, f.max ?? LIMITS.text);
    case 'textarea':
      return str(v, f.max ?? LIMITS.textarea);
    case 'markdown':
      return str(v, LIMITS.markdown);
    case 'url':
      return safeHref(v);
    case 'number': {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    }
    case 'boolean':
      return v === true || v === 'true' || v === 'on';
    case 'date':
      return /^\d{4}-\d{2}-\d{2}$/.test(String(v ?? '')) ? String(v) : '';
    case 'select':
      return f.options.some((o) => o.value === v) ? v : '';
    case 'multiselect':
      return Array.isArray(v) ? v.filter((x) => f.options.some((o) => o.value === x)) : [];
    case 'tags':
      return Array.isArray(v) ? v.map((x) => str(x, 120).trim()).filter(Boolean).slice(0, 50) : [];
    case 'image': {
      const o = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
      return { src: safeMediaSrc(o.src), alt: str(o.alt, 300) };
    }
    case 'video': {
      const o = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
      return { src: safeMediaSrc(o.src), poster: safeMediaSrc(o.poster) };
    }
    case 'cta': {
      const o = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
      return { label: str(o.label, 120), href: safeHref(o.href) };
    }
    case 'reference':
      if (f.multiple) return Array.isArray(v) ? v.map((x) => str(x, 120)).filter((x) => /^[a-z0-9-]+$/.test(x)).slice(0, 30) : [];
      return /^[a-z0-9-]*$/.test(String(v ?? '')) ? str(v, 120) : '';
    case 'group':
      return sanitizeFields(f.fields, v);
    case 'list':
      return Array.isArray(v) ? v.slice(0, f.max ?? 100).map((it) => sanitizeFields(f.fields, it)) : [];
  }
}

export function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Valor vazio inicial para um conjunto de campos (usado ao criar documentos e itens de lista). */
export function emptyFor(fields: Field[]): Record<string, unknown> {
  const o: Record<string, unknown> = {};
  for (const f of fields) {
    switch (f.kind) {
      case 'number':
        o[f.name] = 0;
        break;
      case 'boolean':
        o[f.name] = false;
        break;
      case 'multiselect':
      case 'tags':
      case 'list':
        o[f.name] = [];
        break;
      case 'reference':
        o[f.name] = f.multiple ? [] : '';
        break;
      case 'image':
        o[f.name] = { src: '', alt: '' };
        break;
      case 'video':
        o[f.name] = { src: '', poster: '' };
        break;
      case 'cta':
        o[f.name] = { label: '', href: '' };
        break;
      case 'group':
        o[f.name] = emptyFor(f.fields);
        break;
      default:
        o[f.name] = '';
    }
  }
  return o;
}

export function requiredMissing(fields: Field[], data: Record<string, unknown>, prefix = ''): string[] {
  const miss: string[] = [];
  for (const f of fields) {
    const v = data[f.name];
    if ('required' in f && f.required && (v === '' || v == null)) miss.push(prefix + f.label);
    if (f.kind === 'group') miss.push(...requiredMissing(f.fields, (v as Record<string, unknown>) ?? {}, `${f.label} › `));
  }
  return miss;
}
