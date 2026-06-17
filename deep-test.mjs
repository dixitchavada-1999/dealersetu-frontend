// Deep end-to-end test: register owner -> login -> seed -> order generate+cancel -> walk all modules -> form UI review.
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://localhost:5174';
const OUT = 'deep-test-out';
fs.mkdirSync(OUT, { recursive: true });

const SUF = String(Date.now()).slice(-6);
const OWNER = {
  firstName: 'QA', lastName: 'Owner',
  email: `qa.owner.${SUF}@example.com`, userName: `qaowner${SUF}`,
  password: 'Test@1234', mobileNumber: `98${SUF}1`, businessName: `QA Test Co ${SUF}`,
};
const CUST = { firstName: 'QA', lastName: 'Buyer', mobile: `97${SUF}2`, email: `qa.buyer.${SUF}@example.com`, password: 'Cust@1234' };

const steps = [];
const consoleErrors = [];
const netErrors = [];
let CURRENT = 'init';
let shotN = 0;

function ok(name, note = '') { steps.push({ name, status: 'PASS', note }); console.log(`PASS  ${name}${note ? ' — ' + note : ''}`); }
function fail(name, note = '') { steps.push({ name, status: 'FAIL', note }); console.log(`FAIL  ${name}${note ? ' — ' + note : ''}`); }
function info(name, note = '') { steps.push({ name, status: 'INFO', note }); console.log(`INFO  ${name}${note ? ' — ' + note : ''}`); }

async function shot(page, label) {
  shotN++;
  const file = `${OUT}/${String(shotN).padStart(2, '0')}-${label}.png`;
  try { await page.screenshot({ path: file, fullPage: true }); } catch { try { await page.screenshot({ path: file }); } catch {} }
  return file;
}

function wire(page, tag) {
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`[${CURRENT}|${tag}] ${m.text()}`.slice(0, 400)); });
  page.on('pageerror', (e) => consoleErrors.push(`[${CURRENT}|${tag}] PAGEERROR ${e.message}`.slice(0, 400)));
  page.on('response', (r) => {
    const u = r.url(); const s = r.status();
    if (u.includes('/api/') && s >= 400) netErrors.push(`[${CURRENT}|${tag}] ${s} ${r.request().method()} ${u.replace(BASE, '')}`);
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function go(page, route, label) {
  CURRENT = label;
  try {
    await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 25000 });
  } catch (e) { info(`nav ${route}`, e.message.slice(0, 120)); }
  await sleep(1600);
}

const browser = await chromium.launch({ channel: 'chrome' });

// ========================== OWNER CONTEXT ==========================
const ownerCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const owner = await ownerCtx.newPage();
wire(owner, 'owner');

// capture customer loginCode from create-customer (POST /api/team) response
let loginCode = null;
owner.on('response', async (r) => {
  try {
    if (r.request().method() === 'POST' && /\/api\/team(\?|$)/.test(r.url()) && r.status() < 300) {
      const j = await r.json();
      loginCode = j?.data?.loginCode || j?.data?.user?.loginCode || j?.loginCode || loginCode;
    }
  } catch {}
});

// ---- 1) REGISTER ----
CURRENT = 'register';
await go(owner, '/register', 'register');
try {
  const inputs = owner.locator('form input');
  await inputs.nth(0).fill(OWNER.firstName);
  await inputs.nth(1).fill(OWNER.lastName);
  await inputs.nth(2).fill(OWNER.email);
  await inputs.nth(3).fill(OWNER.userName);
  await inputs.nth(4).fill(OWNER.password);
  await inputs.nth(5).fill(OWNER.mobileNumber);
  await inputs.nth(6).fill(OWNER.businessName);
  await shot(owner, 'register-form-filled');
  await owner.getByRole('button', { name: /create account/i }).first().click();
  await owner.waitForURL((u) => !u.pathname.includes('/register'), { timeout: 20000 });
  await sleep(2500);
  if (owner.url().includes('/dashboard') || !owner.url().includes('/register')) ok('Register owner', `${OWNER.email} -> ${owner.url().replace(BASE, '')}`);
  else fail('Register owner', 'still on /register');
} catch (e) { fail('Register owner', e.message.slice(0, 160)); }
await shot(owner, 'dashboard-after-register');

