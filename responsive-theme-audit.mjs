// Responsive + theme audit: register+login owner, then visit key routes across
// mobile/tablet/desktop × light/dark, screenshot each, and auto-detect:
//   - horizontal overflow (responsive break)
//   - low-contrast / invisible text (per-theme color combos)
// Output: responsive-audit-out/ (screenshots + report.json + report.txt)
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.BASE || 'http://localhost:5174';
const OUT = 'responsive-audit-out';
fs.mkdirSync(OUT, { recursive: true });

const SUF = String(Date.now()).slice(-6);
const OWNER = {
  firstName: 'QA', lastName: 'Resp',
  email: `qa.resp.${SUF}@example.com`, userName: `qaresp${SUF}`,
  password: 'Test@1234', mobileNumber: `96${SUF}1`, businessName: `QA Resp Co ${SUF}`,
};

const VIEWPORTS = [
  { key: 'mobile', width: 390, height: 844 },   // iPhone 12/13/14
  { key: 'tablet', width: 768, height: 1024 },  // iPad portrait
  { key: 'desktop', width: 1440, height: 900 },
];
const THEMES = ['light', 'dark'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const findings = [];
const consoleErrors = [];

// ── In-page audit: overflow + contrast ──────────────────────────────────────
function pageAudit() {
  return /* runs in browser */ (() => {
    const docW = document.documentElement.scrollWidth;
    const winW = window.innerWidth;
    const overflowPx = Math.max(0, docW - winW);

    // Find what's wider than the viewport (the offending elements).
    const wideEls = [];
    if (overflowPx > 1) {
      for (const el of Array.from(document.querySelectorAll('*'))) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.right > winW + 1 && r.left >= 0) {
          const tag = el.tagName.toLowerCase();
          const cls = (el.className && el.className.toString ? el.className.toString() : '').slice(0, 60);
          wideEls.push(`${tag}.${cls.replace(/\s+/g, '.')} (right=${Math.round(r.right)})`);
        }
        if (wideEls.length >= 6) break;
      }
    }

    // ── Contrast ──
    const parseRGB = (s) => {
      const m = s && s.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(',').map((x) => parseFloat(x.trim()));
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    const lum = ({ r, g, b }) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    const ratio = (f, b) => { const L1 = lum(f), L2 = lum(b); const a = Math.max(L1, L2), z = Math.min(L1, L2); return (a + 0.05) / (z + 0.05); };

    const bodyBg = parseRGB(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
    const effBg = (el) => {
      let node = el;
      while (node && node !== document.documentElement) {
        const bg = parseRGB(getComputedStyle(node).backgroundColor);
        if (bg && bg.a >= 0.5) return bg;
        node = node.parentElement;
      }
      return bodyBg;
    };

    const low = [];
    const seen = new Set();
    const els = Array.from(document.querySelectorAll('p,span,a,h1,h2,h3,h4,h5,label,button,td,th,li,div,small,strong'));
    for (const el of els) {
      // only elements with their OWN visible text
      const direct = Array.from(el.childNodes).filter((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
      if (direct.length === 0) continue;
      const txt = direct.map((n) => n.textContent.trim()).join(' ').slice(0, 40);
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.1) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) continue;
      const fg = parseRGB(cs.color);
      if (!fg || fg.a < 0.1) continue;
      const bg = effBg(el);
      const cr = ratio(fg, bg);
      const fontSize = parseFloat(cs.fontSize);
      const bold = parseInt(cs.fontWeight) >= 700;
      const large = fontSize >= 24 || (fontSize >= 18.66 && bold);
      const threshold = large ? 3.0 : 4.5; // WCAG AA
      if (cr < threshold) {
        const key = txt + '|' + Math.round(cr * 10);
        if (seen.has(key)) continue;
        seen.add(key);
        low.push({
          text: txt,
          ratio: Math.round(cr * 100) / 100,
          color: cs.color,
          bg: `rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)})`,
          fontSize: Math.round(fontSize),
          required: threshold,
        });
      }
    }
    low.sort((a, b) => a.ratio - b.ratio);
    return { overflowPx, wideEls, lowContrastCount: low.length, lowContrast: low.slice(0, 12) };
  })();
}

async function applyThemeAndViewport(page, theme, vp) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await page.evaluate((t) => localStorage.setItem('theme', t), theme);
  await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
  await sleep(900);
}

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 300)); });
page.on('pageerror', (e) => consoleErrors.push('PAGEERROR ' + e.message.slice(0, 300)));

