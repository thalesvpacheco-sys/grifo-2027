import { test } from 'node:test';
import assert from 'node:assert/strict';
import { safeHref, safeMediaSrc, sanitizeFields, slugify } from '../src/lib/cms/validate.ts';
import { renderMarkdown } from '../src/lib/markdown.ts';

test('links de botões: bloqueia javascript:, data: e protocolo relativo', () => {
  assert.equal(safeHref('javascript:alert(1)'), '');
  assert.equal(safeHref(' JavaScript:alert(1)'), '');
  assert.equal(safeHref('data:text/html,<script>'), '');
  assert.equal(safeHref('//evil.example'), '');
  assert.equal(safeHref('/contato'), '/contato');
  assert.equal(safeHref('#formulario'), '#formulario');
  assert.equal(safeHref('https://grifo.agency'), 'https://grifo.agency');
  assert.equal(safeHref('mailto:oi@grifo.agency'), 'mailto:oi@grifo.agency');
});

test('mídia: só caminhos internos conhecidos ou https', () => {
  assert.equal(safeMediaSrc('/media/abc.webp'), '/media/abc.webp');
  assert.equal(safeMediaSrc('/media/../../etc/passwd'), '');
  assert.equal(safeMediaSrc('/qualquer/coisa.png'), '');
  assert.equal(safeMediaSrc('http://inseguro.com/x.png'), '');
});

test('sanitização por schema descarta campos desconhecidos e corrige tipos', () => {
  const out = sanitizeFields(
    [
      { kind: 'text', name: 'title', label: 'T', max: 5 },
      { kind: 'boolean', name: 'ok', label: 'B' },
      { kind: 'cta', name: 'cta', label: 'C' },
      { kind: 'list', name: 'items', label: 'L', fields: [{ kind: 'text', name: 'title', label: 'x' }] },
    ],
    { title: 'abcdefgh', ok: 'on', cta: { label: 'Ir', href: 'javascript:x' }, items: [{ title: 'a', hack: 1 }], intruso: '<script>' },
  );
  assert.deepEqual(out, { title: 'abcde', ok: true, cta: { label: 'Ir', href: '' }, items: [{ title: 'a' }] });
});

test('markdown é sanitizado (sem scripts, eventos ou iframes)', () => {
  const html = renderMarkdown('## Título\n\n<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\n[link](javascript:alert(1))\n\n<iframe src="https://x"></iframe>');
  assert.ok(html.includes('<h2>Título</h2>'));
  assert.ok(!/script|onerror|javascript:|iframe/i.test(html), html);
});

test('slug amigável', () => {
  assert.equal(slugify('Lançamento Reserva dos Ipês 2026!'), 'lancamento-reserva-dos-ipes-2026');
});
