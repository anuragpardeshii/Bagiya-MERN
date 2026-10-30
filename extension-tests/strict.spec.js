const { test, expect, chromium } = require('@playwright/test');
const { MongoClient, ObjectId } = require('../backend/node_modules/mongodb');
const path = require('node:path');
const fs = require('node:fs/promises');
const os = require('node:os');

test('real extension connects, permits approved pages, interrupts other pages, verifies rewards and detects a monitoring gap', async () => {
  const uri = process.env.E2E_TEST_MONGO_URI;
  if (!uri || !new URL(uri).pathname.startsWith('/bagiya_test_'))
    throw new Error('Use an isolated bagiya_test_* database');
  const origin = process.env.E2E_BASE_URL || 'http://localhost:5181';
  const client = new MongoClient(uri);
  await client.connect();
  const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'bagiya-extension-'));
  const extension = path.resolve(__dirname, '../extension');
  const context = await chromium.launchPersistentContext(profile, {
    headless: true,
    channel: 'chromium',
    ...(process.env.EXTENSION_CHROMIUM_PATH
      ? { executablePath: process.env.EXTENSION_CHROMIUM_PATH }
      : {}),
    args: [
      `--disable-extensions-except=${extension}`,
      `--load-extension=${extension}`,
    ],
    viewport: { width: 1440, height: 1000 },
  });
  try {
    let [worker] = context.serviceWorkers();
    if (!worker) worker = await context.waitForEvent('serviceworker');
    const extensionId = new URL(worker.url()).host;
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.getByLabel('Your Bagiya address').fill(origin);
    const opened = context.waitForEvent('page');
    await popup.getByRole('button', { name: 'Connect to Bagiya' }).click();
    const page = await opened;
    await page.waitForLoadState();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const username = `strict${Date.now()}`;
    const headers = { 'X-Bagiya-Request': '1' };
    const signup = await page.request.post(`${origin}/api/auth/signup`, {
      headers,
      data: {
        name: 'Strict Gardener',
        username,
        email: `${username}@example.test`,
        phone: '1234567890',
        password: 'A-long-test-password',
      },
    });
    expect(signup.status()).toBe(201);
    const login = await page.request.post(`${origin}/api/auth/login`, {
      headers,
      data: { identifier: username, password: 'A-long-test-password' },
    });
    expect(login.ok()).toBeTruthy();
    const userId = new ObjectId((await login.json()).user.id);
    await context.route('http://127.0.0.1:5182/**', (route) =>
      route.fulfill({
        contentType: 'text/html',
        body: '<h1>Browser test lesson</h1>',
      }),
    );
    await page.goto(`${origin}/timer`);
    await page.getByRole('checkbox', { name: /Strict focus/ }).check();
    await expect(
      page.getByText('Extension connected · ready to focus'),
    ).toBeVisible();
    await page
      .getByLabel('Allowed websites', { exact: true })
      .fill('http://127.0.0.1:5182/lesson');
    await page.getByLabel('Custom duration in minutes').fill('5');
    await page.screenshot({
      path: 'docs/screenshots/strict-focus-setup.png',
      fullPage: true,
    });
    await page
      .getByRole('button', { name: 'Start focusing', exact: true })
      .click();
    await expect(
      page.getByText('Strict focus is on', { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Take a breath' }),
    ).toHaveCount(0);
    const first = await client
      .db()
      .collection('sessions')
      .findOne({ userId, active: true });
    expect(first.strictMode).toBe(true);
    const active = await (
      await page.request.get(`${origin}/api/sessions/active`)
    ).json();
    expect(active.session.monitorTokenHash).toBeUndefined();
    const lessonOpened = context.waitForEvent('page');
    await page
      .getByRole('link', { name: 'http://127.0.0.1:5182/lesson', exact: true })
      .click();
    const lesson = await lessonOpened;
    await lesson.waitForURL('http://127.0.0.1:5182/lesson');
    await expect(lesson.getByRole('heading')).toHaveText('Browser test lesson');
    // Run the same checker used by alarms, without waiting 30 seconds in the test.
    await worker.evaluate(() => check());
    expect(
      (await client.db().collection('sessions').findOne({ _id: first._id }))
        .active,
    ).toBe(true);
    await lesson.goto('http://127.0.0.1:5182/distraction');
    await expect
      .poll(
        async () =>
          (await client.db().collection('sessions').findOne({ _id: first._id }))
            .interruptionReason,
      )
      .toBe('outside-allowlist');
    await page.bringToFront();
    await lesson.close();
    await page.reload();
    await expect(
      page.getByText(/An unapproved website interrupted/),
    ).toBeVisible();
    await expect(
      page.getByRole('img', { name: 'Withered tree — session ended early' }),
    ).toBeVisible();
    expect(
      (await client.db().collection('users').findOne({ _id: userId })).wallet
        .balance,
    ).toBe(10);

    // Inject a failed worker network boundary, then restore real networking.
    // The visit must remain a violation even after returning to Bagiya.
    await page.getByRole('checkbox', { name: /Strict focus/ }).check();
    await expect(
      page.getByText('Extension connected · ready to focus'),
    ).toBeVisible();
    await page
      .getByRole('button', { name: 'Start focusing', exact: true })
      .click();
    await expect(
      page.getByText('Strict focus is on', { exact: true }),
    ).toBeVisible();
    const offline = await client
      .db()
      .collection('sessions')
      .findOne({ userId, active: true });
    await worker.evaluate(() => {
      globalThis.originalFetch = globalThis.fetch;
      globalThis.fetch = () =>
        Promise.reject(new Error('Injected network outage'));
    });
    const distraction = await context.newPage();
    await distraction.goto('http://127.0.0.1:5182/distraction');
    await expect
      .poll(() =>
        worker.evaluate(
          async () =>
            (await chrome.storage.local.get('monitor')).monitor?.violation,
        ),
      )
      .toBe('outside-allowlist');
    expect(
      (await client.db().collection('sessions').findOne({ _id: offline._id }))
        .active,
    ).toBe(true);
    await page.bringToFront();
    await distraction.close();
    await worker.evaluate(async () => {
      globalThis.fetch = globalThis.originalFetch;
      delete globalThis.originalFetch;
      await check();
    });
    await expect(
      page.getByText(/An unapproved website interrupted/),
    ).toBeVisible();
    expect(
      (await client.db().collection('sessions').findOne({ _id: offline._id }))
        .interruptionReason,
    ).toBe('outside-allowlist');
    expect(
      (await client.db().collection('users').findOne({ _id: userId })).wallet
        .balance,
    ).toBe(10);

    await page.getByRole('checkbox', { name: /Strict focus/ }).check();
    await expect(
      page.getByText('Extension connected · ready to focus'),
    ).toBeVisible();
    await page.getByLabel('Custom duration in minutes').fill('5');
    await page
      .getByRole('button', { name: 'Start focusing', exact: true })
      .click();
    await expect(
      page.getByText('Strict focus is on', { exact: true }),
    ).toBeVisible();
    const second = await client
      .db()
      .collection('sessions')
      .findOne({ userId, active: true });
    await client
      .db()
      .collection('sessions')
      .updateOne(
        { _id: second._id },
        { $set: { resumedAt: new Date(Date.now() - 301000) } },
      );
    // Exercise the real finish-alarm handler; it must bypass ordinary heartbeat throttling.
    expect(
      await worker.evaluate(() => chrome.alarms.get('bagiya-finish')),
    ).toBeTruthy();
    await worker.evaluate(() =>
      chrome.alarms.create('bagiya-finish', { when: Date.now() + 100 }),
    );
    await expect(
      page.getByText('500 coins added to your garden.'),
    ).toBeVisible();
    expect(
      (await client.db().collection('users').findOne({ _id: userId })).wallet
        .balance,
    ).toBe(510);
    expect(
      await client
        .db()
        .collection('transactions')
        .countDocuments({ user: userId, requestId: `focus:${second._id}` }),
    ).toBe(1);

    await page
      .getByRole('button', { name: 'Start focusing', exact: true })
      .click();
    await expect(
      page.getByText('Strict focus is on', { exact: true }),
    ).toBeVisible();
    const third = await client
      .db()
      .collection('sessions')
      .findOne({ userId, active: true });
    // Model a suspended computer: both elapsed timer and monitoring deadline have passed.
    await client
      .db()
      .collection('sessions')
      .updateOne(
        { _id: third._id },
        {
          $set: {
            resumedAt: new Date(Date.now() - 301000),
            strictDeadline: new Date(Date.now() - 1000),
          },
        },
      );
    await worker.evaluate(async () => {
      const { monitor } = await chrome.storage.local.get('monitor');
      monitor.lastCheckAt = Date.now() - 100000;
      await chrome.storage.local.set({ monitor });
      await check();
    });
    await expect(
      page.getByText(/Monitoring stopped for too long/),
    ).toBeVisible();
    expect(
      (await client.db().collection('sessions').findOne({ _id: third._id }))
        .sessionSuccess,
    ).toBe(false);
    expect(
      (await client.db().collection('users').findOne({ _id: userId })).wallet
        .balance,
    ).toBe(510);
    await page.screenshot({
      path: 'docs/screenshots/strict-focus-interrupted.png',
      fullPage: true,
    });
    expect(errors).toEqual([]);
  } finally {
    await context.close();
    await client.close();
    await fs.rm(profile, { recursive: true, force: true });
  }
});
