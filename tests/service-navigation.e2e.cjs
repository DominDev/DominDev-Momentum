const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const baseUrl = process.env.APP_URL || 'http://127.0.0.1:8788';

async function loadPage(browser, path, viewport, errors) {
  const page = await browser.newPage({ viewport });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'commit' });
  await page.locator('nav').waitFor({ state: 'visible', timeout: 10000 });
  // Navigation modules initialize when the branded preloader is fully removed.
  const preloader = page.locator('#preloader');
  if (await preloader.count()) {
    await page.waitForFunction(
      () => document.querySelector('#preloader')?.style.display === 'none',
      null,
      { timeout: 10000 }
    );
    await page.waitForTimeout(100);
  } else {
    await page.waitForTimeout(100);
  }
  return page;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];

  try {
    const desktop = await loadPage(browser, '/', { width: 1440, height: 900 }, errors);

    assert.equal(await desktop.locator('#services-menu-trigger').count(), 1);
    assert.equal(await desktop.locator('#services-dropdown').count(), 1);
    assert.equal(await desktop.locator('.nav-services__overview').getAttribute('href'), '#services');
    assert.equal(await desktop.getByText('Buduj Markę', { exact: true }).count(), 1);
    assert.equal(
      await desktop.locator('#services-dropdown a[href="/strony-wordpress-wroclaw"]').count(),
      1
    );
    assert.equal(await desktop.locator('#services-dropdown a[href="/maintenance.html"]').count(), 5);

    await desktop.locator('#services-menu-trigger').focus();
    await desktop.keyboard.press('Enter');
    assert.equal(await desktop.locator('#services-menu-trigger').getAttribute('aria-expanded'), 'true');
    assert.equal(await desktop.locator('#services-dropdown').isVisible(), true);
    await desktop.keyboard.press('Escape');
    assert.equal(await desktop.locator('#services-menu-trigger').getAttribute('aria-expanded'), 'false');
    assert.equal(await desktop.locator('#services-dropdown').isVisible(), false);

    const mobile = await loadPage(browser, '/', { width: 375, height: 667 }, errors);

    await mobile.locator('#hamburger-menu').focus();
    await mobile.keyboard.press('Enter');
    assert.equal(await mobile.locator('#hamburger-menu').getAttribute('aria-expanded'), 'true');
    await mobile.locator('#mobile-services-open').waitFor({ state: 'visible' });
    assert.equal(await mobile.locator('#mobile-services-open').isVisible(), true);
    assert.equal(
      await mobile.locator('.mobile-services-nav__overview').getAttribute('href'),
      '#services'
    );
    assert.equal(await mobile.locator('#mobile-services-panel').isVisible(), false);
    await mobile.locator('#mobile-services-open').focus();
    await mobile.keyboard.press('Enter');
    await mobile.locator('#mobile-services-panel').waitFor({ state: 'visible' });
    assert.equal(await mobile.locator('#mobile-services-panel').isVisible(), true);
    assert.equal(await mobile.locator('#mobile-menu-main').isVisible(), true);
    assert.equal(
      await mobile.locator('#fullscreen-menu').evaluate((element) => getComputedStyle(element).overflowY),
      'auto'
    );
    assert.equal(
      await mobile.locator('#mobile-services-open').getAttribute('aria-label'),
      'Zwiń listę usług'
    );
    assert.equal(await mobile.locator('#mobile-services-panel a[href="/maintenance.html"]').count(), 5);
    await mobile.keyboard.press('Escape');
    assert.equal(await mobile.locator('#mobile-services-panel').isVisible(), false);
    assert.equal(await mobile.locator('#mobile-services-open').getAttribute('aria-expanded'), 'false');

    await mobile.keyboard.press('Enter');
    assert.equal(await mobile.locator('#mobile-services-panel').isVisible(), true);
    await mobile.keyboard.press('Enter');
    assert.equal(await mobile.locator('#mobile-services-panel').isVisible(), false);

    const landing = await loadPage(
      browser,
      '/strony-wordpress-wroclaw.html',
      { width: 1440, height: 900 },
      errors
    );

    assert.equal(await landing.locator('#services-menu-trigger').count(), 1);
    assert.equal(await landing.locator('#services-dropdown').count(), 1);
    assert.equal(await landing.locator('.nav-services__overview').getAttribute('href'), '/#services');
    await landing.locator('#services-menu-trigger').focus();
    await landing.keyboard.press('Enter');
    assert.equal(await landing.locator('#services-dropdown').isVisible(), true);
    assert.equal(await landing.locator('#services-dropdown a[href="/maintenance.html"]').count(), 5);
    await landing.keyboard.press('Escape');

    const landingMobile = await loadPage(
      browser,
      '/strony-wordpress-wroclaw.html',
      { width: 844, height: 390 },
      errors
    );

    await landingMobile.locator('#hamburger-menu').focus();
    await landingMobile.keyboard.press('Enter');
    assert.equal(await landingMobile.locator('#hamburger-menu').getAttribute('aria-expanded'), 'true');
    await landingMobile.locator('#mobile-services-open').waitFor({ state: 'visible' });
    assert.equal(
      await landingMobile.locator('.mobile-services-nav__overview').getAttribute('href'),
      '/#services'
    );
    await landingMobile.locator('#mobile-services-open').focus();
    await landingMobile.keyboard.press('Enter');
    await landingMobile.locator('#mobile-services-panel').waitFor({ state: 'visible' });
    assert.equal(await landingMobile.locator('#mobile-services-panel').isVisible(), true);
    assert.equal(
      await landingMobile.locator('#mobile-services-panel a[href="/maintenance.html"]').count(),
      5
    );
    assert.deepEqual(errors, []);

    console.log('Service navigation browser checks passed.');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exit(1);
});
