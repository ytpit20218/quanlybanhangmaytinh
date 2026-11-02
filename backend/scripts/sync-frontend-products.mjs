import fs from 'fs';
import path from 'path';

const scrapedData = JSON.parse(fs.readFileSync(path.resolve('data/scraped_products.json'), 'utf-8'));
const { products } = scrapedData;

function getUiCategory(catSlug) {
  if (['pc-gaming', 'pc-dong-bo', 'pc-van-phong'].includes(catSlug)) {
    return 'pc_gaming';
  }
  if (catSlug === 'laptop') {
    return 'laptops';
  }
  if (catSlug === 'monitors') {
    return 'displays';
  }
  if (catSlug === 'networking-cameras') {
    return 'networking';
  }
  if (['keyboards', 'mice', 'headsets', 'gaming-gear', 'gaming-chairs'].includes(catSlug)) {
    return 'gaming_gear';
  }
  if (catSlug === 'accessories') {
    return 'accessories';
  }
  // PC Parts: cpu, mainboard, ram, ssd-hdd, vga, psu, case, cooling
  return 'pc_parts';
}

function getSubCategory(catSlug) {
  const map = {
    'cpu': 'cpu',
    'ram': 'ram',
    'vga': 'vga',
    'mainboard': 'mainboard',
    'ssd-hdd': 'ssd_hdd',
    'case': 'case',
    'cooling': 'cooling',
    'psu': 'psu'
  };
  return map[catSlug] || catSlug;
}

const frontendProducts = products.map((p, idx) => {
  const prodId = `prod_${p.source_id || idx + 1}`;
  const uiCat = getUiCategory(p.category_slug);
  const subCat = getSubCategory(p.category_slug);
  const primaryImg = p.images && p.images[0] ? p.images[0].image_url : 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800';

  return {
    id: prodId,
    sku: p.sku || `SKU-${idx + 1}`,
    name: p.name,
    category: uiCat,
    subCategory: subCat,
    price: Number(p.price) || 0,
    cost: Number(p.cost_price) || Math.round((p.price || 0) * 0.8),
    warrantyMonths: p.warranty_months || 12,
    specs: p.specs || { 'Thương hiệu': p.brand_name || 'Chính hãng', 'Bảo hành': `${p.warranty_months || 12} Tháng` },
    image: primaryImg,
    minStockAlert: 3,
    description: (p.description || p.name).replace(/\s+/g, ' ').slice(0, 300)
  };
});

// Inventory: ALL PRODUCTS ARE IN STOCK (15 units)
const frontendInventory = {};
frontendProducts.forEach((p, idx) => {
  const onHand = 15;
  const reserved = idx === 0 ? 1 : 0;
  frontendInventory[p.id] = {
    productId: p.id,
    quantityOnHand: onHand,
    quantityReserved: reserved,
    location: 'Kho Tổng HCM - Kệ ' + (idx % 10 + 1),
    lastUpdated: '2026-10-30T14:30:00Z'
  };
});

console.log(`Prepared ${frontendProducts.length} frontend products with separated categories.`);
const counts = {};
frontendProducts.forEach(p => {
  counts[p.category] = (counts[p.category] || 0) + 1;
});
console.table(counts);

const componentCounts = {};
frontendProducts.filter(p => p.category === 'pc_parts').forEach(p => {
  componentCounts[p.subCategory] = (componentCounts[p.subCategory] || 0) + 1;
});
console.log('Subcategories inside pc_parts:');
console.table(componentCounts);

// Write to src/services/realCatalogData.ts
const tsContent = `// Auto-generated from scraped MayTinhBienHoa data
import { Product, Inventory } from '../types';

export const REAL_PRODUCTS: Product[] = ${JSON.stringify(frontendProducts, null, 2)};

export const REAL_INVENTORY: Record<string, Inventory> = ${JSON.stringify(frontendInventory, null, 2)};
`;

fs.writeFileSync(path.resolve('src/services/realCatalogData.ts'), tsContent, 'utf-8');
console.log('Written to src/services/realCatalogData.ts');
