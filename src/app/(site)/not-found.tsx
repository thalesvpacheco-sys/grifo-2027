import Link from 'next/link';
import { HeroWings } from '@/components/site/blocks';

export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-[80svh] items-center overflow-hidden bg-grafite pt-[var(--header-h)] text-white">
      <HeroWings />
      <div className="wrap">
        <p className="font-display text-[clamp(5rem,16vw,12rem)] font-extrabold leading-none tracking-[-0.05em] text-vinho">404</p>
        <h1 className="mt-4 font-display text-h2 font-bold">Esta página não existe ou mudou de endereço.</h1>
        <p className="mt-4 max-w-xl text-lead text-white/70">Volte para o início ou fale com a equipe Grifo.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-primary">Ir para o início</Link>
          <Link href="/contato" className="btn btn-ghost-dark">Vamos conversar</Link>
        </div>
      </div>
    </section>
  );
}
