// Sobe os três servidores usados pelos testes E2E (sobre o build atual em .next/), cada um com banco PRÓPRIO e descartável:
//   3300 homologação (pendentes visíveis) · 3400 comportamento de produção (pendentes ocultos) · 3500 fixture do Case Study Studio
// Uso: npm run build && node scripts/qa/e2e-servers.mjs   (Ctrl+C encerra)  →  noutro terminal: npx playwright test
// Credenciais abaixo são SOMENTE de teste local e nunca devem ir para produção.
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'grifo-e2e-'));
const QA = { ADMIN_EMAIL: 'qa@grifo.local', ADMIN_PASSWORD: 'Homolog#2027-Grifo!', ADMIN_NAME: 'QA' };
const servers = [
  { port: 3300, show: 'true', name: 'homolog' },
  { port: 3400, show: 'false', name: 'prod' },
  { port: 3500, show: 'true', name: 'fixture' },
];
const procs = [];
const wait = async (url) => {
  for (let i = 0; i < 120; i++) {
    try { const r = await fetch(url); if (r.status < 500) return; } catch {}
    await new Promise((ok) => setTimeout(ok, 500));
  }
  throw new Error('servidor não respondeu: ' + url);
};

for (const s of servers) {
  const dir = path.join(root, s.name);
  fs.mkdirSync(dir, { recursive: true });
  const env = {
    ...process.env, ...QA, NODE_ENV: 'production', NEXT_TELEMETRY_DISABLED: '1',
    DATA_DIR: dir, CONTENT_SHOW_PLACEHOLDERS: s.show, SITE_URL: `http://127.0.0.1:${s.port}`,
    APP_SECRET: 'e2e-somente-teste-local-nao-usar-em-producao-0123456789',
  };
  const p = spawn('npx', ['next', 'start', '-p', String(s.port), '-H', '127.0.0.1'], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  p.stdout.on('data', (d) => process.stdout.write(`[${s.name}] ${d}`));
  p.stderr.on('data', (d) => { const t = String(d); if (!t.includes('ExperimentalWarning') && !t.includes('trace-warnings')) process.stderr.write(`[${s.name}] ${t}`); });
  procs.push(p);
  await wait(`http://127.0.0.1:${s.port}/`);
  if (s.name === 'fixture') {
    // o banco é criado no primeiro acesso ao conteúdo: aguarda as tabelas antes de gravar o fixture
    let ok = false;
    for (let i = 0; i < 20 && !ok; i++) {
      await fetch(`http://127.0.0.1:${s.port}/projetos`).catch(() => {});
      const r = spawnSync('node', ['--experimental-strip-types', '--no-warnings', 'scripts/qa/seed-fixture.ts'], { env, stdio: 'pipe' });
      ok = r.status === 0;
      if (!ok) { if (i === 19) process.stderr.write(String(r.stderr)); await new Promise((res) => setTimeout(res, 500)); }
      else process.stdout.write(String(r.stdout));
    }
    if (!ok) throw new Error('fixture falhou');
  }
  console.log(`✓ ${s.name} em http://127.0.0.1:${s.port} (dados em ${dir})`);
}
console.log('Servidores prontos. Rode: npx playwright test');
const stop = () => { procs.forEach((p) => p.kill('SIGTERM')); fs.rmSync(root, { recursive: true, force: true }); process.exit(0); };
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
