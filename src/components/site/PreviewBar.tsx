import { draftMode } from 'next/headers';

/** Faixa exibida quando um editor está visualizando rascunhos pelo painel. */
export async function PreviewBar() {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-[65] flex items-center justify-center gap-4 bg-ambar px-4 py-2.5 text-sm font-semibold text-grafite">
      <span>Modo de pré-visualização: você está vendo rascunhos não publicados.</span>
      <a href="/api/preview/sair" className="rounded-full bg-grafite px-3 py-1 text-white">Sair da pré-visualização</a>
    </div>
  );
}
