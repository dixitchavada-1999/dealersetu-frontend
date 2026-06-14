// UI theme audit — logs in as owner, screenshots each module in light + dark.
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://localhost:5174';
const OUT = 'ui-audit';
const EMAIL = 'admin@gmail.com';
const PASS = '666666';

const MODULES = [
  ['dashboard', '/dashboard'],
  ['products', '/products'],
  ['categories', '/categories'],
  ['orders', '/orders'],
  ['customers', '/customers'],
  ['settings', '/settings'],
  ['roles', '/roles'],
  ['feedback', '/feedback'],
  ['promotions', '/promotions'],
  ['profile', '/profile'],
];

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// ── Login ──────────────────────────────────────────────
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
await page.getByPlaceholder(/email|username/i).first().fill(EMAIL);
await page.locator('input[type="password"]').first().fill(PASS);
await page.getByRole('button', { name: /sign in/i }).first().click();
await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 15000 }).catch(() => {});
await page.waitForTimeout(2000);
console.log('Logged in. URL:', page.url());
if (page.url().includes('/login')) { console.log('LOGIN FAILED — aborting'); await browser.close(); process.exit(1); }

for (const theme of ['light', 'dark']) {
  await page.evaluate((t) => localStorage.setItem('theme', t), theme);
  for (const [name, route] of MODULES) {
    try {
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(1200); // let data + theme settle
      const file = `${OUT}/${name}-${theme}.png`;
      await page.screenshot({ path: file, fullPage: true });
      console.log('shot:', file);
    } catch (e) {
      console.log('FAIL', name, theme, e.message);
    }
  }
}

await browser.close();
console.log('done');
