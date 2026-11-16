import Link from 'next/link';
import { Logo } from '../brand/Logo';
import { ConsentPreferencesButton } from './CookieConsent';
import type { Settings } from '@/lib/cms/content';
import { telHref } from '@/lib/seo';

type NavItem = { slug: string; name: string };

/* Rodapé boutique: painel preto arredondado sobre a névoa da tela.
 * No celular as quatro colunas viram uma grade 2×2 compacta (antes era uma coluna única muito longa). */
export function Footer({ settings, solutions, specialties, showPlaceholders }: { settings: Settings; solutions: NavItem[]; specialties: NavItem[]; showPlaceholders: boolean }) {
  const c = settings.contact;
  const hasContact = c.email || c.phone || c.whatsapp || c.address;
  const col = 'space-y-2 text-[0.9rem] text-[#a4a3a0] sm:space-y-2.5 sm:text-[0.95rem]';
  const head = 'mb-3 font-display text-[0.7rem] font-medium uppercase tracking-[0.2em] text-[#8f8e8b] sm:mb-4';
  const a = 'transition-colors hover:text-white';
  return (
    <footer className="bg-[#ecebe7] px-[10px] pb-[10px] sm:px-[14px] sm:pb-[14px]" aria-labelledby="footer-title">
      <div className="relative overflow-hidden rounded-[22px] bg-[#0f0f10] text-white sm:rounded-[32px]">
        <h2 id="footer-title" className="sr-only">Rodapé</h2>
        <div className="hm-in grid gap-10 pb-8 pt-12 sm:pt-16 lg:grid-cols-12 lg:gap-12 lg:pb-12 lg:pt-24">
          <div className="flex flex-wrap items-end justify-between gap-6 lg:col-span-4 lg:block">
            <div>
              <Logo tone="light" className="h-9 w-auto sm:h-11" />
              <p className="mt-4 max-w-[22ch] font-display text-lg font-normal leading-snug tracking-[-0.02em] text-[#d6d5d1] sm:mt-5 sm:text-xl">{settings.tagline}</p>
            </div>
            <Link href="/contato" data-cta="footer_vamos_conversar" className="hm-btn hm-btn--white !min-h-[48px] !py-[4px] !pl-5 !pr-[4px] !text-[0.92rem] lg:mt-8">
              <span>Vamos conversar</span>
              <span className="hm-btn-ico !h-10 !w-10" aria-hidden="true">
                <svg viewBox="0 0 16 16"><path d="M4 12 12 4M5.5 4H12v6.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-9 border-t border-white/10 pt-9 sm:grid-cols-4 lg:col-span-8 lg:border-0 lg:pt-0">
            <nav aria-label="Soluções">
              <p className={head}>Soluções</p>
              <ul className={col}>
                {solutions.map((s) => (
                  <li key={s.slug}><Link className={a} href={`/solucoes/${s.slug}`}>{s.name}</Link></li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Especialidades">
              <p className={head}>Especialidades</p>
              <ul className={col}>
                {specialties.map((s) => (
                  <li key={s.slug}><Link className={a} href={`/especialidades/${s.slug}`}>{s.name}</Link></li>
                ))}
                <li><Link className={a} href="/grifo-core">Grifo Core</Link></li>
              </ul>
            </nav>
            <nav aria-label="Grifo">
              <p className={head}>Grifo</p>
              <ul className={col}>
                <li><Link className={a} href="/sobre">Sobre</Link></li>
                <li><Link className={a} href="/metodologia-micca">Metodologia MICCA</Link></li>
                <li><Link className={a} href="/projetos">Projetos</Link></li>
                <li><Link className={a} href="/insights">Insights</Link></li>
                <li><Link className={a} href="/contato">Contato</Link></li>
              </ul>
            </nav>
            <div>
              <p className={head}>Contato</p>
              {hasContact ? (
                <ul className={col}>
                  {c.email && <li><a className={`${a} break-all`} href={`mailto:${c.email}`}>{c.email}</a></li>}
                  {c.phone && <li><a className={a} href={telHref(c.phone)}>{c.phone}</a></li>}
                  {c.whatsapp && <li><a className={a} data-placement="footer" href={`https://wa.me/${c.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">WhatsApp</a></li>}
                  {c.address && <li className="whitespace-pre-line">{c.address}</li>}
                </ul>
              ) : (
                <p className="text-sm text-[#8f8e8b]">{showPlaceholders ? 'Contatos oficiais pendentes — cadastre em Configurações no painel.' : <Link className={a} href="/contato">Fale conosco</Link>}</p>
              )}
              {settings.socials.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#a4a3a0]">
                  {settings.socials.map((s) => (
                    <li key={s.url}><a className={a} href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a></li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="hm-in flex flex-col gap-3 border-t border-white/10 py-5 text-xs text-[#8f8e8b] md:flex-row md:items-center md:justify-between md:py-6">
          <p>
            © {new Date().getFullYear()} {settings.legal.company || 'Grifo Agency'}
            {settings.legal.cnpj ? ` · CNPJ ${settings.legal.cnpj}` : ''}
            {settings.legal.dpo ? <> · Encarregado de dados: <a className="underline" href={`mailto:${settings.legal.dpo}`}>{settings.legal.dpo}</a></> : null}
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li><Link className="hover:text-white" href="/politica-de-privacidade">Privacidade</Link></li>
            <li><Link className="hover:text-white" href="/politica-de-cookies">Cookies</Link></li>
            <li><Link className="hover:text-white" href="/termos-de-uso">Termos de uso</Link></li>
            <li><ConsentPreferencesButton className="hover:text-white" /></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
