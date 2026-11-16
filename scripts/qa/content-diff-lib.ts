/**
 * Diferença editorial entre o CONTENT_LOCK_BASELINE.json e o seed atual.
 * Toda diferença precisa estar na lista de permitidas (Prompt Mestre 2027, §02): a especialidade Concessionárias,
 * seus pontos de integração (aba MICCA, roteamento de leads) e redirecionamentos de URLs antigas.
 */
export type Change = { key: string; path: string; kind: 'added' | 'removed' | 'changed'; before?: unknown; after?: unknown };

function walk(key: string, path: string, a: unknown, b: unknown, out: Change[]) {
  if (JSON.stringify(a) === JSON.stringify(b)) return;
  const isObj = (x: unknown) => x !== null && typeof x === 'object';
  if (Array.isArray(a) && Array.isArray(b)) {
    // listas: compara por posição; itens novos no fim ou inseridos aparecem como "added"
    const len = Math.max(a.length, b.length);
    const aj = a.map((x) => JSON.stringify(x));
    for (let i = 0, j = 0; i < len || j < b.length; ) {
      if (i < a.length && j < b.length && aj[i] === JSON.stringify(b[j])) { i++; j++; continue; }
      if (j < b.length && !aj.includes(JSON.stringify(b[j]))) { out.push({ key, path: `${path}[${j}]`, kind: 'added', after: b[j] }); j++; continue; }
      if (i < a.length && !b.some((y) => JSON.stringify(y) === aj[i])) { out.push({ key, path: `${path}[${i}]`, kind: 'removed', before: a[i] }); i++; continue; }
      if (i < a.length && j < b.length) { walk(key, `${path}[${j}]`, a[i], b[j], out); i++; j++; continue; }
      break;
    }
    return;
  }
  if (isObj(a) && isObj(b) && !Array.isArray(a) && !Array.isArray(b)) {
    const ka = Object.keys(a as object), kb = Object.keys(b as object);
    for (const k of new Set([...ka, ...kb])) {
      const va = (a as Record<string, unknown>)[k], vb = (b as Record<string, unknown>)[k];
      if (!(k in (a as object))) out.push({ key, path: `${path}.${k}`, kind: 'added', after: vb });
      else if (!(k in (b as object))) out.push({ key, path: `${path}.${k}`, kind: 'removed', before: va });
      else walk(key, `${path}.${k}`, va, vb, out);
    }
    return;
  }
  out.push({ key, path, kind: 'changed', before: a, after: b });
}

type D = { key: string; title: string; placeholder: boolean; sort: number; seo: unknown; data: unknown };
export function diffContent(base: D[], cur: D[]): Change[] {
  const out: Change[] = [];
  const bm = new Map(base.map((d) => [d.key, d]));
  const cm = new Map(cur.map((d) => [d.key, d]));
  for (const [k, d] of bm) {
    const c = cm.get(k);
    if (!c) { out.push({ key: k, path: '', kind: 'removed', before: d.title }); continue; }
    walk(k, 'title', d.title, c.title, out);
    walk(k, 'placeholder', d.placeholder, c.placeholder, out);
    walk(k, 'seo', d.seo, c.seo, out);
    walk(k, 'data', d.data, c.data, out);
  }
  for (const [k, c] of cm) if (!bm.has(k)) out.push({ key: k, path: '', kind: 'added', after: c.title });
  return out;
}

/** Regras de diferença permitida. */
export function isAllowed(c: Change): boolean {
  if (c.key === 'specialty/concessionarias' && c.kind === 'added') return true;
  if (c.key.startsWith('redirect/') && c.kind === 'added') return true;
  if (c.key === 'micca/metodologia-micca' && c.kind === 'added' && /^data\.applications\[\d+\]$/.test(c.path) && (c.after as { sector?: string })?.sector === 'concessionarias') return true;
  if (c.key === 'settings/global' && c.kind === 'added' && /^data\.leadRouting\[\d+\]$/.test(c.path) && (c.after as { segment?: string })?.segment === 'concessionarias') return true;
  return false;
}
