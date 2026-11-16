import { headers } from 'next/headers';

export async function JsonLd({ data }: { data: object | object[] }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
        suppressHydrationWarning
      // JSON serializado com escape de "<" para impedir quebra de contexto (XSS).
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
