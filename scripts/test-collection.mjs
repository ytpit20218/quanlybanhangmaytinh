import * as cheerio from 'cheerio';

async function testCollection() {
  const url = 'https://www.maytinhbienhoa.vn/collections/pc-gaming';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  console.log('Collection Page Title:', $('title').text());

  // Check product elements
  const products = [];
  $('a[href*="/products/"]').each((i, el) => {
    const href = $(el).attr('href');
    const full = href.startsWith('http') ? href : 'https://www.maytinhbienhoa.vn' + href;
    const text = $(el).text().trim();
    if (text && text.length > 5) {
      products.push({ href: full, text: text.replace(/\s+/g, ' ') });
    }
  });

  console.log('Products found on collection page:', products.slice(0, 10));

  // Also check if Shopify / Haravan products.json exists!
  // On Shopify/Haravan, /collections/pc-gaming/products.json or /products.json often returns clean JSON!
  try {
    const jsonRes = await fetch('https://www.maytinhbienhoa.vn/collections/pc-gaming/products.json?limit=10', {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    if (jsonRes.ok) {
      const data = await jsonRes.json();
      console.log('products.json API is available! Total products in JSON:', data.products?.length);
      if (data.products?.length > 0) {
        console.log('Sample product JSON keys:', Object.keys(data.products[0]));
        console.log('Sample product title:', data.products[0].title);
        console.log('Sample product vendor:', data.products[0].vendor);
        console.log('Sample product price:', data.products[0].variants?.[0]?.price);
        console.log('Sample product image:', data.products[0].images?.[0]?.src);
      }
    } else {
      console.log('products.json returned status:', jsonRes.status);
    }
  } catch (e) {
    console.log('products.json error:', e.message);
  }
}

testCollection();
