'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { Logo, Wing } from '../brand/Logo';

type NavItem = { slug: string; name: string; tagline?: string };
type Props = { solutions: NavItem[]; specialties: NavItem[] };

const MEGA = {
  solucoes: { label: 'Soluções', base: '/solucoes', intro: 'Quatro frentes que se complementam. Uma única visão de negócio.' },
  especialidades: { label: 'Especialidades', base: '/especialidades', intro: 'Estratégias adaptadas à jornada de compra de cada mercado.' },
} as const;
type MegaKey = keyof typeof MEGA;

export function Header({ solutions, specialties }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState<MegaKey | null>(null);
  const [mobile, setMobile] = useState(false);
  const [mobileSub, setMobileSub] = useState<MegaKey | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const uid = useId();
  const lists: Record<MegaKey, NavItem[]> = { solucoes: solutions, especialidades: specialties };

  useEffect(() => {
    setOpen(null);
    setMobile(false);
    setMobileSub(null);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (open) {
        const k = open;
        setOpen(null);
        document.getElementById(`${uid}-btn-${k}`)?.focus();
      }
      if (mobile) {
        setMobile(false);
        document.getElementById(`${uid}-burger`)?.focus();
      }
    };
    const onDown = (e: MouseEvent) => {
      if (open && navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [open, mobile, uid]);

  useEffect(() => {
    document.body.style.overflow = mobile ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobile]);

  const solid = scrolled || open !== null || mobile;
  const active = (href: string) => pathname === href || pathname.startsWith(href + '/');
  // Boutique 2027 (aprovado na Home e estendido a todo o site): navegação em pílula flutuante.
  const floating = true as boolean;

  const linkCls = (href: string) =>
    floating
      ? `relative rounded-full px-3.5 py-2 text-[0.92rem] font-medium transition-colors hover:bg-white/[.07] hover:text-white ${active(href) ? 'bg-white/10 text-white' : 'text-white/70'}`
      : `relative px-3 py-2 text-[0.95rem] font-medium transition-colors hover:text-white ${active(href) ? 'text-white after:absolute after:inset-x-3 after:-bottom-0.5 after:h-[3px] after:bg-ambar' : 'text-white/75'}`;

  const megaBtn = (k: MegaKey) => (
    <button
      id={`${uid}-btn-${k}`}
      type="button"
      aria-expanded={open === k}
      aria-controls={`${uid}-panel-${k}`}
      onClick={() => setOpen(open === k ? null : k)}
      onMouseEnter={() => {
        clearTimeout(hoverTimer.current);
        hoverTimer.current = setTimeout(() => setOpen(k), 120);
      }}
      onMouseLeave={() => clearTimeout(hoverTimer.current)}
      className={`${linkCls(MEGA[k].base)} inline-flex items-center gap-1.5`}
    >
      {MEGA[k].label}
      <svg viewBox="0 0 12 12" className={`h-3 w-3 transition-transform ${open === k ? 'rotate-180' : ''}`} aria-hidden="true">
        <path d="M2 4.5 6 8l4-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </button>
  );

  return (
    <header
      ref={navRef}
      onMouseLeave={() => {
        clearTimeout(hoverTimer.current);
        hoverTimer.current = setTimeout(() => setOpen(null), 220);
      }}
      onMouseEnter={() => clearTimeout(hoverTimer.current)}
      // Sem backdrop-filter com o menu mobile aberto: o filtro tornaria o header o bloco de contenção
      // do painel `fixed` e o painel ficaria sem altura (correção de bug do ZIP).
      className={
        floating
          ? `fixed inset-x-0 top-0 z-50 px-[10px] pt-[10px] sm:px-[14px] sm:pt-[14px] ${mobile ? 'bottom-0 bg-[#0f0f10]' : ''}`
          : `fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${mobile ? 'bg-grafite' : solid ? 'bg-grafite/95 shadow-[0_1px_0_rgba(255,255,255,.06)] backdrop-blur-md' : 'bg-gradient-to-b from-black/35 to-transparent'}`
      }
    >
      <nav
        aria-label="Principal"
        className={
          floating
            ? `mx-auto flex h-[62px] max-w-[1332px] items-center justify-between gap-6 rounded-full pl-5 pr-2 transition-[background-color,box-shadow] duration-500 sm:pl-7 ${solid || !mobile ? 'bg-[#0f0f10]/[.94] shadow-[0_20px_50px_-24px_rgba(0,0,0,.55),inset_0_0_0_1px_rgba(255,255,255,.06)]' : ''} ${mobile ? '' : 'backdrop-blur-xl'}`
            : 'wrap flex h-[var(--header-h)] items-center justify-between gap-6'
        }
      >
        <Link href="/" className="-ml-1 shrink-0 rounded p-1" aria-label="Grifo — página inicial">
          <Logo tone="light" className={floating ? 'h-8 w-auto' : 'h-9 w-auto sm:h-10'} title="Grifo" />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          <li><Link href="/sobre" className={linkCls('/sobre')}>Sobre</Link></li>
          <li>{megaBtn('solucoes')}</li>
          <li>{megaBtn('especialidades')}</li>
          <li><Link href="/projetos" className={linkCls('/projetos')}>Projetos</Link></li>
          <li><Link href="/metodologia-micca" className={linkCls('/metodologia-micca')}>MICCA</Link></li>
          <li><Link href="/insights" className={linkCls('/insights')}>Insights</Link></li>
        </ul>

        <div className="flex items-center gap-2">
          {floating ? (
            <Link href="/contato" data-cta="header_vamos_conversar" className="hm-btn hm-btn--white !hidden !min-h-[48px] !py-[4px] !pl-5 !pr-[4px] !text-[0.92rem] sm:!inline-flex">
              <span>Vamos conversar</span>
              <span className="hm-btn-ico !h-10 !w-10" aria-hidden="true">
                <svg viewBox="0 0 16 16"><path d="M4 12 12 4M5.5 4H12v6.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </Link>
          ) : (
            <Link href="/contato" data-cta="header_vamos_conversar" className="btn btn-primary hidden min-h-[44px] px-5 text-[0.92rem] sm:inline-flex">
              Vamos conversar
            </Link>
          )}
          <button
            id={`${uid}-burger`}
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white ring-1 ring-white/25 lg:hidden"
            aria-expanded={mobile}
            aria-controls={`${uid}-mobile`}
            aria-label={mobile ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setMobile((v) => !v)}
          >
            <span className="relative block h-3.5 w-5" aria-hidden="true">
              <span className={`absolute left-0 top-0 h-[2px] w-5 bg-current transition-transform ${mobile ? 'translate-y-[6px] rotate-45' : ''}`} />
              <span className={`absolute left-0 top-[6px] h-[2px] w-5 bg-current transition-opacity ${mobile ? 'opacity-0' : ''}`} />
              <span className={`absolute left-0 top-[12px] h-[2px] w-5 bg-current transition-transform ${mobile ? '-translate-y-[6px] -rotate-45' : ''}`} />
            </span>
          </button>
        </div>
      </nav>

      {/* Megamenus (desktop) */}
      {(Object.keys(MEGA) as MegaKey[]).map((k) => (
        <div
          key={k}
          id={`${uid}-panel-${k}`}
          className={
            floating
              ? `absolute inset-x-[14px] top-[calc(100%+8px)] mx-auto max-w-[1332px] overflow-hidden rounded-[28px] ${open === k ? 'hidden lg:block' : 'hidden'} bg-[#0f0f10]/[.97] text-white shadow-[0_40px_80px_-30px_rgba(0,0,0,.7),inset_0_0_0_1px_rgba(255,255,255,.06)] backdrop-blur-xl`
              : `absolute inset-x-0 top-full border-t ${open === k ? 'hidden lg:block' : 'hidden'} border-white/10 bg-grafite text-white shadow-[0_30px_60px_-30px_rgba(0,0,0,.7)]`
          }
        >
          <div className={floating ? 'grid grid-cols-12 gap-8 px-10 py-10' : 'wrap grid grid-cols-12 gap-8 py-10'}>
            <div className="col-span-4">
              <p className="font-display text-2xl font-semibold leading-tight">{MEGA[k].label}</p>
              <p className="mt-3 max-w-xs text-white/65">{MEGA[k].intro}</p>
              {k === 'especialidades' && (
                <Link href="/grifo-core" data-cta="mega_grifo_core" className="mt-6 inline-flex items-center gap-2 font-semibold text-ambar link-underline">
                  Grifo Core Assessment
                </Link>
              )}
            </div>
            <ul className={`col-span-8 grid gap-2 ${lists[k].length > 3 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {lists[k].map((it) => (
                <li key={it.slug}>
                  <Link
                    href={`${MEGA[k].base}/${it.slug}`}
                    className="group flex h-full flex-col rounded-2xl p-5 ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/[.04] hover:ring-ambar/60"
                  >
                    <span className="flex items-center gap-2 font-display text-lg font-semibold">
                      <Wing className="h-2.5 w-4 text-ambar opacity-0 transition-opacity group-hover:opacity-100" />
                      {it.name}
                    </span>
                    {it.tagline && <span className="mt-1.5 text-sm leading-relaxed text-white/60">{it.tagline}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}

      {/* Menu mobile, dois níveis */}
      <div id={`${uid}-mobile`} hidden={!mobile} className={`fixed inset-x-0 bottom-0 overflow-y-auto text-white lg:hidden ${floating ? 'top-[86px] bg-[#0f0f10]' : 'top-[var(--header-h)] bg-grafite'}`}>
        <ul className="wrap divide-y divide-white/10 py-4">
          <li><Link href="/sobre" className="block py-4 font-display text-2xl font-semibold">Sobre</Link></li>
          {(Object.keys(MEGA) as MegaKey[]).map((k) => (
            <li key={k}>
              <button
                type="button"
                className="flex w-full items-center justify-between py-4 text-left font-display text-2xl font-semibold"
                aria-expanded={mobileSub === k}
                aria-controls={`${uid}-msub-${k}`}
                onClick={() => setMobileSub(mobileSub === k ? null : k)}
              >
                {MEGA[k].label}
                <span aria-hidden="true" className={`text-ambar transition-transform ${mobileSub === k ? 'rotate-45' : ''}`}>+</span>
              </button>
              <ul id={`${uid}-msub-${k}`} hidden={mobileSub !== k} className="pb-4 pl-1">
                {lists[k].map((it) => (
                  <li key={it.slug}>
                    <Link href={`${MEGA[k].base}/${it.slug}`} className="block py-2.5 text-lg text-white/80">
                      {it.name}
                    </Link>
                  </li>
                ))}
                {k === 'especialidades' && (
                  <li><Link href="/grifo-core" className="block py-2.5 text-lg text-ambar">Grifo Core Assessment</Link></li>
                )}
              </ul>
            </li>
          ))}
          <li><Link href="/projetos" className="block py-4 font-display text-2xl font-semibold">Projetos</Link></li>
          <li><Link href="/metodologia-micca" className="block py-4 font-display text-2xl font-semibold">MICCA</Link></li>
          <li><Link href="/insights" className="block py-4 font-display text-2xl font-semibold">Insights</Link></li>
          <li className="pt-6">
            <Link href="/contato" data-cta="mobile_vamos_conversar" className={floating ? 'btn w-full bg-white text-[#0f0f10] hover:bg-ambar' : 'btn btn-primary w-full'}>Vamos conversar</Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
