/** Atribuição de campanha (first-touch + last-touch) guardada no navegador; enviada junto com o lead. */
export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  landing_page?: string;
  referrer?: string;
  first_seen?: string;
};
const KEY = 'grifo_attr';
const UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

export function captureAttribution() {
  if (typeof window === 'undefined') return;
  try {
    const qs = new URLSearchParams(location.search);
    const hasUtm = UTM.some((k) => qs.get(k));
    const stored = JSON.parse(localStorage.getItem(KEY) || 'null') as Attribution | null;
    if (stored && !hasUtm) return;
    const a: Attribution = { landing_page: location.pathname + location.search, referrer: document.referrer && !document.referrer.startsWith(location.origin) ? document.referrer : stored?.referrer || '', first_seen: stored?.first_seen || new Date().toISOString() };
    for (const k of UTM) a[k] = (qs.get(k) || '').slice(0, 120) || undefined;
    localStorage.setItem(KEY, JSON.stringify(a));
  } catch {
    /* armazenamento indisponível: segue sem atribuição */
  }
}

export function readAttribution(): Attribution {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}
