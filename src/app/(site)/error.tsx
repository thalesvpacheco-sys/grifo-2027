'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="flex min-h-[70svh] items-center bg-grafite pt-[var(--header-h)] text-white">
      <div className="wrap">
        <h1 className="font-display text-h2 font-bold">Algo não carregou como deveria.</h1>
        <p className="mt-4 max-w-xl text-lead text-white/70">Tente carregar a página novamente. Se o problema continuar, fale com a gente pela página de contato.</p>
        <div className="mt-8 flex gap-3">
          <button type="button" onClick={reset} className="btn btn-primary">Tentar novamente</button>
          <a href="/contato" className="btn btn-ghost-dark">Ir para contato</a>
        </div>
      </div>
    </section>
  );
}