// ── 1) REGISTER (owner) ──
await page.goto(`${BASE}/register`, { waitUntil: 'domcontentloaded' });
await sleep(1200);
try {
  const inputs = page.locator('form input');
  await inputs.nth(0).fill(OWNER.firstName);
  await inputs.nth(1).fill(OWNER.lastName);
  await inputs.nth(2).fill(OWNER.email);
  await inputs.nth(3).fill(OWNER.userName);
  await inputs.nth(4).fill(OWNER.password);
  await inputs.nth(5).fill(OWNER.mobileNumber);
  await inputs.nth(6).fill(OWNER.businessName);
  await page.getByRole('button', { name: /create account/i }).first().click();
  await page.waitForURL((u) => !u.pathname.includes('/register'), { timeout: 20000 });
  await sleep(2500);
  console.log('REGISTER ->', page.url().replace(BASE, ''));
} catch (e) { console.log('REGISTER FAILED:', e.message.slice(0, 160)); }

// Seed a category + product so list pages aren't empty (better contrast coverage).
async function seed() {
  try {
    await page.goto(`${BASE}/categories`, { waitUntil: 'domcontentloaded' }); await sleep(1200);
    await page.getByRole('button', { name: /add category/i }).first().click(); await sleep(700);
    await page.getByRole('textbox').first().fill(`QA Cat ${SUF}`);
    await page.getByRole('button', { name: /^create$/i }).first().click(); await sleep(1600);
  } catch (e) { console.log('seed category skipped:', e.message.slice(0, 100)); }
  try {
    await page.goto(`${BASE}/products`, { waitUntil: 'domcontentloaded' }); await sleep(1200);
    await page.getByRole('button', { name: /add product/i }).first().click(); await sleep(800);
    await page.getByRole('textbox').first().fill(`QA Product ${SUF}`);
    await page.locator('select').first().selectOption({ index: 1 }).catch(() => {});
    await page.locator('button.w-11.h-6').first().click().catch(() => {});
    await page.getByPlaceholder('0.00').fill('250').catch(() => {});
    await page.getByRole('button', { name: /^create$/i }).first().click(); await sleep(1800);
  } catch (e) { console.log('seed product skipped:', e.message.slice(0, 100)); }
}
await seed();

// ── 2) ROUTES to audit (logged-in owner) ──
const ROUTES = [
  ['dashboard', '/dashboard'],
  ['products', '/products'],
  ['categories', '/categories'],
  ['orders', '/orders'],
  ['customers', '/customers'],
  ['settings', '/settings'],
  ['profile', '/profile'],
];

// Optional modal openers (form UI) — opened after navigation, per route.
const MODAL_OPENERS = {
  products: /add product/i,
  categories: /add category/i,
  customers: /add customer/i,
};

async function auditOnce(label, theme, vp, openModalRe) {
  let opened = false;
  if (openModalRe) {
    try { await page.getByRole('button', { name: openModalRe }).first().click({ timeout: 4000 }); await sleep(800); opened = true; }
    catch { opened = false; }
  }
  const res = await page.evaluate(pageAudit).catch(() => null);
  const name = `${label}${opened ? '-form' : ''}__${vp.key}__${theme}`;
  const file = `${OUT}/${name}.png`;
  try { await page.screenshot({ path: file, fullPage: true }); } catch { try { await page.screenshot({ path: file }); } catch {} }
  if (res) {
    findings.push({ route: label, form: opened, viewport: vp.key, theme, screenshot: file, ...res });
    const flag = res.overflowPx > 1 ? `OVERFLOW ${res.overflowPx}px` : 'ok-width';
    console.log(`  ${name.padEnd(34)} ${flag.padEnd(16)} lowContrast=${res.lowContrastCount}`);
  }
  if (opened) {
    // close modal (Esc) so next iteration starts clean
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(400);
  }
}

