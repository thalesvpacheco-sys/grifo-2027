'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

type Consent = { v: 1; analytics: boolean; marketing: boolean; ts: number };
const COOKIE = 'grifo_consent';
export const OPEN_CONSENT_EVENT = 'grifo:open-consent';

function read(): Consent | null {
  const m = document.cookie.match(/(?:^|; )grifo_consent=([^;]+)/);
  if (!m) return null;
  try {
    const c = JSON.parse(decodeURIComponent(m[1]));
    return c?.v === 1 ? c : null;
  } catch {
    return null;
  }
}

function write(c: Consent) {
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(c))}; Max-Age=${60 * 60 * 24 * 180}; Path=/; SameSite=Lax${secure}`;
}

type Gtag = (...args: unknown[]) => void;

function applyConsent(c: Consent, gtmId: string) {
  const w = window as unknown as { gtag?: Gtag; dataLayer: unknown[]; __gtmLoaded?: boolean };
  w.gtag?.('consent', 'update', {
    analytics_storage: c.analytics ? 'granted' : 'denied',
    ad_storage: c.marketing ? 'granted' : 'denied',
    ad_user_data: c.marketing ? 'granted' : 'denied',
    ad_personalization: c.marketing ? 'granted' : 'denied',
  });
  // GTM só é carregado com consentimento e com ID configurado.
  if ((c.analytics || c.marketing) && gtmId && /^GTM-[A-Z0-9]+$/.test(gtmId) && !w.__gtmLoaded) {
    w.__gtmLoaded = true;
    w.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
    const nonce = (document.querySelector('script[nonce]') as HTMLScriptElement | null)?.nonce;
    if (nonce) s.nonce = nonce;
    document.head.appendChild(s);
  }
}

export function CookieConsent({ gtmId, initialOpen = false }: { gtmId: string; initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  const [custom, setCustom] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = read();
    if (c) {
      setAnalytics(c.analytics);
      setMarketing(c.marketing);
      applyConsent(c, gtmId);
      setOpen(false);
    } else {
      setOpen(true);
    }
    const reopen = () => {
      const cur = read();
      setAnalytics(!!cur?.analytics);
      setMarketing(!!cur?.marketing);
      setCustom(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, [gtmId]);

  useEffect(() => {
    if (open && custom) dialogRef.current?.querySelector<HTMLElement>('input,button')?.focus();
  }, [open, custom]);

  const save = useCallback(
    (a: boolean, m: boolean) => {
      const c: Consent = { v: 1, analytics: a, marketing: m, ts: Date.now() };
      write(c);
      applyConsent(c, gtmId);
      setOpen(false);
      setCustom(false);
    },
    [gtmId],
  );

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-title"
      onKeyDown={(e) => e.key === 'Escape' && custom && setCustom(false)}
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-[680px] rounded-2xl bg-grafite p-5 text-white shadow-[0_24px_60px_-20px_rgba(0,0,0,.6)] ring-1 ring-white/10 sm:inset-x-6 sm:bottom-6 sm:p-6"
    >
      <h2 id="consent-title" className="font-display text-lg font-semibold">
        Sua privacidade, suas escolhas.
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-white/75">
        Usamos cookies necessários para o site funcionar. Com sua permissão, usamos também cookies de análise e marketing para entender o uso do site e medir campanhas.{' '}
        <Link href="/politica-de-cookies" className="font-semibold text-ambar underline underline-offset-2">
          Política de cookies
        </Link>
      </p>

      {custom && (
        <fieldset className="mt-4 space-y-3 border-t border-white/10 pt-4">
          <legend className="sr-only">Categorias de cookies</legend>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" checked disabled className="mt-0.5 h-5 w-5 accent-[#E5A12E]" />
            <span>
              <strong className="block">Necessários</strong>
              <span className="text-white/65">Funcionamento, segurança e suas preferências. Sempre ativos.</span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="mt-0.5 h-5 w-5 accent-[#E5A12E]" />
            <span>
              <strong className="block">Análise</strong>
              <span className="text-white/65">Estatísticas de uso do site (Google Analytics 4).</span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-0.5 h-5 w-5 accent-[#E5A12E]" />
            <span>
              <strong className="block">Marketing</strong>
              <span className="text-white/65">Medição de campanhas e anúncios personalizados.</span>
            </span>
          </label>
        </fieldset>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {custom ? (
          <button type="button" className="btn btn-primary min-h-[44px] px-5 text-sm" onClick={() => save(analytics, marketing)}>
            Salvar preferências
          </button>
        ) : (
          <>
            <button type="button" className="btn btn-primary min-h-[44px] px-5 text-sm" onClick={() => save(true, true)}>
              Aceitar todos
            </button>
            <button type="button" className="btn btn-ghost-dark min-h-[44px] px-5 text-sm" onClick={() => save(false, false)}>
              Somente necessários
            </button>
            <button type="button" className="btn min-h-[44px] px-3 text-sm text-white/80 underline underline-offset-4 hover:text-white" onClick={() => setCustom(true)}>
              Personalizar
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function ConsentPreferencesButton({ className = '' }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}>
      Preferências de cookies
    </button>
  );
}
