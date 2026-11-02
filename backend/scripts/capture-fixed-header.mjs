import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';
const ARTIFACT_DIR = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\67a17320-9668-4558-b72d-80c602f996d5\\screenshots';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  // 1. Hover/dropdown on Linh kien PC
  await page.goto(`${BASE_URL}/store`, { waitUntil: 'domcontentloaded' });
  await sleep(1000);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '04_distinct_header_navbar.png') });

  // Click Linh kien PC
  await page.goto(`${BASE_URL}/store?category=pc_parts`, { waitUntil: 'domcontentloaded' });
  await sleep(1000);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '05_linh_kien_only_active.png') });

  // Click PC Gaming
  await page.goto(`${BASE_URL}/store?category=pc_gaming`, { waitUntil: 'domcontentloaded' });
  await sleep(1000);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '06_pc_gaming_only_active.png') });

  console.log('Saved 04, 05, 06 screenshots.');
  await browser.close();
}

capture();