// ---- 2) LOGIN (separate context, prove login works) ----
CURRENT = 'login';
const loginCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const lp = await loginCtx.newPage();
wire(lp, 'login');
await go(lp, '/login', 'login');
await shot(lp, 'login-admin-tab');
try {
  await lp.getByPlaceholder(/email@example.com or username/i).first().fill(OWNER.email);
  await lp.locator('input[type="password"]').first().fill(OWNER.password);
  await shot(lp, 'login-filled');
  await lp.getByRole('button', { name: /^sign in/i }).first().click();
  await lp.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 20000 });
  await sleep(2000);
  if (!lp.url().includes('/login')) ok('Login owner', `-> ${lp.url().replace(BASE, '')}`);
  else fail('Login owner', 'still on /login');
} catch (e) { fail('Login owner', e.message.slice(0, 160)); }
// capture other login tabs UI
try {
  await go(lp, '/login', 'login-tabs');
  await lp.getByRole('button', { name: /customer login/i }).click(); await sleep(500);
  await shot(lp, 'login-customer-tab');
  await lp.getByRole('button', { name: /activate your account/i }).click(); await sleep(500);
  await shot(lp, 'login-customer-activate');
} catch (e) { info('login tabs screenshot', e.message.slice(0, 120)); }
await loginCtx.close();

// ---- 3) SEED: CATEGORY ----
CURRENT = 'category-create';
await go(owner, '/categories', 'categories');
await shot(owner, 'categories-empty');
const CAT = `QA Cat ${SUF}`;
try {
  await owner.getByRole('button', { name: /add category/i }).first().click();
  await sleep(700);
  await shot(owner, 'form-add-category');
  // first text input in modal = Name
  const modalInputs = owner.locator('.fixed input[type="text"], [role="dialog"] input');
  await owner.locator('input').filter({ hasNot: owner.locator('[type=file]') }).nth(0); // noop guard
  // Name is the first TextInput in the modal
  await owner.locator('div').filter({ hasText: /^Name/ }).first(); // noop
  await owner.getByRole('textbox').first().fill(CAT);
  await owner.getByRole('button', { name: /^create$/i }).first().click();
  await sleep(1800);
  ok('Create category', CAT);
} catch (e) { fail('Create category', e.message.slice(0, 160)); }
await shot(owner, 'categories-after-create');

// ---- 4) SEED: PRODUCT (non-variant, in stock) ----
CURRENT = 'product-create';
await go(owner, '/products', 'products');
await shot(owner, 'products-empty');
const PROD = `QA Product ${SUF}`;
try {
  await owner.getByRole('button', { name: /add product/i }).first().click();
  await sleep(800);
  // Name (first textbox), Category (select), then toggle Has Variants OFF
  await owner.getByRole('textbox').first().fill(PROD);
  await owner.locator('select').first().selectOption({ label: CAT }).catch(async () => {
    await owner.locator('select').first().selectOption({ index: 1 });
  });
  await shot(owner, 'form-add-product-variant-on');
  // turn OFF Has Variants -> reveals the non-variant Price/SKU/Stock panel
  await owner.locator('button.w-11.h-6').first().click();
  await owner.getByPlaceholder('0.00').waitFor({ state: 'visible', timeout: 5000 });
  await owner.getByPlaceholder('0.00').fill('250');                      // non-variant Price *
  await owner.getByPlaceholder('SKU code').fill(`SKU-${SUF}`).catch(() => {});
  await owner.getByPlaceholder('0').last().fill('100').catch(() => {});  // Stock Qty
  await shot(owner, 'form-add-product-nonvariant');
  await owner.getByRole('button', { name: /^create$/i }).first().click();
  await sleep(2200);
  // verify it actually saved (modal closed + product visible)
  const created = await owner.getByText(PROD).count().catch(() => 0);
  if (created > 0) ok('Create product', `${PROD} (price 250, stock 100)`);
  else fail('Create product', 'product not found after save (validation?)');
} catch (e) { fail('Create product', e.message.slice(0, 160)); }
await shot(owner, 'products-after-create');

