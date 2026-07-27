const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;

const baseUrl = process.env.APP_URL || 'http://127.0.0.1:8788';
const pagePaths = [
  '/',
  '/strony-wordpress-wroclaw',
  '/landing-page-wroclaw',
  '/sklepy-woocommerce-wroclaw',
  '/aplikacje-webowe-wroclaw',
  '/optymalizacja-i-ratunek-wroclaw',
  '/integracje-api-wroclaw',
  '/brief/',
  '/maintenance.html',
  '/nie-istnieje',
];

async function waitForUi(page) {
  const preloader = page.locator('#preloader');
  if (await preloader.count()) {
    await page.waitForFunction(
      () => document.querySelector('#preloader')?.style.display === 'none',
      null,
      { timeout: 15_000 },
    );
  }
}

function formatViolations(path, state, violations) {
  return violations.map((violation) => {
    const targets = violation.nodes
      .slice(0, 3)
      .map((node) => `${node.target.join(' ')}: ${node.failureSummary || 'no details'}`)
      .join(' | ');
    return `${path} [${state}] ${violation.impact}: ${violation.id} (${targets})`;
  });
}

async function scan(page, path, state) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const blocking = results.violations.filter((violation) =>
    ['critical', 'serious'].includes(violation.impact),
  );
  return formatViolations(path, state, blocking);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const failures = [];
  const pageErrors = [];

  try {
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce',
    });
    for (const path of pagePaths) {
      const page = await desktopContext.newPage();
      page.on('pageerror', (error) => pageErrors.push(`${path}: ${error.message}`));
      const response = await page.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded' });
      assert.equal(response?.status(), path === '/nie-istnieje' ? 404 : 200);
      await waitForUi(page);
      failures.push(...(await scan(page, path, 'default')));
      await page.close();
    }
    await desktopContext.close();

    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: 'reduce',
    });
    const mobile = await mobileContext.newPage();
    await mobile.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
    await waitForUi(mobile);
    await mobile.locator('#hamburger-menu').click();
    await mobile.locator('#fullscreen-menu.active').waitFor({ state: 'visible' });
    failures.push(...(await scan(mobile, '/', 'mobile menu')));
    await mobile.locator('#hamburger-menu').click();
    await mobile.locator('.privacy-trigger:visible').last().click();
    await mobile.locator('#privacy-modal.active').waitFor({ state: 'visible' });
    await mobile.waitForFunction(() => {
      const summaries = [...document.querySelectorAll('.privacy-summary')];
      return summaries.length === 4 && summaries.every((summary) => summary.textContent.trim());
    });
    await mobile.locator('#privacy-modal .modal-content').evaluate((surface) =>
      Promise.all(surface.getAnimations({ subtree: true }).map((animation) =>
        animation.finished.catch(() => undefined),
      )),
    );
    failures.push(...(await scan(mobile, '/', 'privacy dialog')));
    await mobile.close();
    await mobileContext.close();

    assert.deepEqual(pageErrors, []);
    assert.deepEqual(failures, [], failures.join('\n'));
    console.log(`Accessibility gate passed: ${pagePaths.length + 2} axe scans, no serious/critical violations.`);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exit(1);
});
