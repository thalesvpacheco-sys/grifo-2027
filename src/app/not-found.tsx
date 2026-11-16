import Link from 'next/link';

export default function GlobalNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-grafite p-8 text-white">
      <div>
        <p className="font-display text-7xl font-extrabold text-vinho">404</p>
        <p className="mt-4 text-lg">Página não encontrada.</p>
        <Link href="/" className="btn btn-primary mt-6">Ir para o início</Link>
      </div>
    </main>
  );
}
