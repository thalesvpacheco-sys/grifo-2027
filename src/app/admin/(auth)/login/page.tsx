import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { LoginForm } from '@/components/admin/LoginForm';
import { Logo } from '@/components/brand/Logo';

export default async function LoginPage() {
  const s = await getSession();
  if (s && !s.mfaPending) redirect('/admin');
  return (
    <div className="w-full max-w-[420px]">
      <Logo tone="light" className="mx-auto h-12 w-auto" />
      <div className="mt-8 rounded-3xl bg-white p-8 shadow-2xl">
        <h1 className="font-display text-2xl font-bold">Painel de conteúdo</h1>
        <p className="mt-1 text-sm text-grafite/60">Entre com sua conta de editor ou administrador.</p>
        <LoginForm />
      </div>
      <p className="mt-6 text-center text-xs text-white/40">Acesso restrito. Tentativas são registradas.</p>
    </div>
  );
}
