const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const baseUrl = process.env.APP_URL || 'http://127.0.0.1:8788';

async function loadPage(browser, viewport, path = '/') {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'commit' });
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

async function askChatbot(page, question) {
  const botMessages = page.locator('#chatbot-messages .chat-message.bot');
  const messageCountBefore = await botMessages.count();

  await page.locator('#chatbot-input').fill(question);
  await page.locator('#chatbot-send').click();
  await page.waitForFunction(
    (before) => !document.querySelector('#typing-indicator')
      && document.querySelectorAll('#chatbot-messages .chat-message.bot').length > before,
    messageCountBefore,
    { timeout: 5000 }
  );

  return (await botMessages.last().innerText()).trim();
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

    await desktopTrigger.click();
    await desktop.locator('#chatbot-window.active').waitFor({ state: 'visible', timeout: 5000 });
    assert.equal(await desktop.locator('.chatbot-suggestions').count(), 1);
    assert.equal(await desktop.locator('.chatbot-suggestion').count(), 3);
    assert.equal(await desktop.locator('.chatbot-suggestions').getAttribute('role'), 'group');
    const firstSuggestion = await desktop.locator('.chatbot-suggestion').first().innerText();
    const botCountBeforeSuggestion = await desktop.locator('#chatbot-messages .chat-message.bot').count();
    await desktop.locator('.chatbot-suggestion').first().click();
    await desktop.waitForFunction(
      (before) => !document.querySelector('#typing-indicator')
        && document.querySelectorAll('#chatbot-messages .chat-message.bot').length > before,
      botCountBeforeSuggestion,
      { timeout: 5000 }
    );
    assert.equal(await desktop.locator('#chatbot-input').inputValue(), '');
    assert.equal(await desktop.locator('#chatbot-messages .chat-message.user').last().innerText(), firstSuggestion);

    const integrationPrice = await askChatbot(desktop, 'ile kosztuje integracja API');
    assert.match(integrationPrice, /400 PLN/);
    assert.match(integrationPrice, /integracj|API/i);
    assert.equal(await desktop.locator('.chatbot-suggestions').count(), 1);

    const performanceQuestion = await askChatbot(desktop, 'moja strona wolno się ładuje');
    assert.match(performanceQuestion, /800 PLN/);
    assert.match(performanceQuestion, /optymaliz|PageSpeed|LCP|INP|CLS/i);

    const auditQuestion = await askChatbot(desktop, 'audyt strony internetowej');
    assert.match(auditQuestion, /300 PLN/);
    assert.match(auditQuestion, /stron|aplikac/i);

    const n8nQuestion = await askChatbot(desktop, 'czy wdrażasz n8n');
    assert.match(n8nQuestion, /n8n/i);
    assert.match(n8nQuestion, /400 PLN/);

    const invoiceQuestion = await askChatbot(desktop, 'czy wystawiasz fakturę VAT');
    assert.match(invoiceQuestion, /VAT/i);

    const coreVitalsQuestion = await askChatbot(desktop, 'Core Web Vitals');
    assert.match(coreVitalsQuestion, /LCP/);
    assert.match(coreVitalsQuestion, /INP/);
    assert.match(coreVitalsQuestion, /CLS/);

    const helloQuestion = await askChatbot(desktop, 'hello');
    assert.doesNotMatch(helloQuestion, /Error 406|wulg/i);
    assert.match(helloQuestion, /DominDev|system|terminal|cennik|portfolio/i);

    const rodoQuestion = await askChatbot(desktop, 'RODO');
    assert.match(rodoQuestion, /RODO|GDPR/);

    const botCountBeforeBurst = await desktop.locator('#chatbot-messages .chat-message.bot').count();
    await desktop.locator('#chatbot-input').fill('cennik');
    await desktop.locator('#chatbot-send').click();
    await desktop.waitForTimeout(600);
    await desktop.locator('#chatbot-input').fill('usługi');
    await desktop.locator('#chatbot-send').click();
    await desktop.waitForFunction(
      (before) => !document.querySelector('#typing-indicator')
        && document.querySelectorAll('#chatbot-messages .chat-message.bot').length > before + 1,
      botCountBeforeBurst,
      { timeout: 5000 }
    );
    assert.equal(await desktop.locator('#typing-indicator').count(), 0);

    await desktop.locator('#chatbot-close').click();
    await desktop.locator('#chatbot-window.active').waitFor({ state: 'hidden' });

    const serviceContext = await loadPage(browser, { width: 1440, height: 900 }, '/aplikacje-webowe-wroclaw.html');
    const servicePage = serviceContext.page;
    await servicePage.locator('#chatbot-trigger').click();
    await servicePage.locator('#chatbot-window.active').waitFor({ state: 'visible', timeout: 5000 });
    const portfolioQuestion = await askChatbot(servicePage, 'jakie masz realizacje');
    assert.match(portfolioQuestion, /realizac|portfolio/i);
    assert.equal(await servicePage.locator('#chatbot-messages .chat-message.bot').last().locator('a[href="/#portfolio"]').count(), 1);
    await servicePage.locator('#chatbot-close').click();
    await servicePage.locator('#chatbot-window.active').waitFor({ state: 'hidden' });
    await servicePage.close();
    assert.deepEqual(serviceContext.errors, []);

    const failureContext = await loadPage(browser, { width: 1440, height: 900 });
    const failurePage = failureContext.page;
    await failurePage.route('**/data/chatbot-db.json', (route) => route.abort());
    await failurePage.locator('#chatbot-trigger').click();
    await failurePage.locator('#chatbot-window.active').waitFor({ state: 'visible', timeout: 5000 });
    const failedResponse = await askChatbot(failurePage, 'usługi');
    assert.match(failedResponse, /nie udało się wczytać|odświeżyć|napisz ponownie/i);
    await failurePage.waitForTimeout(600);
    const failedSecondResponse = await askChatbot(failurePage, 'cennik');
    assert.match(failedSecondResponse, /nie udało się wczytać|odświeżyć|napisz ponownie/i);
    assert.equal(await failurePage.locator('#typing-indicator').count(), 0);
    await failurePage.close();
    assert.deepEqual(failureContext.errors, []);

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
