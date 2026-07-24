// Sitemap lastmod updater
// Usage: node _scripts/update-sitemap.js (from root directory)
// Uses the latest Git commit date of each page instead of stamping every URL
// with the build date. If Git history is unavailable, existing dates are kept.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');
const SITEMAP_PATH = path.join(ROOT_DIR, 'sitemap.xml');

const PAGE_SOURCES = new Map([
  ['https://domindev.com/', ['index.html', 'index.md']],
  ['https://domindev.com/strony-wordpress-wroclaw', ['strony-wordpress-wroclaw.html']],
  ['https://domindev.com/landing-page-wroclaw', ['landing-page-wroclaw.html']],
  ['https://domindev.com/sklepy-woocommerce-wroclaw', ['sklepy-woocommerce-wroclaw.html']],
  ['https://domindev.com/aplikacje-webowe-wroclaw', ['aplikacje-webowe-wroclaw.html']],
  ['https://domindev.com/optymalizacja-i-ratunek-wroclaw', ['optymalizacja-i-ratunek-wroclaw.html']],
  ['https://domindev.com/integracje-api-wroclaw', ['integracje-api-wroclaw.html']],
]);

function getGitDate(file) {
  try {
    const date = execFileSync('git', ['log', '-1', '--format=%cs', '--', file], {
      cwd: ROOT_DIR,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();

    return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
  } catch {
    return null;
  }
}

function latestGitDate(files) {
  return files
    .map(getGitDate)
    .filter(Boolean)
    .sort()
    .at(-1) || null;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceLastmod(sitemap, url, date) {
  const pattern = new RegExp(
    `(<loc>${escapeRegExp(url)}</loc>\\s*<lastmod>)\\d{4}-\\d{2}-\\d{2}(</lastmod>)`
  );

  if (!pattern.test(sitemap)) {
    console.warn(`Missing sitemap entry for ${url}; leaving file unchanged for this URL.`);
    return sitemap;
  }

  return sitemap.replace(pattern, `$1${date}$2`);
}

function updateSitemap() {
  console.log('Updating sitemap.xml lastmod from Git history...');

  if (!fs.existsSync(SITEMAP_PATH)) {
    console.error('sitemap.xml not found!');
    process.exit(1);
  }

  let sitemap = fs.readFileSync(SITEMAP_PATH, 'utf8');
  const originalSitemap = sitemap;

  for (const [url, files] of PAGE_SOURCES) {
    const date = latestGitDate(files);
    if (!date) {
      console.warn(`No Git date for ${url}; preserving its current lastmod.`);
      continue;
    }
    sitemap = replaceLastmod(sitemap, url, date);
  }

  if (sitemap === originalSitemap) {
    console.log('Sitemap dates already match page history.');
    return;
  }

  fs.writeFileSync(SITEMAP_PATH, sitemap, 'utf8');
  console.log('Sitemap lastmod dates updated from page history.');
}

updateSitemap();
