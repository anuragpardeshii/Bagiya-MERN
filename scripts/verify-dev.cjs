// Reversible probes against this checkout's own running development stack.
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('@playwright/test');
require('../backend/node_modules/dotenv').config();
const base =
  process.env.DEV_WEB_URL || `http://localhost:${process.env.WEB_PORT || 5173}`;
async function until(check) {
  for (let i = 0; i < 60; i++) {
    if (await check()) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error('Hot reload did not complete within 30 seconds');
}
(async () => {
  const apiPath = path.resolve('backend/app.js'),
    webPath = path.resolve('frontend/src/Home/Home.jsx');
  const apiOriginal = await fs.readFile(apiPath, 'utf8'),
    webOriginal = await fs.readFile(webPath, 'utf8');
  if (
    !apiOriginal.includes('app.use(helmet());') ||
    !webOriginal.includes('Find your focus.')
  )
    throw new Error('Probe source anchor changed; update verification script');
  let browser;
  try {
    await fs.writeFile(
      apiPath,
      apiOriginal.replace(
        'app.use(helmet());',
        "app.use(helmet());\n  app.get('/api/hot-reload-probe', (req, res) => res.json({probe: true}));",
      ),
    );
    await until(async () => {
      try {
        return (await fetch(`${base}/api/hot-reload-probe`)).ok;
      } catch {
        return false;
      }
    });
    console.log(
      'PASS backend watch reload served a newly added endpoint without a container rebuild',
    );
    await fs.writeFile(apiPath, apiOriginal);
    await until(async () => {
      try {
        return (await fetch(`${base}/api/hot-reload-probe`)).status === 401;
      } catch {
        return false;
      }
    });
    browser = await chromium.launch(
      process.env.PLAYWRIGHT_EXECUTABLE_PATH
        ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
        : {},
    );
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
    });
    await page.goto(base);
    await page.getByRole('heading', { name: /Find your focus/ }).waitFor();
    await fs.writeFile(
      webPath,
      webOriginal.replace('Find your focus.', 'Focus hot reload verified.'),
    );
    await page
      .getByRole('heading', { name: /Focus hot reload verified/ })
      .waitFor();
    console.log(
      'PASS Vite HMR updated the already-open browser without a navigation or rebuild',
    );
    await fs.writeFile(webPath, webOriginal);
    await page.getByRole('heading', { name: /Find your focus/ }).waitFor();
    await page.screenshot({
      path: 'docs/screenshots/landing-desktop.png',
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: 'docs/screenshots/landing-mobile.png',
      fullPage: true,
    });
  } finally {
    await fs.writeFile(apiPath, apiOriginal);
    await fs.writeFile(webPath, webOriginal);
    if (browser) await browser.close();
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
