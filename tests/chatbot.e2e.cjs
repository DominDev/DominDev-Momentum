const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const baseUrl = process.env.APP_URL || 'http://127.0.0.1:8788';

async function loadPage(browser, viewport) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${baseUrl}/`, { waitUntil: 'commit' });
  await page.locator('nav').waitFor({ state: 'visible', timeout: 10000 });

  const preloader = page.locator('#preloader');
  if (await preloader.count()) {
    await page.waitForFunction(
      () => document.querySelector('#preloader')?.style.display === 'none',
      null,
      { timeout: 10000 }
    );
  }

  return { page, errors };
}

async function assertChatbotSemantics(page) {
  const trigger = page.locator('#chatbot-trigger');
  const dialog = page.locator('#chatbot-window');
  const messages = page.locator('#chatbot-messages');

  assert.equal(await trigger.evaluate((element) => element.tagName), 'BUTTON');
  assert.equal(await trigger.getAttribute('aria-expanded'), 'false');
  assert.equal(await trigger.getAttribute('aria-controls'), 'chatbot-window');
  assert.equal(await dialog.getAttribute('role'), 'dialog');
  assert.equal(await dialog.getAttribute('aria-modal'), 'true');
  assert.equal(await dialog.getAttribute('aria-hidden'), 'true');
  assert.equal(await messages.getAttribute('role'), 'log');
  assert.equal(await messages.getAttribute('aria-live'), 'polite');
  assert.equal(await page.locator('#chatbot-close').getAttribute('aria-label'), 'Zamknij czat');
  assert.equal(await page.locator('#chatbot-send').getAttribute('aria-label'), 'Wyślij wiadomość');
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  try {
    const desktopContext = await loadPage(browser, { width: 1440, height: 900 });
    const desktop = desktopContext.page;
    await assertChatbotSemantics(desktop);

    const desktopTrigger = desktop.locator('#chatbot-trigger');
    // Reproduces the former hover-then-click race while the module is loading.
    await desktopTrigger.hover();
    await desktopTrigger.click();
    await desktop.locator('#chatbot-window.active').waitFor({ state: 'visible', timeout: 5000 });
    assert.equal(await desktopTrigger.getAttribute('aria-expanded'), 'true');
    assert.equal(await desktop.locator('#chatbot-window').getAttribute('aria-hidden'), 'false');
    assert.equal(await desktop.locator('#chatbot-backdrop').getAttribute('aria-hidden'), 'false');
    await desktop.waitForFunction(() => document.activeElement?.id === 'chatbot-input', null, { timeout: 5000 });
    assert.equal(await desktop.locator('#chatbot-input').evaluate((element) => document.activeElement === element), true);

    await desktop.keyboard.press('Tab');
    assert.equal(await desktop.locator('#chatbot-send').evaluate((element) => document.activeElement === element), true);
    await desktop.keyboard.press('Tab');
    assert.equal(await desktop.locator('#chatbot-close').evaluate((element) => document.activeElement === element), true);
    await desktop.keyboard.press('Escape');
    await desktop.locator('#chatbot-window.active').waitFor({ state: 'hidden' });
    assert.equal(await desktop.locator('#chatbot-window').getAttribute('aria-hidden'), 'true');
    await desktop.waitForFunction(() => document.activeElement?.id === 'chatbot-trigger');
    assert.equal(await desktopTrigger.evaluate((element) => document.activeElement === element), true);

    const mobileContext = await loadPage(browser, { width: 375, height: 667 });
    const mobile = mobileContext.page;
    await mobile.evaluate(() => {
      const previousScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, 500);
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
    });
    await mobile.waitForFunction(() => Math.abs(window.scrollY - 500) < 1);
    const scrollBeforeOpen = await mobile.evaluate(() => window.scrollY);

    const mobileTrigger = mobile.locator('#chatbot-trigger');
    await mobileTrigger.click();
    await mobile.locator('#chatbot-window.active').waitFor({ state: 'visible', timeout: 5000 });
    assert.equal(await mobile.locator('#chatbot-backdrop').evaluate((element) => element.classList.contains('active')), true);
    assert.equal(await mobile.locator('body').evaluate((element) => element.style.position), 'fixed');
    assert.equal(await mobile.locator('body').evaluate((element) => element.style.top), `-${scrollBeforeOpen}px`);
    assert.equal(await mobile.locator('body').evaluate((element) => element.classList.contains('chatbot-open')), true);

    await mobile.locator('#chatbot-close').click();
    await mobile.locator('#chatbot-window.active').waitFor({ state: 'hidden' });
    await mobile.waitForFunction((scrollY) => Math.abs(window.scrollY - scrollY) < 1, scrollBeforeOpen);
    assert.equal(await mobile.locator('body').evaluate((element) => element.style.position), '');
    assert.equal(await mobile.locator('body').evaluate((element) => element.classList.contains('chatbot-open')), false);

    assert.deepEqual(desktopContext.errors, []);
    assert.deepEqual(mobileContext.errors, []);
    console.log('Chatbot opening and accessibility checks passed.');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exit(1);
});
