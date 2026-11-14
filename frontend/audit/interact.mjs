import puppeteer from 'puppeteer-core';
const CHROME = 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe';
const BASE = 'http://localhost:5173';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const rec = (name, ok, detail = '') => { results.push({ name, ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'}: ${name} ${detail}`); };

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });

async function freshPage() {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  page._errs = [];
  page.on('pageerror', (e) => page._errs.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') page._errs.push(m.text()); });
  return page;
}

// 1. Customer login via real form
{
  const page = await freshPage();
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle2' });
  const emailSel = 'input[type="email"], input[name="email"], input#email';
  await page.waitForSelector(emailSel, { timeout: 5000 }).catch(() => {});
  const inputs = await page.$$('input');
  rec('login-page-has-inputs', inputs.length >= 2, `found ${inputs.length} inputs`);
  // fill via label matching: find email-like and password input
  let emailInput = await page.$('input[type="email"]') || await page.$('input[type="text"]');
  let passInput = await page.$('input[type="password"]');
  if (emailInput && passInput) {
    await emailInput.type('bao.gamer@gmail.com');
    await passInput.type('password123');
    const submit = await page.$('button[type="submit"]');
    if (submit) await submit.click();
    await sleep(1000);
    const url = page.url();
    rec('customer-login-success', url.includes('/store'), url);
  } else {
    rec('customer-login-form-found', false, 'email/password input missing');
  }
  rec('customer-login-no-console-errors', page._errs.length === 0, page._errs.slice(0,3).join(' | '));
  await page.close();
}

// 2. Wrong password shows error
{
  const page = await freshPage();
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle2' });
  const emailInput = await page.$('input[type="email"]') || await page.$('input[type="text"]');
  const passInput = await page.$('input[type="password"]');
  if (emailInput && passInput) {
    await emailInput.type('bao.gamer@gmail.com');
    await passInput.type('wrongpass');
    const submit = await page.$('button[type="submit"]');
    if (submit) await submit.click();
    await sleep(700);
    const bodyText = await page.evaluate(() => document.body.innerText);
    rec('wrong-password-shows-error', /invalid|sai|không|error|khóa|kiểm tra/i.test(bodyText), '');
  }
  await page.close();
}

// 3. Admin login + navigate to products, open add modal
{
  const page = await freshPage();
  await page.goto(`${BASE}/company/login`, { waitUntil: 'networkidle2' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle2' });
  const emailInput = await page.$('input[type="email"]') || await page.$('input[type="text"]');
  const passInput = await page.$('input[type="password"]');
  if (emailInput && passInput) {
    await emailInput.type('admin@computertech.vn');
    await passInput.type('admin123');
    const submit = await page.$('button[type="submit"]');
    if (submit) await submit.click();
    await sleep(1000);
    rec('admin-login-success', page.url().includes('/admin'), page.url());
  }
  await page.goto(`${BASE}/admin/products`, { waitUntil: 'networkidle2' });
  await sleep(600);
  const addBtn = await page.evaluateHandle(() => [...document.querySelectorAll('button')].find(b => /thêm|add|new/i.test(b.textContent||'')));
  const addBtnEl = addBtn.asElement();
  if (addBtnEl) {
    await addBtnEl.click();
    await sleep(500);
    const modalVisible = await page.evaluate(() => !!document.querySelector('[role="dialog"], .fixed.inset-0'));
    rec('admin-products-add-modal-opens', modalVisible, '');
    // try close via Escape
    await page.keyboard.press('Escape');
    await sleep(300);
  } else {
    rec('admin-products-add-button-found', false, '');
  }
  rec('admin-products-no-console-errors', page._errs.length === 0, page._errs.slice(0,3).join(' | '));
  await page.close();
}

// 4. Inventory search/filter
{
  const page = await freshPage();
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.setItem('computertech_auth_session_v1', JSON.stringify({id:'usr_staff_admin',name:'Admin',email:'admin@computertech.vn',role:'admin',active:true})));
  await page.goto(`${BASE}/admin/inventory`, { waitUntil: 'networkidle2' });
  await sleep(600);
  const before = await page.evaluate(() => document.querySelectorAll('tbody tr').length);
  const search = await page.$('input[placeholder*="SKU"], input[placeholder*="Search"]');
  if (search) {
    await search.type('RTX');
    await sleep(500);
    const after = await page.evaluate(() => document.querySelectorAll('tbody tr').length);
    rec('inventory-search-filters-results', after < before, `${before} -> ${after}`);
  } else {
    rec('inventory-search-input-found', false, '');
  }
  await page.close();
}

// 5. POS add to cart flow (sales role)
{
  const page = await freshPage();
  await page.goto(`${BASE}/company/login`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.setItem('computertech_auth_session_v1', JSON.stringify({id:'usr_staff_sale',name:'Sale',email:'sale@computertech.vn',role:'sale',active:true})));
  await page.goto(`${BASE}/sales/pos`, { waitUntil: 'networkidle2' });
  await sleep(700);
  const productCard = await page.$('button, [data-product-id], .cursor-pointer');
  const clickable = await page.evaluateHandle(() => {
    const cands = [...document.querySelectorAll('div,button')].filter(el => /thêm|add/i.test(el.textContent||'') && el.getBoundingClientRect().width < 200);
    return cands[0] || null;
  });
  const el = clickable.asElement();
  if (el) {
    await el.click().catch(()=>{});
    await sleep(500);
  }
  rec('pos-page-loaded-no-errors', page._errs.length === 0, page._errs.slice(0,3).join(' | '));
  await page.close();
}

// 6. Logout flow
{
  const page = await freshPage();
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.setItem('computertech_auth_session_v1', JSON.stringify({id:'usr_cust_01',name:'Phan Quốc Bảo',email:'bao.gamer@gmail.com',role:'customer',active:true,customerId:'cust_01'})));
  await page.goto(`${BASE}/store/account`, { waitUntil: 'networkidle2' });
  await sleep(600);
  const logoutBtn = await page.evaluateHandle(() => [...document.querySelectorAll('button,a')].find(b => /đăng xuất|logout|sign out/i.test(b.textContent||'')));
  const lb = logoutBtn.asElement();
  if (lb) {
    await lb.click();
    await sleep(700);
    const session = await page.evaluate(() => localStorage.getItem('computertech_auth_session_v1'));
    rec('logout-clears-session', !session, '');
  } else {
    rec('logout-button-found', false, '');
  }
  await page.close();
}

// 7. Protected route redirect when not authenticated
{
  const page = await freshPage();
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${BASE}/admin/dashboard`, { waitUntil: 'networkidle2' });
  await sleep(500);
  rec('unauth-admin-redirects-away', !page.url().includes('/admin/dashboard'), page.url());
  await page.close();
}

// 8. Role mismatch: sale trying to access admin shows 403 or redirect
{
  const page = await freshPage();
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.setItem('computertech_auth_session_v1', JSON.stringify({id:'usr_staff_sale',name:'Sale',email:'sale@computertech.vn',role:'sale',active:true})));
  await page.goto(`${BASE}/admin/users`, { waitUntil: 'networkidle2' });
  await sleep(500);
  const url = page.url();
  rec('role-mismatch-blocked', url.includes('/403') || !url.includes('/admin/users'), url);
  await page.close();
}

await browser.close();
console.log('\n=== SUMMARY ===');
console.log(`${results.filter(r=>r.ok).length}/${results.length} passed`);
results.filter(r=>!r.ok).forEach(r => console.log('FAILED:', r.name, r.detail));
