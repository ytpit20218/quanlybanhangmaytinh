// Automated UI/UX audit (puppeteer-core, reuses existing devDependency)
// Usage: node audit/audit.mjs [baseUrl]
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.argv[2] || 'http://localhost:5173';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = path.resolve('audit/out');
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: 'mobile-375', width: 375, height: 812 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'laptop-1366', width: 1366, height: 768 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
];

const ROUTES = [
  { p: '/store', name: 'storefront', role: null },
  { p: '/store/tracking', name: 'tracking', role: null },
  { p: '/login', name: 'customer-login', role: null },
  { p: '/company/login', name: 'company-login', role: null },
  { p: '/403', name: 'forbidden', role: null },
  { p: '/store/account', name: 'cust-account', role: 'customer' },
  { p: '/store/orders', name: 'cust-orders', role: 'customer' },
  { p: '/store/warranty', name: 'cust-warranty', role: 'customer' },
  { p: '/admin/dashboard', name: 'admin-dashboard', role: 'admin' },
  { p: '/admin/users', name: 'admin-users', role: 'admin' },
  { p: '/admin/products', name: 'admin-products', role: 'admin' },
  { p: '/admin/customers', name: 'admin-customers', role: 'admin' },
  { p: '/admin/orders', name: 'admin-orders', role: 'admin' },
  { p: '/admin/inventory', name: 'admin-inventory', role: 'admin' },
  { p: '/admin/repairs', name: 'admin-repairs', role: 'admin' },
  { p: '/sales/pos', name: 'sales-pos', role: 'sale' },
  { p: '/sales/intake', name: 'sales-intake', role: 'sale' },
  { p: '/sales/customers', name: 'sales-customers', role: 'sale' },
  { p: '/warehouse/inventory', name: 'wh-inventory', role: 'warehouse' },
  { p: '/warehouse/picking', name: 'wh-picking', role: 'warehouse' },
  { p: '/technician/tickets', name: 'tech-tickets', role: 'technician' },
];

const USERS = {
  admin: { id: 'usr_staff_admin', name: 'Nguyễn Minh Kiệt', email: 'admin@computertech.vn', role: 'admin', active: true, avatar: '' },
  sale: { id: 'usr_staff_sale', name: 'Nguyễn Việt Anh', email: 'sale@computertech.vn', role: 'sale', active: true, avatar: '' },
  warehouse: { id: 'usr_staff_warehouse', name: 'Ngô Thành Tâm', email: 'warehouse@computertech.vn', role: 'warehouse', active: true, avatar: '' },
  technician: { id: 'usr_staff_tech', name: 'Tech', email: 'tech@computertech.vn', role: 'technician', active: true, avatar: '' },
  customer: { id: 'usr_cust_01', name: 'Phan Quốc Bảo', email: 'bao.gamer@gmail.com', role: 'customer', active: true, avatar: '', customerId: 'cust_01' },
};

const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
const vpFilter = process.env.VP ? process.env.VP.split(',') : null;
const findings = [];
const push = (f) => findings.push(f);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function newPage(browser, vp) {
  const page = await browser.newPage();
  await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });
  page.on('console', (m) => {
    if (m.type() === 'error') page._consoleErrors.push({ text: m.text(), url: page.url() });
    if (m.type() === 'warning') page._consoleWarnings.push(m.text());
  });
  page.on('pageerror', (e) => page._pageErrors.push(String(e && e.message ? e.message : e)));
  page.on('requestfailed', (r) => page._failedRequests.push(`${r.method()} ${r.url()} :: ${r.failure()?.errorText}`));
  page.on('response', (res) => {
    if (res.status() >= 400 && !res.url().includes('favicon')) page._httpErrors.push(`${res.status()} ${res.url()}`);
  });
  return page;
}

const PROBE = () => {
  const de = document.documentElement;
  const overflowX = de.scrollWidth - de.clientWidth;
  // elements wider than viewport (likely horizontal overflow culprits)
  const wide = [];
  if (overflowX > 1) {
    document.querySelectorAll('body *').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > de.clientWidth + 2 && r.height > 0) {
        const cs = getComputedStyle(el);
        if (cs.position === 'fixed') return;
        wide.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className && typeof el.className === 'string' ? el.className : '').slice(0, 90),
          w: Math.round(r.width),
          x: Math.round(r.left),
        });
      }
    });
  }
  const imgs = [...document.images].filter((i) => i.getAttribute('src') && i.complete && i.naturalWidth === 0)
    .map((i) => i.currentSrc || i.src);
  const smallTexts = [...document.querySelectorAll('p,span,a,button,td,li,div')].filter((el) => {
    if (!el.childNodes.length) return false;
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 2);
    if (!hasText) return false;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    return fs > 0 && fs < 11;
  }).length;
  const tinyClickables = [...document.querySelectorAll('button,[role="button"],a[href]')].filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && (r.height < 28 || r.width < 24);
  }).length;
  const fixedH = [...document.querySelectorAll('*')].filter((el) => getComputedStyle(el).position === 'fixed').length;
  return {
    title: document.title,
    bodyTextLen: (document.body.innerText || '').trim().length,
    scrollW: de.scrollWidth, clientW: de.clientWidth, overflowX,
    scrollH: de.scrollHeight,
    wide: wide.slice(0, 6),
    brokenImgs: [...new Set(imgs)].slice(0, 8),
    smallTexts, tinyClickables, fixedH,
    rootEmpty: (document.getElementById('root')?.children.length || 0) === 0,
    hasH1: !!document.querySelector('h1'),
  };
};

