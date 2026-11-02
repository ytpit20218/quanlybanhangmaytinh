import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\67a17320-9668-4558-b72d-80c602f996d5\\screenshots';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const results = [];
function record(testName, passed, detail = '') {
  results.push({ testName, passed, detail });
  const status = passed ? '✓ PASS' : '✗ FAIL';
  console.log(`  ${status}: ${testName} ${detail ? '(' + detail + ')' : ''}`);
}

async function runMaterial3Verification() {
  console.log('=====================================================');
  console.log('MATERIAL 3 PORTALS & MULTI-EXPERIENCE VERIFICATION');
  console.log(`Target: ${BASE_URL}`);
  console.log('=====================================================\n');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900'],
  });

  try {
    // -----------------------------------------------------------------
    // 1. PUBLIC STOREFRONT (/store)
    // -----------------------------------------------------------------
    console.log('\n--- 1. Testing Public Storefront (/store) ---');
    const storeCtx = await browser.createBrowserContext();
    const storePage = await storeCtx.newPage();
    await storePage.setViewport({ width: 1400, height: 900 });

    await storePage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    record('Root "/" redirects to public store "/store"', storePage.url().includes('/store'));

    const brand = await storePage.$eval('header', (el) => el.innerText);
    record('Storefront displays COMPUTERTECH branding', brand.includes('COMPUTERTECH'));
    record('Storefront displays M3 customer login button', brand.includes('Đăng nhập'));

    await storePage.screenshot({ path: path.join(OUTPUT_DIR, '01_m3_storefront.png'), fullPage: false });
    console.log('  -> Saved screenshot: 01_m3_storefront.png');
    await storeCtx.close();

    // -----------------------------------------------------------------
    // 2. CUSTOMER LOGIN PORTAL (/login)
    // -----------------------------------------------------------------
    console.log('\n--- 2. Testing Customer Login Portal (/login) ---');
    const custLoginCtx = await browser.createBrowserContext();
    const custLoginPage = await custLoginCtx.newPage();
    await custLoginPage.setViewport({ width: 1400, height: 900 });

    await custLoginPage.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    const loginText = await custLoginPage.evaluate(() => document.body.innerText);
    record('Customer login has "Tài khoản Khách hàng"', loginText.includes('Tài khoản Khách hàng'));
    record('Customer login links to Company Portal', loginText.includes('Cổng Nội Bộ'));
    record('Customer login has "Quay lại Cửa hàng"', loginText.includes('Quay lại Cửa hàng'));

    await custLoginPage.screenshot({ path: path.join(OUTPUT_DIR, '02_m3_customer_login.png'), fullPage: false });
    console.log('  -> Saved screenshot: 02_m3_customer_login.png');

    // Perform customer login
    for (const b of await custLoginPage.$$('button')) {
      const text = await custLoginPage.evaluate((el) => el.innerText, b);
      if (text.includes('tuan@minhstudio.dev')) {
        await b.click();
        break;
      }
    }
    await sleep(200);
    const custSubmit = await custLoginPage.$('button[type="submit"]');
    if (custSubmit) await custSubmit.click();
    await sleep(1000);

    record('Customer login lands on Customer Account Portal (/store/account)', custLoginPage.url().includes('/store/account'), custLoginPage.url());

    // -----------------------------------------------------------------
    // 3. LOGGED-IN CUSTOMER ACCOUNT PORTAL (/store/account)
    // -----------------------------------------------------------------
    console.log('\n--- 3. Testing Customer Account Portal (/store/account) ---');
    const acctText = await custLoginPage.evaluate(() => document.body.innerText);
    record('Account portal shows VIP Partner tier (5% discount)', acctText.includes('VIP Partner') || acctText.includes('Giảm 5%'));
    record('Account portal has Orders & Warranty tabs', acctText.includes('Lịch sử đơn hàng') && acctText.includes('Bảo hành & Sửa chữa'));

    await custLoginPage.screenshot({ path: path.join(OUTPUT_DIR, '03_m3_customer_account.png'), fullPage: false });
    console.log('  -> Saved screenshot: 03_m3_customer_account.png');
    await custLoginCtx.close();

    // -----------------------------------------------------------------
    // 4. COMPANY INTERNAL LOGIN PORTAL (/company/login)
    // -----------------------------------------------------------------
    console.log('\n--- 4. Testing Company Staff Login Portal (/company/login) ---');
    const companyCtx = await browser.createBrowserContext();
    const companyPage = await companyCtx.newPage();
    await companyPage.setViewport({ width: 1400, height: 900 });

    await companyPage.goto(`${BASE_URL}/company/login`, { waitUntil: 'networkidle2' });
    const compText = await companyPage.evaluate(() => document.body.innerText);
    record('Company portal displays "Enterprise Internal System"', compText.includes('Enterprise Internal System') || compText.includes('Hệ thống Quản trị & Vận hành'));
    record('Company portal has NO manual role dropdown', (await companyPage.$$('select')).length === 0);

    // Test suspended account rejection
    for (const b of await companyPage.$$('button')) {
      const text = await companyPage.evaluate((el) => el.innerText, b);
      if (text.includes('suspended@computertech.vn')) {
        await b.click();
        break;
      }
    }
    await sleep(200);
    const compSubmit = await companyPage.$('button[type="submit"]');
    if (compSubmit) await compSubmit.click();
    await sleep(800);

    const suspendedErr = await companyPage.evaluate(() => document.body.innerText);
    record('Suspended staff account blocked on /company/login (BR.01)', suspendedErr.includes('Access Denied') || suspendedErr.includes('đình chỉ') || suspendedErr.includes('suspended'));

    await companyPage.screenshot({ path: path.join(OUTPUT_DIR, '04_m3_company_login.png'), fullPage: false });
    console.log('  -> Saved screenshot: 04_m3_company_login.png');

    // Test Admin login through /company/login
    for (const b of await companyPage.$$('button')) {
      const text = await companyPage.evaluate((el) => el.innerText, b);
      if (text.includes('admin@computertech.vn')) {
        await b.click();
        break;
      }
    }
    await sleep(200);
    const compSubmit2 = await companyPage.$('button[type="submit"]');
    if (compSubmit2) await compSubmit2.click();
    await sleep(1000);

    record('Admin login via /company/login lands on /admin/dashboard', companyPage.url().includes('/admin/dashboard'), companyPage.url());
    await companyPage.screenshot({ path: path.join(OUTPUT_DIR, '05_m3_admin_dashboard.png'), fullPage: false });
    console.log('  -> Saved screenshot: 05_m3_admin_dashboard.png');

    await companyCtx.close();

    // -----------------------------------------------------------------
    // 5. CAPTURE WORKSPACE SCREENSHOTS (POS, WAREHOUSE, TECHNICIAN)
    // -----------------------------------------------------------------
    console.log('\n--- 5. Testing & Capturing Staff Workspaces ---');

    // Sales POS
    const saleCtx = await browser.createBrowserContext();
    const salePage = await saleCtx.newPage();
    await salePage.setViewport({ width: 1400, height: 900 });
    await salePage.goto(`${BASE_URL}/company/login`, { waitUntil: 'networkidle2' });
    for (const b of await salePage.$$('button')) {
      const text = await salePage.evaluate((el) => el.innerText, b);
      if (text.includes('sale@computertech.vn')) {
        await b.click();
        break;
      }
    }
    await sleep(200);
    (await salePage.$('button[type="submit"]'))?.click();
    await sleep(1000);
    record('Sale login via /company/login lands on /sales/pos', salePage.url().includes('/sales/pos'));
    await salePage.screenshot({ path: path.join(OUTPUT_DIR, '06_m3_sales_pos.png'), fullPage: false });
    console.log('  -> Saved screenshot: 06_m3_sales_pos.png');
    await saleCtx.close();

    // Warehouse
    const whCtx = await browser.createBrowserContext();
    const whPage = await whCtx.newPage();
    await whPage.setViewport({ width: 1400, height: 900 });
    await whPage.goto(`${BASE_URL}/company/login`, { waitUntil: 'networkidle2' });
    for (const b of await whPage.$$('button')) {
      const text = await whPage.evaluate((el) => el.innerText, b);
      if (text.includes('warehouse@computertech.vn')) {
        await b.click();
        break;
      }
    }
    await sleep(200);
    (await whPage.$('button[type="submit"]'))?.click();
    await sleep(1000);
    record('Warehouse login via /company/login lands on /warehouse/inventory', whPage.url().includes('/warehouse/inventory'));
    await whPage.screenshot({ path: path.join(OUTPUT_DIR, '07_m3_warehouse_inventory.png'), fullPage: false });
    console.log('  -> Saved screenshot: 07_m3_warehouse_inventory.png');
    await whCtx.close();

    // Technician
    const techCtx = await browser.createBrowserContext();
    const techPage = await techCtx.newPage();
    await techPage.setViewport({ width: 1400, height: 900 });
    await techPage.goto(`${BASE_URL}/company/login`, { waitUntil: 'networkidle2' });
    for (const b of await techPage.$$('button')) {
      const text = await techPage.evaluate((el) => el.innerText, b);
      if (text.includes('technician@computertech.vn')) {
        await b.click();
        break;
      }
    }
    await sleep(200);
    (await techPage.$('button[type="submit"]'))?.click();
    await sleep(1000);
    record('Technician login via /company/login lands on /technician/tickets', techPage.url().includes('/technician/tickets'));
    await techPage.screenshot({ path: path.join(OUTPUT_DIR, '08_m3_technician_tickets.png'), fullPage: false });
    console.log('  -> Saved screenshot: 08_m3_technician_tickets.png');
    await techCtx.close();

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    await browser.close();
  }

  const passed = results.filter((r) => r.passed).length;
  console.log('\n=====================================================');
  console.log(`TOTAL MATERIAL 3 PORTAL TESTS: ${results.length} | PASSED: ${passed} | FAILED: ${results.length - passed}`);
  console.log(`PASS RATE: ${Math.round((passed / results.length) * 100)}%`);
  console.log('=====================================================');
}

runMaterial3Verification();
