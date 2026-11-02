import fs from 'fs';
import path from 'path';

const CATEGORY_MAP = [
  { slug: 'pc-gaming', catName: 'PC Gaming', catSlug: 'pc-gaming' },
  { slug: 'pc-van-phong-amd', catName: 'PC Văn phòng', catSlug: 'pc-van-phong' },
  { slug: 'may-bo', catName: 'PC Đồng bộ', catSlug: 'pc-dong-bo' },
  { slug: 'mini-pc', catName: 'PC Đồng bộ', catSlug: 'pc-dong-bo' },
  { slug: 'laptop-chinh-hang-gia-tot-uu-dai', catName: 'Laptop', catSlug: 'laptop' },
  { slug: 'laptop-asus-chinh-hang-bao-hanh-2-nam', catName: 'Laptop', catSlug: 'laptop' },
  { slug: 'cpu-bo-vi-xu-ly', catName: 'CPU - Bộ Vi Xử Lý', catSlug: 'cpu' },
  { slug: 'cpu-intel-gen-14', catName: 'CPU - Bộ Vi Xử Lý', catSlug: 'cpu' },
  { slug: 'bo-mach-chu-mainboard', catName: 'Mainboard - Bo Mạch Chủ', catSlug: 'mainboard' },
  { slug: 'main-b760-b760m', catName: 'Mainboard - Bo Mạch Chủ', catSlug: 'mainboard' },
  { slug: 'ram', catName: 'RAM - Bộ Nhớ Trong', catSlug: 'ram' },
  { slug: 'ddr5', catName: 'RAM - Bộ Nhớ Trong', catSlug: 'ram' },
  { slug: 'ssd-o-cung', catName: 'Ổ Cứng SSD/HDD', catSlug: 'ssd-hdd' },
  { slug: 'tong-hop-hdd', catName: 'Ổ Cứng SSD/HDD', catSlug: 'ssd-hdd' },
  { slug: 'vga-02', catName: 'VGA - Card Màn Hình', catSlug: 'vga' },
  { slug: 'rtx-4070-4070-ti', catName: 'VGA - Card Màn Hình', catSlug: 'vga' },
  { slug: 'psu-nguon-may-tinh', catName: 'Nguồn Máy Tính (PSU)', catSlug: 'psu' },
  { slug: 'thung-may-case', catName: 'Case - Thùng Máy Tính', catSlug: 'case' },
  { slug: 'case-mik', catName: 'Case - Thùng Máy Tính', catSlug: 'case' },
  { slug: 'tan-nhiet-nuoc-aio-240mm', catName: 'Tản Nhiệt (Cooling)', catSlug: 'cooling' },
  { slug: 'tan-nhiet-nuoc-all-in-one-120mm', catName: 'Tản Nhiệt (Cooling)', catSlug: 'cooling' },
  { slug: 'lcd-man-hinh', catName: 'Màn Hình Máy Tính', catSlug: 'monitors' },
  { slug: 'man-hinh-chuyen-game-1', catName: 'Màn Hình Máy Tính', catSlug: 'monitors' },
  { slug: 'gear-ban-phim', catName: 'Bàn Phím Gaming & Cơ', catSlug: 'keyboards' },
  { slug: 'gear-chuot', catName: 'Chuột Máy Tính & Gaming', catSlug: 'mice' },
  { slug: 'gear-tai-nghe', catName: 'Tai Nghe Máy Tính', catSlug: 'headsets' },
  { slug: 'tong-hop-gear', catName: 'Gaming Gear Khác', catSlug: 'gaming-gear' },
  { slug: 'ghe-choi-game', catName: 'Ghế Gaming & Công Thái Học', catSlug: 'gaming-chairs' },
  { slug: 'phu-kien-noi-bat-2021', catName: 'Phụ Kiện Máy Tính', catSlug: 'accessories' },
  { slug: 'thiet-bi-mang', catName: 'Camera & Thiết Bị Mạng', catSlug: 'networking-cameras' },
  { slug: 'camera-thong-minh-wifi', catName: 'Camera & Thiết Bị Mạng', catSlug: 'networking-cameras' }
];

