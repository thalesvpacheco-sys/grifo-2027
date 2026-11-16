import 'server-only';
import { db, now, tx } from '../db';
import { DOC_TYPES, SEO_FIELDS, getDocType } from './schema';
import { emptyFor, sanitizeFields, slugify } from './validate';

export type AdminDoc = {
  id: number;
  type: string;
  slug: string;
  title: string;
  draft: Record<string, unknown>;
  published: Record<string, unknown> | null;
  draftSeo: Record<string, unknown>;
  placeholder: boolean;
  sort: number;
  createdAt: number;
  updatedAt: number;
  publishedAt: number | null;
  status: 'publicado' | 'rascunho' | 'alterado';
  updatedBy: string | null;
};

type Row = {
  id: number; type: string; slug: string; title: string; draft: string; published: string | null; draft_seo: string; published_seo: string | null;
  placeholder: number; sort: number; created_at: number; updated_at: number; published_at: number | null; updated_by: number | null; editor?: string | null;
};

function toAdmin(r: Row): AdminDoc {
  const status = !r.published ? 'rascunho' : r.published === r.draft && (r.published_seo ?? '{}') === r.draft_seo ? 'publicado' : 'alterado';
  return {
    id: r.id,
    type: r.type,
    slug: r.slug,
    title: r.title,
    draft: JSON.parse(r.draft),
    published: r.published ? JSON.parse(r.published) : null,
    draftSeo: JSON.parse(r.draft_seo || '{}'),
    placeholder: !!r.placeholder,
    sort: r.sort,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    publishedAt: r.published_at,
    status,
    updatedBy: r.editor ?? null,
  };
}

const SELECT = 'SELECT d.*, u.name AS editor FROM documents d LEFT JOIN users u ON u.id = d.updated_by';

export function listByType(type: string): AdminDoc[] {
  return (db().prepare(`${SELECT} WHERE d.type = ? ORDER BY d.sort ASC, d.updated_at DESC`).all(type) as Row[]).map(toAdmin);
}

export function getById(id: number): AdminDoc | null {
  const r = db().prepare(`${SELECT} WHERE d.id = ?`).get(id) as Row | undefined;
  return r ? toAdmin(r) : null;
}

export function recentDocs(limit = 8): AdminDoc[] {
  return (db().prepare(`${SELECT} WHERE d.type != 'settings' ORDER BY d.updated_at DESC LIMIT ?`).all(limit) as Row[]).map(toAdmin);
}

export function countsByType(): Record<string, { total: number; pending: number; placeholders: number }> {
  const rows = db()
    .prepare(
      `SELECT type, COUNT(*) total,
        SUM(CASE WHEN published IS NULL OR published != draft OR COALESCE(published_seo,'{}') != draft_seo THEN 1 ELSE 0 END) pending,
        SUM(placeholder) placeholders
       FROM documents GROUP BY type`,
    )
    .all() as { type: string; total: number; pending: number; placeholders: number }[];
  return Object.fromEntries(rows.map((r) => [r.type, { total: r.total, pending: r.pending, placeholders: r.placeholders }]));
}

function titleFrom(type: string, data: Record<string, unknown>, fallback: string): string {
  const dt = getDocType(type);
  const key = dt?.titleField || (dt?.fields.some((f) => f.name === 'title') ? 'title' : 'name');
  const v = data[key];
  return (typeof v === 'string' && v.trim()) || fallback;
}

function uniqueSlug(type: string, base: string, exceptId?: number): string {
  let slug = base || 'item';
  let i = 2;
  while (db().prepare('SELECT 1 FROM documents WHERE type = ? AND slug = ? AND id != ?').get(type, slug, exceptId ?? -1)) slug = `${base}-${i++}`;
  return slug;
}