const run = async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--lang=vi-VN'],
    defaultViewport: null,
  });

  for (const r of ROUTES) {
    if (only && !only.some((o) => r.name.includes(o))) continue;
    for (const vp of VIEWPORTS) {
      if (vpFilter && !vpFilter.some((v) => vp.name.includes(v))) continue;
      const page = await newPage(browser, vp);
      page._consoleErrors = []; page._consoleWarnings = []; page._pageErrors = [];
      page._failedRequests = []; page._httpErrors = [];
      try {
        await page.goto('about:blank');
        if (r.role) {
          await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
          await page.evaluate((u) => localStorage.setItem('computertech_auth_session_v1', JSON.stringify(u)), USERS[r.role]);
        } else {
          await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
          await page.evaluate(() => localStorage.removeItem('computertech_auth_session_v1'));
        }
        await page.goto(`${BASE}${r.p}`, { waitUntil: 'networkidle2', timeout: 45000 }).catch((e) => push({ kind: 'nav-timeout', route: r.name, vp: vp.name, detail: e.message }));
        await sleep(900);
        const probe = await page.evaluate(PROBE);
        const url = page.url();
        const redirected = !url.includes(r.p);
        push({
          kind: 'page', route: r.name, path: r.p, vp: vp.name, url, redirected,
          consoleErrors: page._consoleErrors.slice(0, 6),
          pageErrors: page._pageErrors.slice(0, 6),
          failedRequests: page._failedRequests.slice(0, 6),
          httpErrors: page._httpErrors.slice(0, 6),
          ...probe,
        });
        if (['desktop-1920', 'mobile-375', 'tablet-768'].includes(vp.name)) {
          await page.screenshot({ path: path.join(OUT, `${r.name}--${vp.name}.png`), fullPage: false });
        }
      } catch (e) {
        push({ kind: 'crash', route: r.name, vp: vp.name, detail: String(e).slice(0, 400) });
      }
      await page.close();
    }
  }

  fs.writeFileSync(path.join(OUT, 'raw.json'), JSON.stringify(findings, null, 1));
  // console summary
  for (const f of findings) {
    if (f.kind !== 'page') { console.log(`[${f.kind}] ${f.route} @${f.vp} ${f.detail || ''}`); continue; }
    const flags = [];
    if (f.overflowX > 1) flags.push(`overflowX=${f.overflowX}`);
    if (f.redirected) flags.push(`REDIRECT->${f.url.replace(BASE, '')}`);
    if (f.consoleErrors.length) flags.push(`consoleErr=${f.consoleErrors.length}`);
    if (f.pageErrors.length) flags.push(`pageErr=${f.pageErrors.length}`);
    if (f.httpErrors.length) flags.push(`httpErr=${f.httpErrors.length}`);
    if (f.failedRequests.length) flags.push(`netFail=${f.failedRequests.length}`);
    if (f.brokenImgs.length) flags.push(`brokenImg=${f.brokenImgs.length}`);
    if (f.rootEmpty) flags.push('ROOT-EMPTY');
    if (f.bodyTextLen < 200) flags.push(`thin=${f.bodyTextLen}`);
    console.log(`${flags.length ? '!' : ' '} ${f.route.padEnd(16)} ${f.vp.padEnd(13)} ${flags.join(' ')}`);
    f.wide?.length && console.log('    wide:', f.wide.map((w) => `${w.tag}.${w.cls}(${w.w}px)`).join(' | '));
    f.consoleErrors?.slice(0, 3).forEach((c) => console.log('    cerr:', c.text.slice(0, 220)));
    f.pageErrors?.slice(0, 3).forEach((c) => console.log('    perr:', c.slice(0, 220)));
    f.httpErrors?.slice(0, 3).forEach((c) => console.log('    http:', c.slice(0, 160)));
    f.failedRequests?.slice(0, 3).forEach((c) => console.log('    net :', c.slice(0, 160)));
    f.brokenImgs?.slice(0, 3).forEach((c) => console.log('    img :', c.slice(0, 140)));
  }
  await browser.close();
};

run().catch((e) => { console.error(e); process.exit(1); });
