import { LOGO_PATHS, LOGO_VIEWBOX } from './logo-paths';

/** Logotipo Grifo vetorial. `tone="light"` para fundos escuros (letras brancas). */
export function Logo({ tone = 'dark', className = '', title = 'Grifo' }: { tone?: 'dark' | 'light'; className?: string; title?: string }) {
  return (
    <svg viewBox={LOGO_VIEWBOX} className={className} role="img" aria-label={title} focusable="false">
      {LOGO_PATHS.map((p, i) => (
        <path key={i} d={p.d} transform={`translate(${p.t})`} fill={p.k === 'a' ? '#F09702' : tone === 'light' ? '#FFFFFF' : '#202020'} />
      ))}
    </svg>
  );
}

/** Símbolo das asas (três faixas) — elemento gráfico recorrente. */
export function Wing({ className = '', color = 'currentColor' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 14" className={className} aria-hidden="true" focusable="false">
      <path d="M0 0h24v3.2H5.2A5.2 5.2 0 0 1 0 0Z" fill={color} />
      <path d="M4.6 5.4H24v3.2H9.8a5.2 5.2 0 0 1-5.2-3.2Z" fill={color} />
      <path d="M9.2 10.8H24V14h-9.6a5.2 5.2 0 0 1-5.2-3.2Z" fill={color} />
    </svg>
  );
}