function revision(docId: number, action: string, data: string, seo: string, userId: number) {
  db().prepare('INSERT INTO revisions (document_id, action, data, seo, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(docId, action, data, seo, userId, now());
  // mantém as 30 revisões mais recentes por documento
  db().prepare('DELETE FROM revisions WHERE document_id = ? AND id NOT IN (SELECT id FROM revisions WHERE document_id = ? ORDER BY id DESC LIMIT 30)').run(docId, docId);
}

export function createDoc(type: string, title: string, userId: number): number {
  const dt = getDocType(type);
  if (!dt || dt.singleton) throw new Error('Tipo inválido.');
  const data = emptyFor(dt.fields);
  const key = dt.titleField || (dt.fields.some((f) => f.name === 'title') ? 'title' : 'name');
  data[key] = title.slice(0, 200);
  const slug = uniqueSlug(type, slugify(title));
  const t = now();
  const r = db()
    .prepare('INSERT INTO documents (type, slug, title, draft, draft_seo, placeholder, sort, created_at, updated_at, updated_by) VALUES (?, ?, ?, ?, ?, 0, 999, ?, ?, ?)')
    .run(type, slug, title.slice(0, 200), JSON.stringify(data), '{}', t, t, userId);
  return Number(r.lastInsertRowid);
}

export function saveDraft(id: number, input: { data: unknown; seo?: unknown; slug?: string; placeholder?: boolean }, userId: number): AdminDoc {
  const doc = getById(id);
  if (!doc) throw new Error('Documento não encontrado.');
  const dt = getDocType(doc.type)!;
  const data = sanitizeFields(dt.fields, input.data);
  const seo = dt.hasSeo ? sanitizeFields(SEO_FIELDS, input.seo) : {};
  let placeholder = input.placeholder ?? doc.placeholder;
  // Indicador validado deixa de ser placeholder automaticamente (e vice-versa).
  if (doc.type === 'metric') placeholder = !data.validated;
  const slug = dt.singleton ? doc.slug : uniqueSlug(doc.type, slugify(input.slug || doc.slug) || doc.slug, id);
  const sort = typeof data.order === 'number' ? data.order : doc.sort;
  const title = titleFrom(doc.type, data, doc.title);
  const d = JSON.stringify(data);
  const s = JSON.stringify(seo);
  tx(() => {
    db().prepare('UPDATE documents SET draft = ?, draft_seo = ?, slug = ?, title = ?, placeholder = ?, sort = ?, updated_at = ?, updated_by = ? WHERE id = ?').run(d, s, slug, title, placeholder ? 1 : 0, sort, now(), userId, id);
    revision(id, 'salvo', d, s, userId);
  });
  return getById(id)!;
}

export function publishDoc(id: number, userId: number) {
  const doc = getById(id);
  if (!doc) throw new Error('Documento não encontrado.');
  tx(() => {
    db().prepare('UPDATE documents SET published = draft, published_seo = draft_seo, published_at = ?, updated_by = ? WHERE id = ?').run(now(), userId, id);
    revision(id, 'publicado', JSON.stringify(doc.draft), JSON.stringify(doc.draftSeo), userId);
  });
}

export function unpublishDoc(id: number, userId: number) {
  const doc = getById(id);
  if (!doc) throw new Error('Documento não encontrado.');
  if (getDocType(doc.type)?.singleton) throw new Error('Páginas fixas não podem ser despublicadas.');
  db().prepare('UPDATE documents SET published = NULL, published_seo = NULL, updated_by = ? WHERE id = ?').run(userId, id);
}

export function discardDraft(id: number, userId: number) {
  const doc = getById(id);
  if (!doc?.published) throw new Error('Não há versão publicada para restaurar.');
  db().prepare('UPDATE documents SET draft = published, draft_seo = COALESCE(published_seo, draft_seo), updated_at = ?, updated_by = ? WHERE id = ?').run(now(), userId, id);
}

export function deleteDoc(id: number) {
  const doc = getById(id);
  if (!doc) return;
  if (getDocType(doc.type)?.singleton) throw new Error('Páginas fixas não podem ser excluídas.');
  db().prepare('DELETE FROM documents WHERE id = ?').run(id);
}

export function listRevisions(id: number) {
  return db()
    .prepare('SELECT r.id, r.action, r.created_at, u.name AS user FROM revisions r LEFT JOIN users u ON u.id = r.user_id WHERE r.document_id = ? ORDER BY r.id DESC LIMIT 30')
    .all(id)
    .map((r) => ({ ...(r as object) })) as { id: number; action: string; created_at: number; user: string | null }[];
}

export function restoreRevision(docId: number, revId: number, userId: number) {
  const r = db().prepare('SELECT data, seo FROM revisions WHERE id = ? AND document_id = ?').get(revId, docId) as { data: string; seo: string } | undefined;
  if (!r) throw new Error('Revisão não encontrada.');
  return saveDraft(docId, { data: JSON.parse(r.data), seo: JSON.parse(r.seo) }, userId);
}

export function referenceOptions(type: string): { value: string; label: string }[] {
  return (db().prepare('SELECT slug, title FROM documents WHERE type = ? ORDER BY title').all(type) as { slug: string; title: string }[]).map((r) => ({ value: r.slug, label: r.title }));
}

export { DOC_TYPES };
