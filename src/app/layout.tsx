import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { env } from '@/lib/env';

/* Fontes auto-hospedadas (mesmos arquivos do @fontsource, subconjunto latino, que cobre o português).
 * next/font faz o preload e gera um fallback com métricas ajustadas: o texto não "pula" quando a fonte chega (CLS). */
const outfit = localFont({
  src: '../../node_modules/@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2',
  weight: '100 900',
  display: 'swap',
  variable: '--font-display',
  adjustFontFallback: 'Arial',
});
const manrope = localFont({
  src: '../../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2',
  weight: '200 800',
  display: 'swap',
  variable: '--font-sans',
  adjustFontFallback: 'Arial',
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: { default: 'Grifo Agency', template: '%s | Grifo' },
  applicationName: 'Grifo Agency',
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#202020',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`no-js ${outfit.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
