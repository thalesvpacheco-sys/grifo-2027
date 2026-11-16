// Percurso gravado só da Home 2027 (para aprovação). Uso: node scripts/qa/home-walkthrough.mjs <baseURL> <pasta>
import { chromium } from '@playwright/test';
import fs from 'node:fs';
const base = process.argv[2] || 'http://127.0.0.1:3300';
const dir = process.argv[3] || 'qa/home-2027/video';
fs.mkdirSync(dir, { recursive: true });
const sleep = (ms) => new Promise((ok) => setTimeout(ok, ms));
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
for (const [w, h, tag] of [[1440, 900, 'desktop'], [390, 844, 'mobile']]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, recordVideo: { dir, size: { width: w, height: h } } });
  await ctx.addCookies([{ name: 'grifo_consent', value: encodeURIComponent(JSON.stringify({ v: 1, analytics: false, marketing: false, ts: Date.now() })), url: base }]);
  const p = await ctx.newPage();
  await p.addInitScript(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  await p.goto(base + '/', { waitUntil: 'networkidle' });
  await sleep(5000);
  if (tag === 'desktop') { for (const [x, y] of [[900, 300], [1200, 420], [700, 500]]) { await p.mouse.move(x, y, { steps: 30 }); await sleep(300); } }
  const glide = async (to, steps) => { const from = await p.evaluate(() => scrollY); for (let i = 1; i <= steps; i++) { await p.evaluate((v) => scrollTo(0, v), from + ((to - from) * i) / steps); await sleep(24); } };
  const top = (sel) => p.evaluate((s) => { const e = document.querySelector(s); return e ? e.getBoundingClientRect().top + scrollY - 20 : 0; }, sel);
  for (const sel of ['#proof-title', '#eco-title', '#spec-title', '#micca-title']) { await glide((await top(`section[aria-labelledby="${sel.slice(1)}"]`)), 70); await sleep(1300); }
  const tiles = p.locator('.hm-mi');
  for (let i = 0; i < 5; i++) { await tiles.nth(i).hover().catch(() => tiles.nth(i).click()); await sleep(900); }
  for (const sel of ['proj-title', 'process-title', 'ins-title', 'home_final-title']) { await glide((await top(`section[aria-labelledby="${sel}"]`)), 80); await sleep(1300); }
  await sleep(1500);
  await ctx.close();
  const vids = fs.readdirSync(dir).filter((x) => x.endsWith('.webm') && !x.startsWith('home-'));
  const newest = vids.map((x) => ({ x, t: fs.statSync(`${dir}/${x}`).mtimeMs })).sort((a, c) => c.t - a.t)[0];
  if (newest) fs.renameSync(`${dir}/${newest.x}`, `${dir}/home-${tag}.webm`);
  console.log('ok', tag);
}
await b.close();
