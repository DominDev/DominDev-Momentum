// Sitemap lastmod updater
// Usage: node _scripts/update-sitemap.js (from root directory)
// Updates the lastmod date in sitemap.xml to current date

const fs = require('fs');
const path = require('path');

const SITEMAP_PATH = path.join(__dirname, '..', 'sitemap.xml');

function updateSitemap() {
  console.log('🗺️  Updating sitemap.xml lastmod...');

  if (!fs.existsSync(SITEMAP_PATH)) {
    console.error('❌ sitemap.xml not found!');
    process.exit(1);
  }

  const today = new Date().toISOString().split('T')[0];

  let sitemap = fs.readFileSync(SITEMAP_PATH, 'utf8');
  const originalSitemap = sitemap;

  // Update lastmod date
  sitemap = sitemap.replace(
    /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g,
    `<lastmod>${today}</lastmod>`
  );

  if (sitemap === originalSitemap) {
    console.log(`✅ Sitemap already up to date (${today})`);
    return;
  }

  fs.writeFileSync(SITEMAP_PATH, sitemap, 'utf8');
  console.log(`✅ Sitemap lastmod updated to ${today}`);
}

// Run
updateSitemap();
