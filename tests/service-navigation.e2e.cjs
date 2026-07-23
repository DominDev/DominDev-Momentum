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

async function assertLiveServicesListedAsAvailable(page) {
  const desktopAvailable =
    '#services-dropdown .services-dropdown__status:not(.services-dropdown__status--pending) + .services-dropdown__list';
  const desktopPending =
    '#services-dropdown .services-dropdown__status--pending + .services-dropdown__list';
  const mobileAvailable =
    '#mobile-services-panel .mobile-services-panel__status:not(.mobile-services-panel__status--pending) + .mobile-services-list';
  const mobilePending =
    '#mobile-services-panel .mobile-services-panel__status--pending + .mobile-services-list';

  for (const path of [
    '[href="/aplikacje-webowe-wroclaw"]',
    '[href="/optymalizacja-i-ratunek-wroclaw"]',
  ]) {
    assert.equal(await page.locator(`${desktopAvailable} ${path}`).count(), 1);
    assert.equal(await page.locator(`${desktopPending} ${path}`).count(), 0);
    assert.equal(await page.locator(`${mobileAvailable} ${path}`).count(), 1);
    assert.equal(await page.locator(`${mobilePending} ${path}`).count(), 0);
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];

  try {
    const desktop = await loadPage(browser, '/', { width: 1440, height: 900 }, errors);

    await assertLiveServicesListedAsAvailable(desktop);
    assert.equal(await desktop.locator('#services-menu-trigger').count(), 1);
    assert.equal(await desktop.locator('#services-dropdown').count(), 1);
    assert.equal(await desktop.locator('.nav-services__overview').getAttribute('href'), '#services');
    assert.equal(await desktop.getByText('Buduj Markę', { exact: true }).count(), 1);
    assert.equal(
      await desktop.locator('#services-dropdown a[href="/strony-wordpress-wroclaw"]').count(),
      1
    );
    assert.equal(
      await desktop.locator('#services-dropdown a[href="/landing-page-wroclaw"]').count(),
      1
    );
    assert.equal(
      await desktop.locator('#services-dropdown a[href="/sklepy-woocommerce-wroclaw"]').count(),
      1
    );
    assert.equal(await desktop.locator('#services-dropdown a[href="/aplikacje-webowe-wroclaw"]').count(), 1);
    assert.equal(await desktop.locator('#services-dropdown a[href="/maintenance.html"]').count(), 1);
    assert.match(
      await desktop.locator('script[type="module"]').getAttribute('src'),
      /js\/main\.js\?v=/
    );
    assert.match(
      await desktop.locator('link[rel="stylesheet"][href*="style.min.css"]').getAttribute('href'),
      /style\.min\.css\?v=/
    );

    await desktop.locator('#services-menu-trigger').click();
    assert.equal(await desktop.locator('#services-menu-trigger').getAttribute('aria-expanded'), 'true');
    assert.equal(await desktop.locator('#services-dropdown').isVisible(), true);
    await desktop.locator('#services-menu-trigger').click();
    assert.equal(await desktop.locator('#services-menu-trigger').getAttribute('aria-expanded'), 'false');

    await desktop.locator('#services-menu-trigger').focus();
    await desktop.keyboard.press('Enter');
    assert.equal(await desktop.locator('#services-menu-trigger').getAttribute('aria-expanded'), 'true');
    assert.equal(await desktop.locator('#services-dropdown').isVisible(), true);
    await desktop.keyboard.press('Escape');
    assert.equal(await desktop.locator('#services-menu-trigger').getAttribute('aria-expanded'), 'false');
    assert.equal(await desktop.locator('#services-dropdown').isVisible(), false);

    const mobile = await loadPage(browser, '/', { width: 375, height: 667 }, errors);

    await mobile.evaluate(() => {
      const previousScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, 900);
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
    });
    await mobile.waitForFunction(() => Math.abs(window.scrollY - 900) < 1);
    const pageScrollBeforeMenu = await mobile.evaluate(() => window.scrollY);
    await mobile.locator('#hamburger-menu').focus();
    await mobile.keyboard.press('Enter');
    assert.equal(await mobile.locator('#hamburger-menu').getAttribute('aria-expanded'), 'true');
    await mobile.locator('#mobile-services-open').waitFor({ state: 'visible' });
    assert.equal(await mobile.locator('body').evaluate((element) => element.style.position), 'fixed');
    assert.equal(
      await mobile.locator('body').evaluate((element) => element.style.top),
      `-${pageScrollBeforeMenu}px`
    );
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
    const menuScrollBehavior = await mobile.locator('#fullscreen-menu').evaluate((element) => ({
      overflowY: getComputedStyle(element).overflowY,
      overscrollBehaviorY: getComputedStyle(element).overscrollBehaviorY,
      scrollHeight: element.scrollHeight,
      clientHeight: element.clientHeight,
    }));
    assert.equal(menuScrollBehavior.overflowY, 'auto');
    assert.equal(menuScrollBehavior.overscrollBehaviorY, 'contain');
    assert.ok(menuScrollBehavior.scrollHeight > menuScrollBehavior.clientHeight);
    const menuScrollTop = await mobile.locator('#fullscreen-menu').evaluate((element) => {
      const previousScrollBehavior = element.style.scrollBehavior;
      element.style.scrollBehavior = 'auto';
      element.scrollTop = 180;
      const scrollTop = element.scrollTop;
      element.style.scrollBehavior = previousScrollBehavior;
      return scrollTop;
    });
    assert.ok(menuScrollTop > 0);
    assert.equal(
      await mobile.locator('body').evaluate((element) => element.style.top),
      `-${pageScrollBeforeMenu}px`
    );
    const mobileSocialHudClearance = await mobile.locator('#fullscreen-menu').evaluate((element) => {
      const previousScrollBehavior = element.style.scrollBehavior;
      element.style.scrollBehavior = 'auto';
      element.scrollTop = element.scrollHeight;
      const social = document.querySelector('.menu-social').getBoundingClientRect();
      const hud = document.querySelector('.system-bar').getBoundingClientRect();
      element.style.scrollBehavior = previousScrollBehavior;

      return hud.top - social.bottom;
    });
    assert.ok(mobileSocialHudClearance >= 16);
    const mobileOverviewLayout = await mobile.locator('.mobile-services-nav__overview').evaluate((element) => {
      const row = element.closest('.mobile-services-nav__row').getBoundingClientRect();
      const link = element.getBoundingClientRect();
      const processLink = document.querySelector('#mobile-menu-main a[href="#process"]');

      return {
        isCentered: Math.abs(link.left + link.width / 2 - (row.left + row.width / 2)) < 1,
        matchesMenuFont: getComputedStyle(element).fontFamily === getComputedStyle(processLink).fontFamily,
        matchesMenuSize: getComputedStyle(element).fontSize === getComputedStyle(processLink).fontSize,
        buttonGapIsCompact: (() => {
          const gap = document.querySelector('#mobile-services-open').getBoundingClientRect().left - link.right;
          return gap >= 8 && gap <= 16;
        })(),
        buttonHasNoBorder: getComputedStyle(document.querySelector('#mobile-services-open')).borderTopWidth === '0px',
      };
    });
    assert.deepEqual(mobileOverviewLayout, {
      isCentered: true,
      matchesMenuFont: true,
      matchesMenuSize: true,
      buttonGapIsCompact: true,
      buttonHasNoBorder: true,
    });
    const mobileSocialCentering = await mobile.locator('.menu-social').evaluate((element) => {
      const links = Array.from(element.querySelectorAll('.social-link'));
      const first = links[0].getBoundingClientRect();
      const last = links.at(-1).getBoundingClientRect();
      const menu = document.querySelector('#mobile-menu-main').getBoundingClientRect();
      const linksCenter = first.left + (last.right - first.left) / 2;

      return Math.abs(linksCenter - (menu.left + menu.width / 2)) < 1;
    });
    assert.equal(mobileSocialCentering, true);
    assert.equal(
      await mobile.locator('#mobile-services-open').getAttribute('aria-label'),
      'Zwiń listę usług'
    );
    assert.equal(
      await mobile.locator('#mobile-services-panel a[href="/landing-page-wroclaw"]').count(),
      1
    );
    assert.equal(
      await mobile.locator('#mobile-services-panel a[href="/sklepy-woocommerce-wroclaw"]').count(),
      1
    );
    assert.equal(await mobile.locator('#mobile-services-panel a[href="/aplikacje-webowe-wroclaw"]').count(), 1);
    assert.equal(await mobile.locator('#mobile-services-panel a[href="/maintenance.html"]').count(), 1);
    await mobile.keyboard.press('Escape');
    assert.equal(await mobile.locator('#mobile-services-panel').isVisible(), false);
    assert.equal(await mobile.locator('#mobile-services-open').getAttribute('aria-expanded'), 'false');

    await mobile.keyboard.press('Enter');
    assert.equal(await mobile.locator('#mobile-services-panel').isVisible(), true);
    await mobile.keyboard.press('Enter');
    assert.equal(await mobile.locator('#mobile-services-panel').isVisible(), false);
    await mobile.locator('#hamburger-menu').click();
    await mobile.waitForFunction(
      (scrollY) => Math.abs(window.scrollY - scrollY) < 1,
      pageScrollBeforeMenu
    );
    assert.equal(await mobile.locator('body').evaluate((element) => element.style.position), '');

    const landing = await loadPage(
      browser,
      '/strony-wordpress-wroclaw.html',
      { width: 1440, height: 900 },
      errors
    );

    await assertLiveServicesListedAsAvailable(landing);
    assert.equal(await landing.locator('#services-menu-trigger').count(), 1);
    assert.equal(await landing.locator('#services-dropdown').count(), 1);
    assert.equal(await landing.locator('.nav-services__overview').getAttribute('href'), '/#services');
    await landing.locator('#services-menu-trigger').focus();
    await landing.keyboard.press('Enter');
    assert.equal(await landing.locator('#services-dropdown').isVisible(), true);
    assert.equal(
      await landing.locator('#services-dropdown a[href="/landing-page-wroclaw"]').count(),
      1
    );
    assert.equal(
      await landing.locator('#services-dropdown a[href="/sklepy-woocommerce-wroclaw"]').count(),
      1
    );
    assert.equal(await landing.locator('#services-dropdown a[href="/aplikacje-webowe-wroclaw"]').count(), 1);
    assert.equal(await landing.locator('#services-dropdown a[href="/maintenance.html"]').count(), 1);
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
    const landscapeSocialHudClearance = await landingMobile.locator('#fullscreen-menu').evaluate((element) => {
      const previousScrollBehavior = element.style.scrollBehavior;
      element.style.scrollBehavior = 'auto';
      element.scrollTop = element.scrollHeight;
      const social = document.querySelector('.menu-social').getBoundingClientRect();
      const hud = document.querySelector('.system-bar').getBoundingClientRect();
      element.style.scrollBehavior = previousScrollBehavior;

      return hud.top - social.bottom;
    });
    assert.ok(landscapeSocialHudClearance >= 16);
    assert.equal(
      await landingMobile.locator('#mobile-services-panel a[href="/sklepy-woocommerce-wroclaw"]').count(),
      1
    );
    assert.equal(
      await landingMobile.locator('#mobile-services-panel a[href="/maintenance.html"]').count(),
      1
    );

    const landingPage = await loadPage(
      browser,
      '/landing-page-wroclaw.html',
      { width: 1440, height: 900 },
      errors
    );

    await assertLiveServicesListedAsAvailable(landingPage);
    assert.equal(await landingPage.locator('h1').count(), 1);
    assert.equal(
      await landingPage.locator('h1').textContent(),
      'Landing page,który prowadzi do działania.'
    );
    assert.equal(
      await landingPage.locator('link[rel="canonical"]').getAttribute('href'),
      'https://domindev.com/landing-page-wroclaw'
    );
    assert.equal(await landingPage.locator('link[href*="landing-page.min.css"]').count(), 1);
    assert.equal(await landingPage.locator('#services-dropdown a[href="/landing-page-wroclaw"]').count(), 1);
    assert.equal(
      await landingPage.locator('#services-dropdown a[href="/sklepy-woocommerce-wroclaw"]').count(),
      1
    );
    assert.equal(await landingPage.locator('#services-dropdown a[href="/aplikacje-webowe-wroclaw"]').count(), 1);
    assert.equal(await landingPage.locator('#services-dropdown a[href="/maintenance.html"]').count(), 1);
    const landingIconFontLoaded = await landingPage.evaluate(async () => {
      await document.fonts.ready;
      return document.fonts.check('900 16px "Font Awesome 6 Free"', '\uf036\uf140\uf201\uf017\uf15c\uf5ae');
    });
    assert.equal(landingIconFontLoaded, true);
    const landingDeliverableIcons = await landingPage.locator('.landing-deliverable i').evaluateAll((icons) =>
      icons.map((icon) => {
        const pseudo = getComputedStyle(icon, '::before');
        return {
          className: icon.className,
          content: pseudo.content,
          width: icon.getBoundingClientRect().width,
          fontFamily: getComputedStyle(icon).fontFamily,
        };
      })
    );
    assert.equal(landingDeliverableIcons.length, 5);
    for (const icon of landingDeliverableIcons) {
      assert.notEqual(icon.content, 'none');
      assert.ok(icon.width > 0);
      assert.match(icon.fontFamily, /Font Awesome 6 Free/);
    }
    await landingPage.locator('#services-menu-trigger').click();
    assert.equal(await landingPage.locator('#services-dropdown').isVisible(), true);
    await landingPage.locator('#services-menu-trigger').click();
    await landingPage.locator('a[data-action="prefill"][data-service="landing"]').first().click();
    await landingPage.locator('#contact-panel').waitFor({ state: 'visible' });
    assert.equal(await landingPage.locator('#contact-panel').getAttribute('aria-hidden'), 'false');
    assert.equal(await landingPage.locator('#panel-service').inputValue(), 'landing');
    assert.equal(await landingPage.locator('#panel-budget').inputValue(), '1500');
    await landingPage.locator('#contact-close-btn').click();

    const landingPageMobile = await loadPage(
      browser,
      '/landing-page-wroclaw.html',
      { width: 375, height: 667 },
      errors
    );
    await landingPageMobile.locator('#hamburger-menu').click();
    await landingPageMobile.locator('#mobile-services-open').click();
    await landingPageMobile.locator('#mobile-services-panel').waitFor({ state: 'visible' });
    assert.equal(
      await landingPageMobile.locator('#mobile-services-panel a[href="/landing-page-wroclaw"]').count(),
      1
    );
    assert.equal(
      await landingPageMobile.locator('#mobile-services-panel a[href="/sklepy-woocommerce-wroclaw"]').count(),
      1
    );
    assert.equal(await landingPageMobile.locator('#mobile-services-panel a[href="/maintenance.html"]').count(), 1);
    await landingPageMobile.locator('#hamburger-menu').click();
    await landingPageMobile.locator('#portfolio').scrollIntoViewIfNeeded();
    await landingPageMobile.waitForTimeout(300);
    const mobileCaseResultLayout = await landingPageMobile.locator('.case-result').evaluate((element) => {
      const result = element.getBoundingClientRect();
      const copy = element.querySelector('.case-result__copy').getBoundingClientRect();
      return {
        pageDoesNotOverflow: document.documentElement.scrollWidth <= window.innerWidth,
        resultFitsViewport: result.left >= 0 && result.right <= window.innerWidth,
        copyFitsResult: copy.left >= result.left && copy.right <= result.right,
      };
    });
    assert.deepEqual(mobileCaseResultLayout, {
      pageDoesNotOverflow: true,
      resultFitsViewport: true,
      copyFitsResult: true,
    });

    const wooCommercePage = await loadPage(
      browser,
      '/sklepy-woocommerce-wroclaw.html',
      { width: 1440, height: 900 },
      errors
    );

    await assertLiveServicesListedAsAvailable(wooCommercePage);
    assert.equal(await wooCommercePage.locator('h1').count(), 1);
    assert.equal(
      await wooCommercePage.locator('h1').textContent(),
      'Sklep WooCommerce,który prowadzi do zakupu.'
    );
    assert.equal(
      await wooCommercePage.locator('link[rel="canonical"]').getAttribute('href'),
      'https://domindev.com/sklepy-woocommerce-wroclaw'
    );
    assert.equal(await wooCommercePage.locator('link[href*="landing-page.min.css"]').count(), 1);
    assert.equal(
      await wooCommercePage.locator('#services-dropdown a[href="/sklepy-woocommerce-wroclaw"]').count(),
      1
    );
    assert.equal(await wooCommercePage.locator('#services-dropdown a[href="/aplikacje-webowe-wroclaw"]').count(), 1);
    assert.equal(await wooCommercePage.locator('#services-dropdown a[href="/maintenance.html"]').count(), 1);
    assert.equal(await wooCommercePage.locator('.landing-deliverable').count(), 5);
    await wooCommercePage.locator('a[data-action="prefill"][data-service="ecommerce"]').first().click();
    await wooCommercePage.locator('#contact-panel').waitFor({ state: 'visible' });
    assert.equal(await wooCommercePage.locator('#contact-panel').getAttribute('aria-hidden'), 'false');
    assert.equal(await wooCommercePage.locator('#panel-service').inputValue(), 'ecommerce');
    assert.equal(await wooCommercePage.locator('#panel-budget').inputValue(), '6000');
    await wooCommercePage.locator('#contact-close-btn').click();

    const wooCommercePageMobile = await loadPage(
      browser,
      '/sklepy-woocommerce-wroclaw.html',
      { width: 375, height: 667 },
      errors
    );
    await wooCommercePageMobile.locator('#hamburger-menu').click();
    await wooCommercePageMobile.locator('#mobile-services-open').click();
    await wooCommercePageMobile.locator('#mobile-services-panel').waitFor({ state: 'visible' });
    assert.equal(
      await wooCommercePageMobile.locator('#mobile-services-panel a[href="/sklepy-woocommerce-wroclaw"]').count(),
      1
    );
    assert.equal(
      await wooCommercePageMobile.locator('#mobile-services-panel a[href="/maintenance.html"]').count(),
      1
    );
    await wooCommercePageMobile.locator('#hamburger-menu').click();
    await wooCommercePageMobile.locator('#architecture').scrollIntoViewIfNeeded();
    await wooCommercePageMobile.waitForTimeout(300);
    const mobileArchitectureLayout = await wooCommercePageMobile.locator('.case-result').evaluate((element) => {
      const result = element.getBoundingClientRect();
      const copy = element.querySelector('.case-result__copy').getBoundingClientRect();
      const media = document.querySelector('.woocommerce-page .case-study__media').getBoundingClientRect();
      const image = document.querySelector('.woocommerce-page .case-study__media img');
      return {
        pageDoesNotOverflow: document.documentElement.scrollWidth <= window.innerWidth,
        resultFitsViewport: result.left >= 0 && result.right <= window.innerWidth,
        copyFitsResult: copy.left >= result.left && copy.right <= result.right,
        imageUsesCroppedLandscapeFrame: media.height / media.width < 0.6,
        imageUsesObjectFitCover: getComputedStyle(image).objectFit === 'cover',
      };
    });
    assert.deepEqual(mobileArchitectureLayout, {
      pageDoesNotOverflow: true,
      resultFitsViewport: true,
      copyFitsResult: true,
      imageUsesCroppedLandscapeFrame: true,
      imageUsesObjectFitCover: true,
    });

    const webAppPage = await loadPage(
      browser,
      '/aplikacje-webowe-wroclaw.html',
      { width: 1440, height: 900 },
      errors
    );

    await assertLiveServicesListedAsAvailable(webAppPage);
    assert.equal(await webAppPage.locator('h1').count(), 1);
    assert.match((await webAppPage.locator('h1').textContent()).trim(), /^Aplikacja webowa,/);
    assert.equal(
      await webAppPage.locator('link[rel="canonical"]').getAttribute('href'),
      'https://domindev.com/aplikacje-webowe-wroclaw'
    );
    assert.equal(await webAppPage.locator('link[href*="landing-page.min.css"]').count(), 1);
    assert.equal(await webAppPage.locator('.tech-strip').count(), 1);
    assert.equal(await webAppPage.getByText('REACT', { exact: true }).count(), 2);
    assert.equal(
      await webAppPage.locator('#services-dropdown a[href="/aplikacje-webowe-wroclaw"]').count(),
      1
    );
    assert.equal(await webAppPage.locator('#services-dropdown a[href="/maintenance.html"]').count(), 1);
    assert.equal(await webAppPage.locator('.landing-deliverable').count(), 5);
    assert.equal(await webAppPage.locator('.timeline .timeline__line').count(), 1);
    assert.equal(await webAppPage.locator('.timeline .timeline__item').count(), 4);
    await webAppPage.locator('a[data-action="prefill"][data-service="webapp"]').first().click();
    await webAppPage.locator('#contact-panel').waitFor({ state: 'visible' });
    assert.equal(await webAppPage.locator('#panel-service').inputValue(), 'webapp');
    assert.equal(await webAppPage.locator('#panel-budget').inputValue(), '8000');
    await webAppPage.locator('#contact-close-btn').click();

    const webAppPageMobile = await loadPage(
      browser,
      '/aplikacje-webowe-wroclaw.html',
      { width: 375, height: 667 },
      errors
    );
    await webAppPageMobile.locator('#hamburger-menu').click();
    await webAppPageMobile.locator('#mobile-services-open').click();
    await webAppPageMobile.locator('#mobile-services-panel').waitFor({ state: 'visible' });
    assert.equal(
      await webAppPageMobile.locator('#mobile-services-panel a[href="/aplikacje-webowe-wroclaw"]').count(),
      1
    );
    assert.equal(await webAppPageMobile.locator('#mobile-services-panel a[href="/maintenance.html"]').count(), 1);
    await webAppPageMobile.locator('#hamburger-menu').click();
    await webAppPageMobile.locator('#architecture').scrollIntoViewIfNeeded();
    await webAppPageMobile.waitForTimeout(300);
    const webAppMobileLayout = await webAppPageMobile.locator('.case-result').evaluate((element) => {
      const result = element.getBoundingClientRect();
      const copy = element.querySelector('.case-result__copy').getBoundingClientRect();
      const media = document.querySelector('.webapp-page .case-study__media').getBoundingClientRect();
      const image = document.querySelector('.webapp-page .case-study__media img');
      return {
        pageDoesNotOverflow: document.documentElement.scrollWidth <= window.innerWidth,
        resultFitsViewport: result.left >= 0 && result.right <= window.innerWidth,
        copyFitsResult: copy.left >= result.left && copy.right <= result.right,
        imageUsesCroppedLandscapeFrame: media.height / media.width < 0.6,
        imageUsesObjectFitCover: getComputedStyle(image).objectFit === 'cover',
      };
    });
    assert.deepEqual(webAppMobileLayout, {
      pageDoesNotOverflow: true,
      resultFitsViewport: true,
      copyFitsResult: true,
      imageUsesCroppedLandscapeFrame: true,
      imageUsesObjectFitCover: true,
    });

    const recoveryPage = await loadPage(
      browser,
      '/optymalizacja-i-ratunek-wroclaw.html',
      { width: 1440, height: 900 },
      errors
    );

    await assertLiveServicesListedAsAvailable(recoveryPage);
    assert.equal(await recoveryPage.locator('h1').count(), 1);
    assert.match((await recoveryPage.locator('h1').textContent()).trim(), /^Strona lub aplikacja,/);
    assert.equal(
      await recoveryPage.locator('link[rel="canonical"]').getAttribute('href'),
      'https://domindev.com/optymalizacja-i-ratunek-wroclaw'
    );
    assert.equal(await recoveryPage.locator('link[href*="landing-page.min.css"]').count(), 1);
    assert.equal(await recoveryPage.locator('.tech-strip').count(), 1);
    assert.equal(await recoveryPage.getByText('AUDYT TECHNICZNY', { exact: true }).count(), 2);
    assert.equal(
      await recoveryPage.locator('#services-dropdown a[href="/optymalizacja-i-ratunek-wroclaw"]').count(),
      1
    );
    assert.equal(await recoveryPage.locator('#services-dropdown a[href="/maintenance.html"]').count(), 1);
    assert.equal(await recoveryPage.locator('.landing-deliverable').count(), 5);
    assert.equal(await recoveryPage.locator('.timeline .timeline__line').count(), 1);
    assert.equal(await recoveryPage.locator('.timeline .timeline__item').count(), 4);
    await recoveryPage.locator('a[data-action="prefill"][data-service="speed"]').first().click();
    await recoveryPage.locator('#contact-panel').waitFor({ state: 'visible' });
    assert.equal(await recoveryPage.locator('#panel-service').inputValue(), 'speed');
    assert.equal(await recoveryPage.locator('#panel-budget').inputValue(), '1000');
    await recoveryPage.locator('#contact-close-btn').click();

    const recoveryPageMobile = await loadPage(
      browser,
      '/optymalizacja-i-ratunek-wroclaw.html',
      { width: 375, height: 667 },
      errors
    );
    await recoveryPageMobile.locator('#hamburger-menu').click();
    await recoveryPageMobile.locator('#mobile-services-open').click();
    await recoveryPageMobile.locator('#mobile-services-panel').waitFor({ state: 'visible' });
    assert.equal(
      await recoveryPageMobile.locator('#mobile-services-panel a[href="/optymalizacja-i-ratunek-wroclaw"]').count(),
      1
    );
    assert.equal(await recoveryPageMobile.locator('#mobile-services-panel a[href="/maintenance.html"]').count(), 1);
    await recoveryPageMobile.locator('#hamburger-menu').click();
    await recoveryPageMobile.loc('#architecture').scrollIntoViewIfNeeded();
    await recoveryPageMobile.waitForTimeout(300);
    const recoveryMobileLayout = await recoveryPageMobile.locator('.case-result').evaluate((element) => {
      const result = element.getBoundingClientRect();
      const copy = element.querySelector('.case-result__copy').getBoundingClientRect();
      const media = document.querySelector('.recovery-page .case-study__media').getBoundingClientRect();
      return {
        pageDoesNotOverflow: document.documentElement.scrollWidth <= window.innerWidth,
        resultFitsViewport: result.left >= 0 && result.right <= window.innerWidth,
        copyFitsResult: copy.left >= result.left && copy.right <= result.right,
        mediaFitsViewport: media.left >= 0 && media.right <= window.innerWidth,
      };
    });
    assert.deepEqual(recoveryMobileLayout, {
      pageDoesNotOverflow: true,
      resultFitsViewport: true,
      copyFitsResult: true,
      mediaFitsViewport: true,
    });
    assert.deepEqual(errors, []);

    console.log('Service navigation browser checks passed.');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exit(1);
});
