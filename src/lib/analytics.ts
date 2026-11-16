/** Camada única de eventos. Os eventos vão para o dataLayer; o GTM só é carregado após consentimento. */
export type GrifoEvent = 'view_specialty' | 'click_cta' | 'form_start' | 'generate_lead' | 'click_whatsapp' | 'view_case';

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function track(event: GrifoEvent, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}
