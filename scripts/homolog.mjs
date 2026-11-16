// Sobe uma homologação local navegável (build de produção + banco próprio em ./data-homolog).
// Mostra cases e rascunhos pendentes com selo e noindex (CONTENT_SHOW_PLACEHOLDERS=true).
// Uso: npm run homolog   →   http://localhost:3000  ·  painel: /admin
import { spawnSync, spawn } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';

const env = {
  ...process.env,
  NODE_ENV: 'production',
  DATA_DIR: process.env.DATA_DIR || './data-homolog',
  CONTENT_SHOW_PLACEHOLDERS: 'true',
  SITE_URL: process.env.SITE_URL || 'http://localhost:3000',
  APP_SECRET: process.env.APP_SECRET || crypto.randomBytes(48).toString('base64url'),
  NEXT_TELEMETRY_DISABLED: '1',
};
if (!fs.existsSync('.next/BUILD_ID')) {
  const b = spawnSync('npx', ['next', 'build'], { stdio: 'inherit', env });
  if (b.status !== 0) process.exit(b.status ?? 1);
}
if (!env.ADMIN_EMAIL) console.log('Dica: defina ADMIN_EMAIL e ADMIN_PASSWORD para criar o usuário do painel no primeiro boot.');
console.log(`Homologação em ${env.SITE_URL}  (dados em ${env.DATA_DIR})`);
spawn('npx', ['next', 'start', '-p', process.env.PORT || '3000'], { stdio: 'inherit', env });
