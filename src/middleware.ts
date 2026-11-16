import { NextResponse, type NextRequest } from 'next/server';

/**
 * Camada de segurança de borda:
 *  - Content-Security-Policy com nonce por requisição (scripts inline só com nonce; GTM via 'strict-dynamic')
 *  - Cabeçalhos HSTS, anti-clickjacking, anti-sniffing, Referrer e Permissions Policy
 *  - Bloqueio do painel sem cookie de sessão (a validação real da sessão acontece no servidor)
 *  - noindex para /admin e /api
 */
const isProd = process.env.NODE_ENV === 'production';
const SESSION_COOKIE = isProd ? '__Host-grifo_session' : 'grifo_session';

function csp(nonce: string, isAdmin: boolean) {
  const gtm = isAdmin ? '' : ' https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://*.g.doubleclick.net https://www.google.com';
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isProd ? '' : " 'unsafe-eval'"}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https://images.unsplash.com${gtm}`,
    `font-src 'self' data:`,
    `media-src 'self' blob:`,
    `connect-src 'self'${gtm}${isProd ? '' : ' ws: wss:'}`,
    `frame-src 'self' https://www.googletagmanager.com https://www.youtube-nocookie.com https://player.vimeo.com`,
    `worker-src 'self' blob:`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    isProd ? 'upgrade-insecure-requests' : '',
  ]
    .filter(Boolean)
    .join('; ');
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdmin = pathname.startsWith('/admin');

  // Gate do painel: sem cookie → login. (Login, 2FA e assets ficam liberados.)
  if (isAdmin && !pathname.startsWith('/admin/login') && !req.cookies.get(SESSION_COOKIE)) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = '';
    return NextResponse.redirect(url);
  }

  const nonce = btoa(crypto.randomUUID());
  const policy = csp(nonce, isAdmin);

  const reqHeaders = new Headers(req.headers);
  reqHeaders.set('x-nonce', nonce);
  reqHeaders.set('content-security-policy', policy);
  reqHeaders.set('x-pathname', pathname);

  const res = NextResponse.next({ request: { headers: reqHeaders } });
  res.headers.set('Content-Security-Policy', policy);
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()');
  res.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  res.headers.set('X-DNS-Prefetch-Control', 'on');
  if (isProd) res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  if (isAdmin || pathname.startsWith('/api')) {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    res.headers.set('Cache-Control', 'no-store');
  }
  return res;
}

export const config = {
  matcher: [
    // Ignora assets estáticos e otimizador de imagens; prefetch não precisa de nonce novo.
    {
      source: '/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|acervo/|brand/|video/|media/|api/admin/media|robots.txt|sitemap.xml).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
