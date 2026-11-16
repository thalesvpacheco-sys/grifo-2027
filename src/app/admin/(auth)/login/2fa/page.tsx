import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { TwoFactorForm } from '@/components/admin/LoginForm';
import { Logo } from '@/components/brand/Logo';

export default async function TwoFactorPage() {
  const s = await getSession();
  if (!s) redirect('/admin/login');
  if (!s.mfaPending) redirect('/admin');
  return (
    <div className="w-full max-w-[420px]">
      <Logo tone="light" className="mx-auto h-12 w-auto" />
      <div className="mt-8 rounded-3xl bg-white p-8 shadow-2xl">
        <h1 className="font-display text-2xl font-bold">Verificação em duas etapas</h1>
        <p className="mt-1 text-sm text-grafite/60">Digite o código de 6 dígitos do seu aplicativo autenticador.</p>
        <TwoFactorForm />
      </div>
    </div>
  );
}
