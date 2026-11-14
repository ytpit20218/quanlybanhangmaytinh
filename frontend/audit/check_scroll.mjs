import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe', headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1366, height: 768 });
await page.goto('http://localhost:5173/login');
await page.evaluate(() => localStorage.setItem('computertech_auth_session_v1', JSON.stringify({id:'usr_staff_admin',name:'Admin',email:'admin@computertech.vn',role:'admin',active:true})));
await page.goto('http://localhost:5173/admin/inventory', { waitUntil: 'networkidle2' });
await new Promise(r=>setTimeout(r,800));
await page.evaluate(() => {
  const wraps = [...document.querySelectorAll('.overflow-x-auto')].filter(w => w.offsetParent !== null);
  wraps[0].scrollLeft = 999;
});
await page.screenshot({ path: 'audit/out/inventory-scrolled.png' });
await browser.close();