for (const [label, route] of ROUTES) {
  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' }).catch(() => {});
      await sleep(700);
      await applyThemeAndViewport(page, theme, vp);
      const landed = page.url().replace(BASE, '');
      if (!landed.includes(route)) { console.log(`  ${label} redirected -> ${landed}, skip`); continue; }
      await auditOnce(label, theme, vp, null);
      // form/modal pass (desktop+mobile only, to keep it quick) for routes with a modal
      if (MODAL_OPENERS[label] && vp.key !== 'tablet') {
        await auditOnce(label, theme, vp, MODAL_OPENERS[label]);
      }
    }
  }
}

// ── 3) Logged-out auth forms (register + login) ──
const authCtx = await browser.newContext();
const ap = await authCtx.newPage();
for (const [label, route] of [['register', '/register'], ['login', '/login']]) {
  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      await ap.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' }).catch(() => {});
      await sleep(500);
      await applyThemeAndViewport(ap, theme, vp);
      const res = await ap.evaluate(pageAudit).catch(() => null);
      const name = `auth-${label}__${vp.key}__${theme}`;
      const file = `${OUT}/${name}.png`;
      try { await ap.screenshot({ path: file, fullPage: true }); } catch {}
      if (res) {
        findings.push({ route: label, form: true, viewport: vp.key, theme, screenshot: file, ...res });
        const flag = res.overflowPx > 1 ? `OVERFLOW ${res.overflowPx}px` : 'ok-width';
        console.log(`  ${name.padEnd(34)} ${flag.padEnd(16)} lowContrast=${res.lowContrastCount}`);
      }
    }
  }
}
await authCtx.close();

// ── Report ──
const overflows = findings.filter((f) => f.overflowPx > 1);
const contrastHotspots = findings.filter((f) => f.lowContrastCount > 0).sort((a, b) => b.lowContrastCount - a.lowContrastCount);
const report = { ranAt: new Date().toISOString(), base: BASE, owner: OWNER, totalChecks: findings.length, overflows: overflows.length, findings, consoleErrors };
fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));

const lines = [
  `RESPONSIVE + THEME AUDIT — ${report.ranAt}`,
  `Checks: ${findings.length}  |  Overflow breaks: ${overflows.length}  |  Console errors: ${consoleErrors.length}`,
  ``,
  `── HORIZONTAL OVERFLOW (responsive breaks) ──`,
  ...(overflows.length ? overflows.map((f) => `  ${f.route}/${f.viewport}/${f.theme}: +${f.overflowPx}px  [${(f.wideEls || []).join(' | ')}]`) : ['  none ✓']),
  ``,
  `── LOW-CONTRAST / INVISIBLE TEXT (worst first) ──`,
  ...(contrastHotspots.length ? contrastHotspots.slice(0, 20).flatMap((f) => [
    `  ${f.route}${f.form ? '(form)' : ''}/${f.viewport}/${f.theme}: ${f.lowContrastCount} issue(s)`,
    ...f.lowContrast.slice(0, 4).map((c) => `      "${c.text}"  ratio ${c.ratio} (need ${c.required})  ${c.color} on ${c.bg}`),
  ]) : ['  none ✓']),
  ``,
  `── CONSOLE ERRORS (${consoleErrors.length}) ──`,
  ...consoleErrors.slice(0, 30).map((e) => '  ' + e),
].join('\n');
fs.writeFileSync(`${OUT}/report.txt`, lines);
console.log('\n' + lines);

await ctx.close();
await browser.close();
console.log('\nDONE. Screenshots + report in', OUT);
