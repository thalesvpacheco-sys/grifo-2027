import fs from 'node:fs';
import path from 'node:path';
import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { getDocType, publicPath, type Field } from '@/lib/cms/schema';
import { getById, listRevisions, referenceOptions } from '@/lib/cms/repo';
import { db } from '@/lib/db';
import { DocEditor } from '@/components/admin/DocEditor';

function refTypes(fields: Field[], acc = new Set<string>()): Set<string> {
  for (const f of fields) {
    if (f.kind === 'reference') acc.add(f.to);
    if (f.kind === 'group' || f.kind === 'list') refTypes(f.fields, acc);
  }
  return acc;
}

export default async function EditDoc({ params }: { params: Promise<{ type: string; id: string }> }) {
  const u = await requireUser();
  const { type, id } = await params;
  const dt = getDocType(type);
  const doc = getById(Number(id));
  if (!dt || !doc || doc.type !== type) notFound();
  if ((type === 'settings' || type === 'redirect') && u.role !== 'admin') redirect('/admin?erro=permissao');

  const refs = Object.fromEntries([...refTypes(dt.fields)].map((t) => [t, referenceOptions(t)]));
  const routes = (db().prepare("SELECT type, slug FROM documents WHERE type NOT IN ('settings','redirect','team','metric')").all() as { type: string; slug: string }[])
    .map((r) => publicPath(r.type, r.slug))
    .filter((p): p is string => !!p)
    .concat(['/solucoes', '/especialidades', '/contato?segmento=imobiliario', '#formulario'])
    .sort();
  let acervo: string[] = [];
  try {
    acervo = fs.readdirSync(path.join(process.cwd(), 'public', 'acervo')).filter((f) => /\.(webp|jpg|png)$/.test(f)).map((f) => `/acervo/${f}`);
  } catch {
    /* sem acervo */
  }

  return (
    <DocEditor
      key={doc.id}
      initial={doc}
      typeName={type}
      refs={refs}
      routes={routes}
      acervo={acervo}
      revisions={listRevisions(doc.id)}
      publicUrl={publicPath(doc.type, doc.slug)}
      isAdmin={u.role === 'admin'}
    />
  );
}
