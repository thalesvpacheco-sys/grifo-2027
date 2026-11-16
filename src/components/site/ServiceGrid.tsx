import type { ReactNode } from 'react';

/**
 * "O que fazemos" das frentes: um cartão por serviço, com ícone desenhado em código.
 * Ao passar o mouse (ou focar pelo teclado), o cartão escurece e mostra um breve texto do serviço.
 * Em telas de toque o texto fica sempre visível.
 */
const P = (d: string) => <path d={d} />;
const ICONS: Record<string, ReactNode> = {
  // Consulting
  'Diagnóstico': <>{P('M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z')}{P('m15.3 15.3 4.7 4.7')}{P('M7.5 11.5 9.5 9l2 2.5 2-3.5')}</>,
  'Planejamento': <>{P('M4 6.5h16v13.5H4z')}{P('M4 10.5h16')}{P('M8.5 4v4.5M15.5 4v4.5')}{P('m8.5 15 2 2 4.5-4.5')}</>,
  'Posicionamento': <>{P('M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z')}{P('M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z')}{P('M12 12.01V12')}</>,
  'Lançamentos': <>{P('M14.5 4.5c2.8-.6 4.4-.4 5 .1.5.6.7 2.2.1 5L13 16.2 7.8 11Z')}{P('M7.8 11 5 10.6 8 7.6l3.6.3M13 16.2l.4 2.8 3-3-.3-3.6')}{P('M6.5 17.5 4 20')}</>,
  'Consultoria comercial': <>{P('M3.5 12.5 7 9l3 2 3.5-3.5L20.5 12')}{P('M7 9 3.5 5.5M20.5 12l-3 3.5-2-1.5-2 2-2-1.5')}{P('M8.5 15.5l2 2')}</>,
  'Indicadores': <>{P('M4 20h16')}{P('M6.5 20v-6M11 20V9M15.5 20v-4M20 20V5.5')}</>,
  // Marketing
  'Branding': <>{P('M12 3.5 20 8v8l-8 4.5L4 16V8Z')}{P('M12 12.5V20.5M12 12.5 20 8M12 12.5 4 8')}</>,
  'Campanhas': <>{P('M4 10v4l3 .5V9.5Z')}{P('M7 9.5 18 5v14L7 14.5')}{P('M9 15l1 4.5h2.5L12 15.5')}</>,
  'Social': <>{P('M7 13.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM17 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM17 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z')}{P('m9.2 9.8 5.6-3M9.2 12.2l5.6 4')}</>,
  'Mídia online e offline': <>{P('M3.5 5h11v8h-11z')}{P('M7 16.5h4M9 13v3.5')}{P('M16.5 9h4v11h-4z')}{P('M18.5 17.5v.01')}</>,
  'Performance': <>{P('M4 18a8 8 0 1 1 16 0')}{P('m12 18 4-6')}{P('M4 18h2M18 18h2M12 10V8.5')}</>,
  'Conteúdo': <>{P('M6 3.5h8.5L18 7v13.5H6z')}{P('M14 3.5V7.5h4')}{P('M9 11.5h6M9 14.5h6M9 17.5h3.5')}</>,
  'Inbound': <>{P('M4 4.5h16l-6 7.5v6l-4 2v-8Z')}</>,
  'SEO': <>{P('M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z')}{P('m15.3 15.3 4.7 4.7')}{P('m7.5 12 2-2 1.5 1.5 2.5-3')}</>,
  // Studios
  'Filmes': <>{P('M4 9.5h16v10H4z')}{P('m4 9.5 1.2-4.2 15.3 0-.5 4.2')}{P('m9 5.3-1.5 4.2M14 5.3l-1.5 4.2')}</>,
  'Institucionais': <>{P('M4.5 20V8l7.5-4 7.5 4v12')}{P('M3 20h18')}{P('M8 20v-6h8v6M8 10.5h.01M12 10.5h.01M16 10.5h.01')}</>,
  'Vídeos sociais': <>{P('M7.5 3h9a1.5 1.5 0 0 1 1.5 1.5v15a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19.5v-15A1.5 1.5 0 0 1 7.5 3Z')}{P('m10.5 9.5 4 2.5-4 2.5Z')}</>,
  'Fotografia': <>{P('M3.5 8h4l1.5-2.5h6L16.5 8h4v11.5h-17z')}{P('M12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z')}</>,
  'Drone': <>{P('M9.5 10.5h5v3h-5z')}{P('M9.5 10.5 6.5 7.5M14.5 10.5l3-3M9.5 13.5l-3 3M14.5 13.5l3 3')}{P('M4 7.5h5M15 7.5h5M4 16.5h5M15 16.5h5')}</>,
  'Motion': <>{P('M4 17c3-9 5-9 8-4.5S17 16 20 7')}{P('M4 20h16')}{P('M20 4v3h-3')}</>,
  'Animação': <>{P('M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17Z')}{P('M12 3.5v17M3.5 12h17')}{P('M6 6l12 12')}</>,
  // Tech
  'Websites': <>{P('M3.5 5h17v14h-17z')}{P('M3.5 9h17')}{P('M6 7h.01M8.5 7h.01')}</>,
  'Landing pages': <>{P('M5 3.5h14v17H5z')}{P('M8 7.5h8M8 10.5h5')}{P('M8 15h8v3H8z')}</>,
  'Soluções web': <>{P('m8.5 8-4 4 4 4M15.5 8l4 4-4 4')}{P('m13.5 5.5-3 13')}</>,
  'Integrações': <>{P('M9 6.5H6.5a3 3 0 0 0 0 6H9M15 11.5h2.5a3 3 0 0 1 0 6H15')}{P('M8 9.5h4M12 14.5h4')}{P('M12 9.5v5')}</>,
  'Automações': <>{P('M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z')}{P('M12 3.5v2.5M12 18v2.5M3.5 12H6M18 12h2.5M6 6l1.8 1.8M16.2 16.2 18 18M6 18l1.8-1.8M16.2 7.8 18 6')}</>,
  'Dashboards': <>{P('M3.5 4.5h7v7h-7zM13.5 4.5h7v4h-7zM13.5 11.5h7v8h-7zM3.5 14.5h7v5h-7z')}</>,
  'Tracking': <>{P('M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 1 1 13 0c0 4.8-6.5 11-6.5 11Z')}{P('M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z')}</>,
};
const FALLBACK = <>{P('M12 3.5 20 8v8l-8 4.5L4 16V8Z')}</>;

export function ServiceGrid({ items }: { items?: { title: string; text?: string }[] }) {
  if (!items?.length) return null;
  const cols = items.length % 4 === 0 || items.length > 6 ? 'lg:grid-cols-4' : 'lg:grid-cols-3';
  return (
    <ul className={`svc-grid grid gap-2.5 sm:grid-cols-2 ${cols}`} data-reveal role="list">
      {items.map((it, i) => (
        <li key={it.title} data-stagger style={{ ['--i' as string]: i % 8 }}>
          <div className="svc-card group" tabIndex={0}>
            <span className="flex items-start justify-between">
              <span className="svc-ico" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {ICONS[it.title] ?? FALLBACK}
                </svg>
              </span>
              <span className="hm-num pt-1">{String(i + 1).padStart(2, '0')}</span>
            </span>
            <span className="mt-auto block">
              <h3 className="svc-title">{it.title}</h3>
              {it.text ? <p className="svc-text">{it.text}</p> : null}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
