import 'server-only';
import path from 'node:path';
import crypto from 'node:crypto';

const isProd = process.env.NODE_ENV === 'production';

function secret(): string {
  const s = process.env.APP_SECRET;
  if (s && s.length >= 32) return s;
  if (isProd && process.env.NEXT_PHASE !== 'phase-production-build') {
    throw new Error('APP_SECRET ausente ou curto demais (mínimo 32 caracteres).');
  }
  // Desenvolvimento/build: segredo efêmero (tokens deixam de valer a cada restart).
  const g = globalThis as unknown as { __grifoDevSecret?: string };
  g.__grifoDevSecret ??= crypto.randomBytes(48).toString('base64url');
  return g.__grifoDevSecret;
}

export const env = {
  isProd,
  siteUrl: (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, ''),
  dataDir: path.resolve(process.env.DATA_DIR || './data'),
  get appSecret() {
    return secret();
  },
  trustProxy: process.env.TRUST_PROXY === 'true',
  showPlaceholders:
    process.env.CONTENT_SHOW_PLACEHOLDERS !== undefined
      ? process.env.CONTENT_SHOW_PLACEHOLDERS === 'true'
      : !isProd,
  crmWebhookUrl: process.env.CRM_WEBHOOK_URL || '',
  crmWebhookSecret: process.env.CRM_WEBHOOK_SECRET || '',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'Site Grifo <site@grifo.agency>',
  },
  gtmId: process.env.NEXT_PUBLIC_GTM_ID || '',
  cronSecret: process.env.CRON_SECRET || '',
};
