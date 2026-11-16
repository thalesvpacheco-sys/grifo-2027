import { defineConfig } from '@playwright/test';

/**
 * Testes ponta a ponta. Exigem servidores já iniciados (ver docs/QA_REPORT.md):
 *  HOMOLOG_URL  — `next start` com CONTENT_SHOW_PLACEHOLDERS=true (homologação)
 *  PROD_URL     — `next start` com CONTENT_SHOW_PLACEHOLDERS=false (comportamento de produção)
 *  FIXTURE_URL  — servidor de teste com o fixture scripts/qa/seed-fixture.ts
 */
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  fullyParallel: true,
  workers: 4,
  reporter: [['list'], ['json', { outputFile: 'qa/e2e-results.json' }]],
  use: { browserName: 'chromium', trace: 'off', locale: 'pt-BR' },
});
