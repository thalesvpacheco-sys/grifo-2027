// Renderiza a escultura "Asa Grifo" (tools/render-3d/wing.html) em imagens e quadros de vídeo.
// Uso: node tools/render-3d/render.mjs <saida> <variant> <w> <h> [frames=1] [bg=1] [view=hero]
//   frames=1 → <saida>.png   ·   frames>1 → <saida>/0000.png… (para codificar com ffmpeg)
// O site NÃO carrega Three.js: só as imagens/vídeo gerados aqui.
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const [out, variant = 'noir', w = '1600', h = '1200', frames = '1', bg = '1', view = 'hero', extra = ''] = process.argv.slice(2);
const root = resolve('.');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript' };
const srv = createServer(async (req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/\.\.+/g, '');
  try { const b = await readFile(join(root, p)); res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' }); res.end(b); }
  catch { res.writeHead(404); res.end(); }
}).listen(0, '127.0.0.1');
await new Promise((ok) => srv.once('listening', ok));
const port = srv.address().port;

const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await b.newPage({ viewport: { width: +w, height: +h } });
page.on('pageerror', (e) => console.error('pageerror', e.message));
await page.goto(`http://127.0.0.1:${port}/tools/render-3d/${process.env.PAGE || 'wing'}.html?variant=${variant}&w=${w}&h=${h}&frames=${frames}&bg=${bg}&view=${view}&ss=2${extra ? '&' + extra : ''}`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 180000 });
const n = +frames;
if (n > 1) await mkdir(out, { recursive: true });
for (let f = 0; f < n; f++) {
  await page.evaluate((i) => window.renderFrame(i), f);
  const path = n > 1 ? `${out}/${String(f).padStart(4, '0')}.png` : `${out}.png`;
  await page.locator('canvas').screenshot({ path, omitBackground: bg === '0' });
  if (f % 20 === 0) console.log('quadro', f, '/', n);
}
await b.close();
srv.close();
console.log('ok', out);