// ---- 5) SEED: CUSTOMER (capture loginCode) ----
CURRENT = 'customer-create';
await go(owner, '/customers', 'customers');
await shot(owner, 'customers-empty');
try {
  await owner.getByRole('button', { name: /add customer/i }).first().click();
  await sleep(800);
  await shot(owner, 'form-add-customer');
  const tb = owner.getByRole('textbox');
  await tb.nth(0).fill(CUST.firstName);   // First Name
  await tb.nth(1).fill(CUST.lastName);    // Last Name
  await tb.nth(2).fill(CUST.mobile);      // Mobile
  await tb.nth(3).fill(CUST.email);       // Email
  await owner.getByRole('button', { name: /^create$/i }).first().click();
  await sleep(2200);
  if (loginCode) ok('Create customer', `${CUST.mobile}, loginCode=${loginCode}`);
  else fail('Create customer', 'no loginCode captured from response');
} catch (e) { fail('Create customer', e.message.slice(0, 160)); }
await shot(owner, 'customers-after-create');

// ========================== CUSTOMER CONTEXT (order generate) ==========================
let placedOrders = 0;
if (loginCode) {
  CURRENT = 'customer-activate';
  const custCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const cust = await custCtx.newPage();
  wire(cust, 'customer');
  await go(cust, '/login', 'customer-login');
  try {
    await cust.getByRole('button', { name: /customer login/i }).click(); await sleep(400);
    await cust.getByRole('button', { name: /activate your account/i }).click(); await sleep(400);
    const ai = cust.locator('form input');
    await ai.nth(0).fill(loginCode);          // activation code
    await ai.nth(1).fill(CUST.password);      // set password
    await ai.nth(2).fill(CUST.password);      // confirm
    await shot(cust, 'customer-activate-filled');
    await cust.getByRole('button', { name: /activate & sign in/i }).click();
    await cust.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 20000 });
    await sleep(2500);
    if (!cust.url().includes('/login')) ok('Customer activate+login', `-> ${cust.url().replace(BASE, '')}`);
    else fail('Customer activate+login', 'still on /login');
  } catch (e) { fail('Customer activate+login', e.message.slice(0, 160)); }
  await shot(cust, 'customer-dashboard');

  // place 2 orders
  for (let n = 1; n <= 2; n++) {
    CURRENT = `customer-order-${n}`;
    await go(cust, '/products', `customer-products-${n}`);
    if (n === 1) await shot(cust, 'customer-shop-grid');
    try {
      await cust.getByRole('button', { name: /add to cart/i }).first().click();
      await sleep(1200);
      await go(cust, '/cart', `customer-cart-${n}`);
      if (n === 1) await shot(cust, 'customer-cart');
      await cust.getByRole('button', { name: /place order/i }).first().click();
      await sleep(2500);
      placedOrders++;
      ok(`Place order #${n}`, `url ${cust.url().replace(BASE, '')}`);
    } catch (e) { fail(`Place order #${n}`, e.message.slice(0, 160)); }
  }
  await shot(cust, 'customer-orders-after-place');
  await custCtx.close();
} else {
  fail('Order generation', 'skipped — no customer loginCode');
}

// ========================== OWNER: order lifecycle + cancel ==========================
CURRENT = 'order-manage';
await go(owner, '/orders', 'orders');
await shot(owner, 'orders-list-placed');
// Lifecycle on one order: Approve -> Dispatch -> Deliver
for (const action of ['Approve', 'Dispatch', 'Deliver']) {
  try {
    const btn = owner.getByTitle(action).first();
    if (await btn.count() > 0) {
      await btn.click(); await sleep(1800);
      ok(`Order lifecycle: ${action}`);
    } else { info(`Order lifecycle: ${action}`, 'no button (no eligible order)'); }
  } catch (e) { fail(`Order lifecycle: ${action}`, e.message.slice(0, 140)); }
}
await shot(owner, 'orders-after-lifecycle');

