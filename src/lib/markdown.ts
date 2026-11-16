import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

marked.setOptions({ gfm: true, breaks: false });

/** Converte Markdown em HTML sanitizado (lista branca de tags/atributos — bloqueia scripts, eventos e iframes). */
export function renderMarkdown(md: string | undefined | null): string {
  if (!md) return '';
  const raw = marked.parse(md, { async: false }) as string;
  return sanitizeHtml(raw, {
    allowedTags: ['h2', 'h3', 'h4', 'p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'hr', 'img', 'figure', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
    allowedAttributes: { a: ['href', 'title', 'target', 'rel'], img: ['src', 'alt', 'width', 'height', 'loading'] },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['https', 'http'] },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        const external = /^https?:\/\//.test(attribs.href || '');
        return { tagName, attribs: { ...attribs, ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {}) } };
      },
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: 'lazy' } }),
      h1: 'h2',
    },
  });
}

export function readingTime(md: string | undefined): number {
  const words = (md || '').replace(/[#>*_`\-\[\]()]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function plainText(md: string | undefined, max = 160): string {
  const t = sanitizeHtml(marked.parse(md || '', { async: false }) as string, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max - 1).trimEnd() + '…' : t;
}
