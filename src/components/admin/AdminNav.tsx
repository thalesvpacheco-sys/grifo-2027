'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Icon } from './Icon';

type Item = { href: string; label: string; icon: string; badge?: number };

export function AdminNav({ groups }: { groups: { label: string; items: Item[] }[] }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === '/admin' ? path === '/admin' : path === href || path.startsWith(href + '/'));
  return (
    <>
      <button type="button" className="mx-5 mb-4 w-[calc(100%-40px)] rounded-full px-4 py-2.5 text-sm font-semibold ring-1 ring-white/20 lg:hidden" aria-expanded={open} aria-controls="admin-nav" onClick={() => setOpen(!open)}>
        {open ? 'Fechar menu' : 'Menu do painel'}
      </button>
      <nav id="admin-nav" aria-label="Painel" className={`${open ? 'block' : 'hidden'} px-3 pb-6 lg:block`}>
        {groups.map((g) =>
          g.items.length ? (
            <div key={g.label} className="mb-5">
              <p className="px-3 pb-1.5 text-[11px] font-semibold text-white/40">{g.label}</p>
              <ul>
                {g.items.map((it) => (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive(it.href) ? 'page' : undefined}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-[0.92rem] transition-colors ${isActive(it.href) ? 'bg-white text-grafite' : 'text-white/75 hover:bg-white/[.07] hover:text-white'}`}
                    >
                      <Icon name={it.icon} className="h-[18px] w-[18px] shrink-0" />
                      <span className="flex-1 truncate">{it.label}</span>
                      {it.badge ? <span className="rounded-full bg-ambar px-2 py-0.5 text-[11px] font-bold text-grafite">{it.badge}</span> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null,
        )}
      </nav>
    </>
  );
}
