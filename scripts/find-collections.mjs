import * as cheerio from 'cheerio';

async function getCollections() {
  const res = await fetch('https://www.maytinhbienhoa.vn/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  const collections = new Map();
  $('a[href*="/collections/"]').each((i, el) => {
    const href = $(el).attr('href');
    const title = $(el).text().trim().replace(/\s+/g, ' ');
    if (href && title && title.length > 1) {
      const match = href.match(/\/collections\/([a-zA-Z0-9\-_]+)/);
      if (match) {
        collections.set(match[1], title);
      }
    }
  });

  console.log(`Found ${collections.size} collections:`);
  for (const [slug, title] of collections.entries()) {
    console.log(`- ${slug}: ${title}`);
  }
}

getCollections();
