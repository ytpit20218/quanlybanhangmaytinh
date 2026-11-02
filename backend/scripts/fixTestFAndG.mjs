import fs from 'fs';

let content = fs.readFileSync('test-e2e-browser.mjs', 'utf8');

const targetIndex = content.indexOf('// 2. Inactive account denied');
if (targetIndex === -1) {
  console.log('Target not found');
  process.exit(1);
}

const cleanTestFandG = `// 2. Inactive account denied
      await page.goto(\`\${BASE_URL}/company/login\`, { waitUntil: 'domcontentloaded' });
      await sleep(300);
      await page.evaluate(() => {
        const key = 'computertech_db_v10_real_clean_catalog_and_staff';
        const raw = localStorage.getItem(key);
        if (raw) {
          const db = JSON.parse(raw);
          const u = db.users.find(x => x.email === 'sale@computertech.vn');
          if (u) u.active = false;
          localStorage.setItem(key, JSON.stringify(db));
        }
      });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await sleep(300);
      for (const b of await page.$$('button')) {
        const text = await page.evaluate(el => el.innerText, b);
        if (text.includes('sale@computertech.vn')) {
          await b.click();
          break;
        }
      }
      await sleep(200);
      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) await submitBtn.click();
      await sleep(600);
      const loginErr = await page.evaluate(() => document.body.innerText);
      record('Test F', 'Inactive / suspended account blocked with explicit error', loginErr.includes('suspended') || loginErr.includes('deactivated') || loginErr.includes('Access Denied') || loginErr.includes('vô hiệu hóa') || loginErr.includes('khóa') || loginErr.includes('từ chối') || loginErr.includes('BR.01'));

      // 3. Customer registration and role boundary check
      await page.goto(\`\${BASE_URL}/login\`, { waitUntil: 'domcontentloaded' });
      await sleep(300);
      for (const b of await page.$$('button')) {
        const text = await page.evaluate(el => el.innerText, b);
        if (text.includes('Tạo tài khoản') || text.includes('Đăng ký')) {
          await b.click();
          break;
        }
      }
      await sleep(300);
      const regName = await page.$('input[placeholder*="Nguyễn Văn An"]');
      if (regName) await regName.type('Nguyễn Văn An');
      const regEmail = await page.$('input[placeholder*="khachhang@gmail.com"]');
      if (regEmail) await regEmail.type('khachhang@computertech.vn');
      const regPhone = await page.$('input[placeholder*="0901"]');
      if (regPhone) await regPhone.type('0901234567');
      const regPass = await page.$('input[placeholder*="••••••••"]');
      if (regPass) await regPass.type('password123');
      for (const b of await page.$$('button')) {
        const text = await page.evaluate(el => el.innerText, b);
        if (text.includes('Tạo tài khoản khách hàng mới')) {
          await b.click();
          break;
        }
      }
      await sleep(800);

      // Now login as customer
      await page.goto(\`\${BASE_URL}/login\`, { waitUntil: 'domcontentloaded' });
      await sleep(300);
      const custEmailInput = await page.$('input[type="email"]');
      if (custEmailInput) await custEmailInput.type('khachhang@computertech.vn');
      const custPassInput = await page.$('input[type="password"]');
      if (custPassInput) await custPassInput.type('password123');
      for (const b of await page.$$('button')) {
        const text = await page.evaluate(el => el.innerText, b);
        if (text.includes('Đăng nhập vào Tài khoản')) {
          await b.click();
          break;
        }
      }
      await sleep(800);
      record('Test F', 'Customer login automatically lands on /store', page.url().includes('/store'), page.url());

      // Customer manual URL tamper to /admin/dashboard
      await page.goto(\`\${BASE_URL}/admin/dashboard\`, { waitUntil: 'domcontentloaded' });
      await sleep(300);
      const custTamper = page.url().includes('/403') || (await page.evaluate(() => document.body.innerText)).includes('403');
      record('Test F', 'Customer manually navigating to /admin/dashboard gets HTTP 403 Forbidden', custTamper);

      await context.close();
    }

    // ====================================================
    // TEST G: Persistence & State Consistency
    // ====================================================
    console.log('\\n--- Running Test G: Persistence & Consistency ---');
    {
      const context = await browser.createBrowserContext();
      const page = await context.newPage();
      await page.setViewport({ width: 1400, height: 900 });

      // Register and login customer
      await page.goto(\`\${BASE_URL}/login\`, { waitUntil: 'domcontentloaded' });
      await sleep(300);
      for (const b of await page.$$('button')) {
        const text = await page.evaluate(el => el.innerText, b);
        if (text.includes('Tạo tài khoản') || text.includes('Đăng ký')) {
          await b.click();
          break;
        }
      }
      await sleep(300);
      const regName = await page.$('input[placeholder*="Nguyễn Văn An"]');
      if (regName) await regName.type('Nguyễn Văn An');
      const regEmail = await page.$('input[placeholder*="khachhang@gmail.com"]');
      if (regEmail) await regEmail.type('khachhang2@computertech.vn');
      const regPhone = await page.$('input[placeholder*="0901"]');
      if (regPhone) await regPhone.type('0901234567');
      const regPass = await page.$('input[placeholder*="••••••••"]');
      if (regPass) await regPass.type('password123');
      for (const b of await page.$$('button')) {
        const text = await page.evaluate(el => el.innerText, b);
        if (text.includes('Tạo tài khoản khách hàng mới')) {
          await b.click();
          break;
        }
      }
      await sleep(800);

      await page.goto(\`\${BASE_URL}/login\`, { waitUntil: 'domcontentloaded' });
      await sleep(300);
      const custEmailInput = await page.$('input[type="email"]');
      if (custEmailInput) await custEmailInput.type('khachhang2@computertech.vn');
      const custPassInput = await page.$('input[type="password"]');
      if (custPassInput) await custPassInput.type('password123');
      for (const b of await page.$$('button')) {
        const text = await page.evaluate(el => el.innerText, b);
        if (text.includes('Đăng nhập vào Tài khoản')) {
          await b.click();
          break;
        }
      }
      await sleep(800);
      await page.goto(\`\${BASE_URL}/store/account\`, { waitUntil: 'domcontentloaded' });
      await sleep(300);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await sleep(400);

      const afterReload = await page.evaluate(() => document.body.innerText);
      record('Test G', 'Session survives hard page reload without losing customer authentication', afterReload.includes('Nguyễn Văn An') || afterReload.includes('Tài khoản') || afterReload.includes('khachhang2@computertech.vn') || afterReload.includes('Hồ sơ'));

      // Check localStorage persistence
      const hasSession = await page.evaluate(() => !!localStorage.getItem('computertech_auth_session_v1'));
      record('Test G', 'Authenticated user session persists in localStorage', hasSession);

      await context.close();
    }

    console.log('\\n=====================================================');
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;
    console.log(\`TOTAL E2E TESTS: \${results.length} | PASSED: \${passed} | FAILED: \${failed}\`);
    console.log(\`PASS RATE: \${Math.round((passed / results.length) * 100)}%\`);
    console.log('=====================================================\\n');

    await browser.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal test runner error:', err);
    await browser.close();
    process.exit(1);
  }
}

runE2ETests();
`;

content = content.substring(0, targetIndex) + cleanTestFandG;
fs.writeFileSync('test-e2e-browser.mjs', content, 'utf8');
console.log('test-e2e-browser.mjs completely fixed!');