// Cancel another order (soft delete) then permanent delete
try {
  const cancelBtn = owner.getByTitle('Cancel').first();
  if (await cancelBtn.count() > 0) {
    await cancelBtn.click(); await sleep(700);
    await shot(owner, 'order-cancel-confirm');
    await owner.locator('button.bg-red-600').first().click(); // confirm "Delete"
    await sleep(2000);
    ok('Cancel order (soft)');
  } else { fail('Cancel order (soft)', 'no Cancel button found'); }
} catch (e) { fail('Cancel order (soft)', e.message.slice(0, 140)); }
await shot(owner, 'orders-after-cancel');

try {
  const permBtn = owner.getByTitle('Delete permanently').first();
  if (await permBtn.count() > 0) {
    await permBtn.click(); await sleep(700);
    await owner.locator('button.bg-red-600').first().click();
    await sleep(2000);
    ok('Permanent delete cancelled order');
  } else { info('Permanent delete', 'no permanently-delete button'); }
} catch (e) { fail('Permanent delete', e.message.slice(0, 140)); }
await shot(owner, 'orders-final');

// ========================== WALK ALL MODULES ==========================
const MODULES = [
  ['dashboard', '/dashboard'], ['products', '/products'], ['categories', '/categories'],
  ['orders', '/orders'], ['customers', '/customers'], ['settings', '/settings'],
  ['roles', '/roles'], ['feedback', '/feedback'], ['promotions', '/promotions'],
  ['notifications', '/notifications'], ['profile', '/profile'], ['cart', '/cart'],
  ['my-products', '/my-products'], ['dispatch', '/dispatch'], ['production', '/production'],
  ['marketing', '/marketing'],
];
for (const [name, route] of MODULES) {
  const before = consoleErrors.length, beforeNet = netErrors.length;
  await go(owner, route, `module-${name}`);
  await shot(owner, `module-${name}`);
  const ce = consoleErrors.length - before, ne = netErrors.length - beforeNet;
  const landed = owner.url().replace(BASE, '');
  if (landed !== route) info(`Module ${name}`, `redirected -> ${landed}`);
  else if (ce || ne) info(`Module ${name}`, `${ce} console err, ${ne} api err`);
  else ok(`Module ${name}`);
}

// ---- report ----
const report = {
  ranAt: new Date().toISOString(),
  owner: { email: OWNER.email, userName: OWNER.userName, password: OWNER.password, mobile: OWNER.mobileNumber },
  customer: { mobile: CUST.mobile, email: CUST.email, password: CUST.password, loginCode },
  ordersPlaced: placedOrders,
  steps,
  consoleErrors,
  netErrors,
};
fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
const summary = [
  `DEEP TEST — ${report.ranAt}`,
  `Owner: ${OWNER.email} / ${OWNER.password}`,
  `Customer: ${CUST.mobile} / ${CUST.password} (code ${loginCode})`,
  `Orders placed: ${placedOrders}`,
  ``,
  `STEPS:`,
  ...steps.map((s) => `  ${s.status.padEnd(4)} ${s.name}${s.note ? ' — ' + s.note : ''}`),
  ``,
  `CONSOLE ERRORS (${consoleErrors.length}):`,
  ...consoleErrors.slice(0, 60).map((e) => '  ' + e),
  ``,
  `API ERRORS (${netErrors.length}):`,
  ...netErrors.slice(0, 60).map((e) => '  ' + e),
].join('\n');
fs.writeFileSync(`${OUT}/report.txt`, summary);
console.log('\n' + summary);

await ownerCtx.close();
await browser.close();
console.log('\nDONE. Screenshots + report in', OUT);
