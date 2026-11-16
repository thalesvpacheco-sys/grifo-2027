import type { Metadata } from 'next';
import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { DOC_TYPES } from '@/lib/cms/schema';
import { Logo } from '@/components/brand/Logo';
import { AdminNav } from '@/components/admin/AdminNav';
import { logoutAction } from '../actions';
import { db } from '@/lib/db';

export const metadata: Metadata = { title: 'Painel Grifo', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const u = await requireUser();
  const newLeads = (db().prepare("SELECT COUNT(*) c FROM leads WHERE status = 'novo'").get() as { c: number }).c;
  const groups = ['Páginas', 'Estrutura', 'Conteúdo'] as const;
  const nav = [
    { label: 'Visão geral', items: [{ href: '/admin', label: 'Painel', icon: 'home' }, { href: '/admin/leads', label: 'Leads', icon: 'inbox', badge: newLeads || undefined }] },
    ...groups.map((g) => ({
      label: g,
      items: DOC_TYPES.filter((d) => d.group === g).map((d) => ({ href: `/admin/conteudo/${d.type}`, label: d.plural, icon: d.icon })),
    })),
    {
      label: 'Biblioteca',
      items: [{ href: '/admin/midia', label: 'Mídia', icon: 'image' }],
    },
    {
      label: 'Sistema',
      items: [
        ...(u.role === 'admin'
          ? [
              { href: '/admin/conteudo/settings', label: 'Configurações', icon: 'settings' },
              { href: '/admin/conteudo/redirect', label: 'Redirecionamentos', icon: 'shuffle' },
              { href: '/admin/usuarios', label: 'Usuários', icon: 'user' },
              { href: '/admin/auditoria', label: 'Auditoria', icon: 'shield' },
            ]
          : []),
        { href: '/admin/conta', label: 'Minha conta', icon: 'key' },
      ],
    },
  ];

  return (
    <div className="on-light min-h-screen bg-[#f3f1ec] text-grafite lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="bg-grafite text-white lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-5">
          <Link href="/admin" aria-label="Painel Grifo — início">
            <Logo tone="light" className="h-8 w-auto" />
          </Link>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold">{u.role === 'admin' ? 'Admin' : 'Editor'}</span>
        </div>
        <AdminNav groups={nav} />
        <div className="hidden border-t border-white/10 p-5 text-sm lg:block">
          <p className="truncate font-semibold">{u.name}</p>
          <p className="truncate text-white/50">{u.email}</p>
          <div className="mt-4 flex gap-2">
            <a href="/" target="_blank" rel="noopener" className="flex-1 rounded-full px-3 py-2 text-center text-xs font-semibold ring-1 ring-white/20 hover:bg-white/10">Ver site</a>
            <form action={logoutAction} className="flex-1">
              <button type="submit" className="w-full rounded-full px-3 py-2 text-xs font-semibold ring-1 ring-white/20 hover:bg-white/10">Sair</button>
            </form>
          </div>
        </div>
      </aside>
      <div className="min-w-0">
        <main id="conteudo" className="mx-auto max-w-[1180px] px-4 py-8 sm:px-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
