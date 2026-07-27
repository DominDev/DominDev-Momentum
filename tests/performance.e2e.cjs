const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const baseUrl = process.env.APP_URL || 'http://127.0.0.1:8788';
const budgets = {
  '/': {
    requests: 55,
    totalBytes: 2_500_000,
    scriptBytes: 250_000,
    styleBytes: 180_000,
    fcp: 3_000,
    lcp: 4_000,
    cls: 0.1,
    blockingTime: 300,
  },
  '/strony-wordpress-wroclaw': {
    requests: 55,
    totalBytes: 2_500_000,
    scriptBytes: 250_000,
    styleBytes: 180_000,
    fcp: 3_000,
    lcp: 4_000,
    cls: 0.1,
    blockingTime: 300,
  },
  '/aplikacje-webowe-wroclaw': {
    requests: 55,
    totalBytes: 2_500_000,
    scriptBytes: 250_000,
    styleBytes: 180_000,
    fcp: 3_000,
    lcp: 4_000,
    cls: 0.1,
    blockingTime: 300,
  },
};

async function collect(page, path) {
  await page.addInitScript(() => {
    window.__qualityMetrics = { cls: 0, lcp: 0, blockingTime: 0 };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) window.__qualityMetrics.cls += entry.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      if (entries.length) window.__qualityMetrics.lcp = entries.at(-1).startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__qualityMetrics.blockingTime += Math.max(0, entry.duration - 50);
      }
    }).observe({ type: 'longtask', buffered: true });
  });

  await page.route('**/*', async (route) => {
    const requestUrl = new URL(route.request().url());
    const pageUrl = new URL(baseUrl);
    if (requestUrl.origin !== pageUrl.origin) return route.abort();
    return route.continue();
  });

  await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
  const preloader = page.locator('#preloader');
  if (await preloader.count()) {
    await page.waitForFunction(
      () => document.querySelector('#preloader')?.style.display === 'none',
      null,
      { timeout: 15_000 },
    );
  }
  await page.waitForTimeout(500);

  return page.evaluate(() => {
    const resources = performance
      .getEntriesByType('resource')
      .filter((entry) => new URL(entry.name).origin === location.origin);
    const bytesFor = (type) => resources
      .filter((entry) => entry.initiatorType === type)
      .reduce((sum, entry) => sum + (entry.transferSize || entry.encodedBodySize || 0), 0);
    const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0;

    return {
      requests: resources.length + 1,
      totalBytes: resources.reduce(
        (sum, entry) => sum + (entry.transferSize || entry.encodedBodySize || 0),
        0,
      ),
      scriptBytes: bytesFor('script'),
      styleBytes: bytesFor('link') + bytesFor('css'),
      fcp,
      lcp: window.__qualityMetrics.lcp,
      cls: window.__qualityMetrics.cls,
      blockingTime: window.__qualityMetrics.blockingTime,
    };
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const failures = [];

  try {
    for (const [path, limits] of Object.entries(budgets)) {
      const page = await browser.newPage({
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 1,
      });
      const metrics = await collect(page, path);
      console.log(`${path}: ${JSON.stringify(metrics)}`);

      for (const [metric, limit] of Object.entries(limits)) {
        if (metrics[metric] > limit) {
          failures.push(`${path} ${metric}: ${metrics[metric]} > ${limit}`);
        }
      }

      await page.close();
    }

    assert.deepEqual(failures, [], failures.join('\n'));
    console.log('Performance budgets passed for 3 representative mobile pages.');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error);
  process.exit(1);
});
