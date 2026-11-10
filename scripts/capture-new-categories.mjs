import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';
const ARTIFACT_DIR = path.resolve('./screenshots');

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  // 1. Linh Kien PC with Subcategories
  await page.goto(`${BASE_URL}/store?category=pc_parts`, { waitUntil: 'domcontentloaded' });
  await sleep(1500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '01_linh_kien_subcategories.png') });
  console.log('Saved 01_linh_kien_subcategories.png');

  // 2. PC Gaming
  await page.goto(`${BASE_URL}/store?category=pc_gaming`, { waitUntil: 'domcontentloaded' });
  await sleep(1500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '02_pc_gaming_catalog.png') });
  console.log('Saved 02_pc_gaming_catalog.png');

  // 3. Filter CPU inside Linh Kien
  await page.goto(`${BASE_URL}/store?category=pc_parts&sub=cpu`, { waitUntil: 'domcontentloaded' });
  await sleep(1500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '03_cpu_subcomponents.png') });
  console.log('Saved 03_cpu_subcomponents.png');

  await browser.close();
}

capture();
