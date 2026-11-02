import * as cheerio from 'cheerio';

async function explore() {
  const res = await fetch('https://www.maytinhbienhoa.vn/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  console.log('HTML size:', html.length);

  // Look for menu links / categories
  const categoryLinks = new Set();
  const productLinks = new Set();

  const regexLinks = /href="([^"]+)"/g;
  let match;
  while ((match = regexLinks.exec(html)) !== null) {
    const href = match[1];
    if (href.includes('.html')) {
      if (href.includes('-p') || href.includes('/san-pham/') || href.includes('.html')) {
        // could be product or category
      }
    }
    if (href.startsWith('https://www.maytinhbienhoa.vn/') || href.startsWith('/')) {
      const full = href.startsWith('/') ? 'https://www.maytinhbienhoa.vn' + href : href;
      if (full.includes('/laptop') || full.includes('/pc') || full.includes('/vga') || full.includes('/cpu') || full.includes('/man-hinh') || full.includes('/linh-kien')) {
        categoryLinks.add(full);
      }
      if (full.endsWith('.html') && !full.includes('/tin-tuc') && !full.includes('/khuyen-mai') && !full.includes('/gioi-thieu')) {
        productLinks.add(full);
      }
    }
  }

  console.log('Categories found:', Array.from(categoryLinks).slice(0, 15));
  console.log('Product candidates found:', Array.from(productLinks).slice(0, 15));
}

explore();