function cleanHtml(html) {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSpecs(bodyHtml, title) {
  const specs = {};
  if (!bodyHtml) return specs;

  // Search for bullet points, bold labels or table rows
  const rowRegex = /<tr[^>]*>[\s\S]*?<td[^>]*>(.*?)<\/td>[\s\S]*?<td[^>]*>(.*?)<\/td>[\s\S]*?<\/tr>/gi;
  let match;
  let count = 0;
  while ((match = rowRegex.exec(bodyHtml)) !== null && count < 12) {
    const key = cleanHtml(match[1]);
    const val = cleanHtml(match[2]);
    if (key && val && key.length < 50 && val.length < 200) {
      specs[key] = val;
      count++;
    }
  }

  // If table wasn't found, try standard li or key: value
  if (Object.keys(specs).length === 0) {
    const liRegex = /<li[^>]*>(.*?)<\/li>/gi;
    let liMatch;
    let liCount = 0;
    while ((liMatch = liRegex.exec(bodyHtml)) !== null && liCount < 8) {
      const line = cleanHtml(liMatch[1]);
      if (line.includes(':')) {
        const [k, ...v] = line.split(':');
        const key = k.trim();
        const val = v.join(':').trim();
        if (key && val && key.length < 40 && val.length < 150) {
          specs[key] = val;
          liCount++;
        }
      }
    }
  }

  // Add base fallback spec from title if empty
  if (Object.keys(specs).length === 0) {
    specs['Model'] = title;
  }

  return specs;
}

async function scrape() {
  console.log('--- STARTING PRODUCT COLLECTION FROM MAYTINHBIENHOA.VN ---');

  const seenIds = new Set();
  const seenSkus = new Set();
  const products = [];
  const brands = new Set();
  const categoriesMap = new Map();

  for (const cat of CATEGORY_MAP) {
    categoriesMap.set(cat.catSlug, {
      name: cat.catName,
      slug: cat.catSlug
    });

    try {
      console.log(`Fetching collection: ${cat.slug} (${cat.catName})...`);
      const res = await fetch(`https://www.maytinhbienhoa.vn/collections/${cat.slug}/products.json?limit=15`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!res.ok) {
        console.warn(`Collection ${cat.slug} returned ${res.status}`);
        continue;
      }

      const data = await res.json();
      const rawProducts = data.products || [];
      console.log(`  -> Found ${rawProducts.length} items`);

      for (const p of rawProducts) {
        if (seenIds.has(p.id)) continue;

        const variant = p.variants?.[0] || {};
        const price = Math.round(Number(variant.price) || 0);
        if (price <= 0) continue; // Skip items without valid pricing

        const comparePrice = variant.compare_at_price ? Math.round(Number(variant.compare_at_price)) : null;
        let discountPercent = 0;
        if (comparePrice && comparePrice > price) {
          discountPercent = Math.min(90, Math.round(((comparePrice - price) / comparePrice) * 100));
        }

        // Generate clean SKU
        let sku = variant.sku ? variant.sku.trim() : '';
        if (!sku || seenSkus.has(sku)) {
          sku = `MTBH-${p.id}`;
        }
        seenSkus.add(sku);
        seenIds.add(p.id);

        const vendor = (p.vendor || 'ComputerTech').trim();
        brands.add(vendor);

        const specs = extractSpecs(p.body_html, p.title);
        const description = cleanHtml(p.body_html).slice(0, 1500) || p.title;

        // Process images
        const images = [];
        if (p.images && p.images.length > 0) {
          p.images.slice(0, 5).forEach((img, idx) => {
            let src = img.src;
            if (src && src.startsWith('//')) src = 'https:' + src;
            if (src) {
              images.push({
                image_url: src,
                source_url: `https://www.maytinhbienhoa.vn/products/${p.handle}`,
                is_primary: idx === 0,
                sort_order: idx,
                alt_text: img.alt || p.title
              });
            }
          });
        }

        if (images.length === 0 && p.image?.src) {
          let src = p.image.src;
          if (src.startsWith('//')) src = 'https:' + src;
          images.push({
            image_url: src,
            source_url: `https://www.maytinhbienhoa.vn/products/${p.handle}`,
            is_primary: true,
            sort_order: 0,
            alt_text: p.title
          });
        }

        // Determine stock status from vendor
        const isAvailable = variant.available !== false;
        const status = isAvailable ? 'in_stock' : 'out_of_stock';

        products.push({
          source_id: String(p.id),
          sku,
          name: p.title.trim(),
          slug: p.handle,
          category_slug: cat.catSlug,
          category_name: cat.catName,
          brand_name: vendor,
          price,
          original_price: comparePrice || price,
          discount_percent: discountPercent,
          cost_price: Math.round(price * 0.8), // simulated safe procurement cost
          warranty_months: 24, // standard 24m warranty
          status,
          source_url: `https://www.maytinhbienhoa.vn/products/${p.handle}`,
          description,
          specs,
          images
        });
      }
    } catch (err) {
      console.warn(`Error scraping collection ${cat.slug}:`, err.message);
    }
  }

  console.log(`\n===========================================`);
  console.log(`SCRAPING FINISHED!`);
  console.log(`Total valid products: ${products.length}`);
  console.log(`Total unique brands:  ${brands.size}`);
  console.log(`Total categories:     ${categoriesMap.size}`);
  console.log(`===========================================`);

  // Write to data directory
  const dataDir = path.resolve('data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const outputPayload = {
    scraped_at: new Date().toISOString(),
    source: 'https://www.maytinhbienhoa.vn/',
    total_products: products.length,
    brands: Array.from(brands),
    categories: Array.from(categoriesMap.values()),
    products
  };

  fs.writeFileSync(path.join(dataDir, 'scraped_products.json'), JSON.stringify(outputPayload, null, 2), 'utf-8');
  console.log(`Saved output to: data/scraped_products.json`);
}

scrape();
