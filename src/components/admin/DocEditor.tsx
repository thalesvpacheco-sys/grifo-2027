'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { DOC_TYPES, SEO_FIELDS, getDocType, type Field } from '@/lib/cms/schema';
import type { AdminDoc } from '@/lib/cms/repo';
import { docOpAction, previewUrlAction, restoreRevisionAction, saveDocAction, type ActionResult } from '@/app/admin/actions';
import { FieldList, EditorContext } from './fields';
import { Badge, fmtDateTime } from './ui';

type Rev = { id: number; action: string; created_at: number; user: string | null };

export function DocEditor({
  initial,
  typeName,
  refs,
  routes,
  acervo,
  revisions,
  publicUrl,
  isAdmin,
}: {
  initial: AdminDoc;
  typeName: string;
  refs: Record<string, { value: string; label: string }[]>;
  routes: string[];
  acervo: string[];
  revisions: Rev[];
  publicUrl: string | null;
  isAdmin: boolean;
}) {
  const dt = getDocType(typeName)!;
  const router = useRouter();
  const [doc, setDoc] = useState(initial);
  const [data, setData] = useState<Record<string, unknown>>(initial.draft);
  const [seo, setSeo] = useState<Record<string, unknown>>(initial.draftSeo);
  const [slug, setSlug] = useState(initial.slug);
  const [placeholder, setPlaceholder] = useState(initial.placeholder);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [pending, start] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const notify = useCallback((r: ActionResult, fallback: string) => {
    clearTimeout(toastTimer.current);
    setToast({ kind: r.ok ? 'ok' : 'error', text: (r.ok ? r.message : r.error) || fallback });
    toastTimer.current = setTimeout(() => setToast(null), r.ok ? 3500 : 9000);
  }, []);

  const apply = (r: ActionResult) => {
    const d = r.doc as AdminDoc | undefined | null;
    if (d) {
      setDoc(d);
      setData(d.draft);
      setSeo(d.draftSeo);
      setSlug(d.slug);
      setPlaceholder(d.placeholder);
      setDirty(false);
    }
  };

  const save = useCallback(
    (publish: boolean) =>
      new Promise<boolean>((resolve) =>
        start(async () => {
          const r = await saveDocAction({ id: doc.id, data, seo, slug, placeholder }, publish);
          apply(r);
          notify(r, publish ? 'Publicado.' : 'Rascunho salvo.');
          if (r.ok) router.refresh();
          resolve(r.ok);
        }),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [doc.id, data, seo, slug, placeholder],
  );

  // Ctrl/Cmd + S salva rascunho
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        save(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save]);

  // Aviso ao sair com alterações não salvas
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  const op = (o: 'unpublish' | 'discard' | 'delete') =>
    start(async () => {
      const r = await docOpAction(doc.id, o);
      if (o === 'delete' && r.ok) {
        router.push(`/admin/conteudo/${typeName}`);
        return;
      }
      apply(r);
      notify(r, o === 'unpublish' ? 'Despublicado.' : 'Alterações descartadas.');
      router.refresh();
    });

  const preview = () =>
    start(async () => {
      if (dirty) {
        const r = await saveDocAction({ id: doc.id, data, seo, slug, placeholder }, false);
        apply(r);
        if (!r.ok) return notify(r, '');
      }
      const url = await previewUrlAction(doc.id);
      window.open(url, '_blank', 'noopener');
    });

  const ctx = useMemo(() => ({ refs, routes, acervo }), [refs, routes, acervo]);
  const status = dirty ? 'alterado' : doc.status;
  const typeLabel = DOC_TYPES.find((d) => d.type === typeName)?.label;
  const seoTitle = String(seo.title || doc.title);
  const seoDesc = String(seo.description || '');

  return (
    <EditorContext.Provider value={ctx}>
      {/* Barra de ações fixa */}
      <div className="sticky top-0 z-30 -mx-4 mb-6 border-b border-grafite/10 bg-[#f3f1ec]/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <nav aria-label="Trilha" className="text-xs text-grafite/50">
              <Link href="/admin" className="hover:text-vinho">Painel</Link> / {dt.singleton ? <span>{dt.group}</span> : <Link href={`/admin/conteudo/${typeName}`} className="hover:text-vinho">{dt.plural}</Link>}
            </nav>
            <h1 className="flex items-center gap-3 truncate font-display text-2xl font-bold">
              <span className="truncate">{doc.title}</span>
              <Badge status={status} />
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {publicUrl && (
              <button type="button" onClick={preview} disabled={pending} className="btn btn-ghost-light min-h-[42px] px-4 text-sm">
                Visualizar
              </button>
            )}
            <button type="button" onClick={() => save(false)} disabled={pending} className="btn btn-ghost-light min-h-[42px] px-4 text-sm" title="Ctrl/Cmd + S">
              {pending ? 'Salvando…' : 'Salvar rascunho'}
            </button>
            <button type="button" onClick={() => save(true)} disabled={pending} className="btn btn-vinho min-h-[42px] px-5 text-sm">
              Publicar
            </button>
          </div>
        </div>
      </div>

      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl px-5 py-3.5 text-sm font-semibold shadow-xl transition-all ${toast ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'} ${toast?.kind === 'error' ? 'bg-vinho text-white' : 'bg-grafite text-white'}`}
      >
        {toast?.text}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div
          className="min-w-0 space-y-5"
          onInput={() => setDirty(true)}
          onChange={() => setDirty(true)}
        >
          <div className="rounded-2xl bg-white p-5 ring-1 ring-grafite/[.08] sm:p-6">
            <p className="mb-5 text-sm text-grafite/60">{dt.description}</p>
            <FieldList
              fields={dt.fields}
              value={data}
              onChange={(v) => {
                setData(v);
                setDirty(true);
              }}
              path={typeName}
            />
          </div>
          {dt.hasSeo && (
            <details className="group rounded-2xl bg-white p-5 ring-1 ring-grafite/[.08] sm:p-6">
              <summary className="cursor-pointer list-none font-display text-lg font-semibold">
                SEO e compartilhamento <span className="ml-2 text-sm font-normal text-grafite/50 group-open:hidden">(abrir)</span>
              </summary>
              <div className="mt-5 rounded-xl bg-[#f7f7f7] p-4" aria-label="Prévia no Google">
                <p className="text-xs text-grafite/50">Prévia no Google</p>
                <p className="mt-1 truncate text-[17px] text-[#1a0dab]">{seoTitle.slice(0, 65)}</p>
                <p className="text-xs text-[#006621]">{(publicUrl && `grifo.agency${publicUrl === '/' ? '' : publicUrl}`) || 'grifo.agency'}</p>
                <p className="mt-0.5 line-clamp-2 text-sm text-grafite/70">{seoDesc || 'Sem meta description — será usado o texto de apoio da página.'}</p>
              </div>
              <div className="mt-5">
                <FieldList
                  fields={SEO_FIELDS}
                  value={seo}
                  onChange={(v) => {
                    setSeo(v);
                    setDirty(true);
                  }}
                  path="seo"
                />
              </div>
            </details>
          )}
        </div>

        <aside className="space-y-5">
          <section className="rounded-2xl bg-white p-5 ring-1 ring-grafite/[.08]">
            <h2 className="font-display text-base font-semibold">Publicação</h2>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between gap-2"><dt className="text-grafite/55">Tipo</dt><dd>{typeLabel}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-grafite/55">Publicado em</dt><dd>{doc.publishedAt ? fmtDateTime(doc.publishedAt) : '—'}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-grafite/55">Última edição</dt><dd>{fmtDateTime(doc.updatedAt)}</dd></div>
            </dl>
            {publicUrl && doc.published && (
              <a href={publicUrl.startsWith('/') ? publicUrl : '/'} target="_blank" rel="noopener" className="mt-3 block truncate text-sm font-semibold text-vinho underline underline-offset-2">
                Abrir página publicada
              </a>
            )}
            {!dt.singleton && (
              <div className="mt-4">
                <label htmlFor="slug" className="field-label">Endereço (slug)</label>
                <input
                  id="slug"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
                    setDirty(true);
                  }}
                  className="field py-2 text-sm"
                />
                <p className="mt-1 text-xs text-grafite/50">Mudar o slug altera o link público. Crie um redirecionamento do endereço antigo.</p>
              </div>
            )}
            {typeName !== 'metric' && typeName !== 'settings' && (
              <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-xl bg-ambar/15 p-3 text-sm">
                <input
                  type="checkbox"
                  checked={placeholder}
                  onChange={(e) => {
                    setPlaceholder(e.target.checked);
                    setDirty(true);
                  }}
                  className="mt-0.5 h-4 w-4 accent-[#8D2525]"
                />
                <span>
                  <strong className="block">Pendente de validação</strong>
                  <span className="text-grafite/65">Conteúdo provisório: aparece só na pré-visualização e não vai para produção.</span>
                </span>
              </label>
            )}
            <div className="mt-4 flex flex-wrap gap-2 border-t border-grafite/10 pt-4 text-sm">
              {doc.status === 'alterado' && !dirty && (
                <button type="button" disabled={pending} onClick={() => op('discard')} className="font-semibold text-grafite/70 underline underline-offset-2 hover:text-vinho">
                  Descartar alterações
                </button>
              )}
              {!dt.singleton && doc.published && (
                <button type="button" disabled={pending} onClick={() => op('unpublish')} className="font-semibold text-grafite/70 underline underline-offset-2 hover:text-vinho">
                  Despublicar
                </button>
              )}
              {!dt.singleton && (isAdmin || !doc.published) && (
                confirmDelete ? (
                  <span className="flex items-center gap-2">
                    <span>Excluir definitivamente?</span>
                    <button type="button" disabled={pending} onClick={() => op('delete')} className="rounded-full bg-vinho px-3 py-1 font-semibold text-white">Excluir</button>
                    <button type="button" onClick={() => setConfirmDelete(false)} className="font-semibold">Cancelar</button>
                  </span>
                ) : (
                  <button type="button" onClick={() => setConfirmDelete(true)} className="font-semibold text-vinho underline underline-offset-2">
                    Excluir
                  </button>
                )
              )}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 ring-1 ring-grafite/[.08]">
            <h2 className="font-display text-base font-semibold">Histórico</h2>
            {revisions.length ? (
              <ol className="mt-3 max-h-[320px] space-y-2 overflow-y-auto text-sm">
                {revisions.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-2">
                    <span>
                      <span className="font-medium capitalize">{r.action}</span>
                      <span className="block text-xs text-grafite/50">{fmtDateTime(r.created_at)}{r.user ? ` · ${r.user}` : ''}</span>
                    </span>
                    <button
                      type="button"
                      disabled={pending}
                      className="shrink-0 text-xs font-semibold text-vinho underline underline-offset-2"
                      onClick={() =>
                        start(async () => {
                          const res = await restoreRevisionAction(doc.id, r.id);
                          apply(res);
                          notify(res, 'Versão restaurada.');
                          router.refresh();
                        })
                      }
                    >
                      Restaurar
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 text-sm text-grafite/55">As versões salvas aparecem aqui. Conteúdo inicial importado do briefing.</p>
            )}
          </section>

          <section className="rounded-2xl bg-grafite p-5 text-sm text-white/80">
            <h2 className="font-display text-base font-semibold text-white">Dicas</h2>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Em títulos, uma quebra de linha separa a frase em destaque (negrito) da complementar (leve).</li>
              <li>Salvar rascunho não altera o site. Use Visualizar para conferir e Publicar para colocar no ar.</li>
              <li>Toda imagem precisa de texto alternativo (acessibilidade e SEO).</li>
            </ul>
          </section>
        </aside>
      </div>
    </EditorContext.Provider>
  );
}

export type { Field };
