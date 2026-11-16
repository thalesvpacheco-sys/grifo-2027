import { cookies, headers } from 'next/headers';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { CookieConsent } from '@/components/site/CookieConsent';
import { WhatsAppButton } from '@/components/site/WhatsAppButton';
import { ClientEffects } from '@/components/site/ClientEffects';
import { JsonLd } from '@/components/site/JsonLd';
import { PreviewBar } from '@/components/site/PreviewBar';
import { getSettings, listDocs, placeholdersVisible } from '@/lib/cms/content';
import { env } from '@/lib/env';

// Renderização dinâmica: necessária para o nonce da CSP e para o conteúdo sempre atualizado do CMS.
export const dynamic = 'force-dynamic';

type Named = { name: string; tagline?: string };

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, solutions, specialties, showPh] = await Promise.all([getSettings(), listDocs<Named>('solution'), listDocs<Named>('specialty'), placeholdersVisible()]);
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  // O aviso de cookies já vem no HTML para quem ainda não escolheu: aparece na primeira pintura,
  // sem saltar depois da hidratação (antes, era o elemento de LCP no celular e pintava tarde).
  const hasConsent = /"v":1/.test(decodeURIComponent((await cookies()).get('grifo_consent')?.value ?? ''));
  const nav = (d: typeof solutions) => d.map((x) => ({ slug: x.slug, name: x.data.name, tagline: x.data.tagline }));

  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.siteName,
    slogan: settings.tagline,
    url: env.siteUrl,
    logo: `${env.siteUrl}/brand/grifo-logo.svg`,
    foundingDate: '2016',
    description: settings.description,
    areaServed: { '@type': 'Country', name: 'Brasil' },
    knowsAbout: ['Marketing', 'Publicidade', 'Branding', 'Marketing imobiliário', 'Marketing educacional', 'Produção audiovisual', 'Desenvolvimento de sites', 'Estratégia de marketing'],
    ...(settings.contact.address ? { address: settings.contact.address } : {}),
    ...(settings.contact.email ? { email: settings.contact.email } : {}),
    ...(settings.contact.phone ? { telephone: settings.contact.phone } : {}),
    ...(settings.socials.length ? { sameAs: settings.socials.map((s) => s.url) } : {}),
  };

  return (
    <>
      {/* Consent Mode v2: tudo negado por padrão até o visitante escolher. */}
      <script
        nonce={nonce}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html:
            "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};window.gtag=gtag;gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});",
        }}
      />
      <a href="#conteudo" className="sr-only z-[70] rounded-full bg-ambar px-5 py-3 font-semibold text-grafite focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Pular para o conteúdo
      </a>
      <PreviewBar />
      <Header solutions={nav(solutions)} specialties={nav(specialties)} />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer settings={settings} solutions={nav(solutions)} specialties={nav(specialties)} showPlaceholders={showPh} />
      <CookieConsent gtmId={settings.gtmId} initialOpen={!hasConsent} />
      <WhatsAppButton number={settings.contact.whatsapp} />
      <ClientEffects />
      <JsonLd data={org} />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebSite', name: settings.siteName, url: env.siteUrl, inLanguage: 'pt-BR', publisher: { '@type': 'Organization', name: settings.siteName } }} />
    </>
  );
}
