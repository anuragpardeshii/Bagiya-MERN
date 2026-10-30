const { test, expect } = require('@playwright/test');
const { MongoClient, ObjectId } = require('../backend/node_modules/mongodb');
const headers = { 'X-Bagiya-Request': '1' };
const password = 'A-long-test-password';
const identifierLabel = 'Email, phone or username';
function testClient() {
  const uri = process.env.E2E_TEST_MONGO_URI;
  if (!uri || !new URL(uri).pathname.startsWith('/bagiya_test_'))
    throw new Error('Use an isolated bagiya_test_ database');
  return new MongoClient(uri);
}
async function noOverflow(page) {
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
}

test('debounced username feedback, live passwords, visibility and all sign-in identifiers', async ({
  page,
}, testInfo) => {
  const suffix = Date.now().toString();
  const username = `live${suffix}`,
    email = `${username}@example.test`,
    phone = `91${suffix.slice(-10)}`;
  const existing = await page.request.post('/api/auth/signup', {
    headers,
    data: {
      name: 'Existing',
      username: `taken${suffix}`,
      email: `taken${suffix}@example.test`,
      phone: '1234567890',
      password,
    },
  });
  expect(existing.status()).toBe(201);
  const queries = [];
  page.on('request', (request) => {
    if (request.url().includes('/username-availability'))
      queries.push(request.url());
  });
  await page.goto('/signup');
  await page.getByLabel('Username', { exact: true }).fill('ab');
  await expect(
    page.getByText('Use 3–30 letters, numbers or underscores.', {
      exact: true,
    }),
  ).toBeVisible();
  expect(queries).toHaveLength(0);
  await page.getByLabel('Username', { exact: true }).fill('');
  await page
    .getByLabel('Username', { exact: true })
    .pressSequentially(username, { delay: 20 });
  await expect(page.getByText('This username is available.')).toBeVisible();
  expect(queries).toHaveLength(1);
  await page.getByLabel('Username', { exact: true }).fill(`taken${suffix}`);
  await expect(page.getByText('This username is already taken.')).toBeVisible();
  await page
    .getByLabel('Username', { exact: true })
    .fill(username.toUpperCase());
  await expect(page.getByText('This username is available.')).toBeVisible();
  expect(queries).toHaveLength(2); // The normalized, short-lived cache avoids a repeat lookup.
  await page.getByLabel('Password', { exact: true }).fill('short');
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  await page.getByLabel('Confirm password', { exact: true }).fill('different');
  await expect(page.getByText('Passwords do not match yet.')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Create my account' }),
  ).toBeDisabled();
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm password', { exact: true }).fill(password);
  await expect(
    page.getByText('Passwords match.', { exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Show password', exact: true })
    .click();
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute(
    'type',
    'text',
  );
  await page
    .getByRole('button', { name: 'Hide password', exact: true })
    .click();
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute(
    'type',
    'password',
  );
  await page
    .getByRole('button', { name: 'Show confirm password', exact: true })
    .click();
  await expect(
    page.getByLabel('Confirm password', { exact: true }),
  ).toHaveAttribute('type', 'text');
  await page
    .getByRole('button', { name: 'Hide confirm password', exact: true })
    .click();
  await page.getByLabel('Full name').fill('Live Gardener');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Phone', { exact: true }).fill(phone);
  await noOverflow(page);
  await page.screenshot({
    path: testInfo.outputPath('signup-feedback.png'),
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Create my account' }).click();
  await expect(page).toHaveURL(/\/login$/);
  for (const identifier of [username.toUpperCase(), `+${phone}`, email]) {
    await page.getByLabel(identifierLabel).fill(identifier);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(
      page.getByRole('heading', { name: 'Hello, Live.' }),
    ).toBeVisible();
    await page.request.post('/api/auth/logout', { headers, data: {} });
    await page.goto('/login');
  }
});

test('outdated username responses cannot overwrite current availability', async ({
  page,
}) => {
  await page.goto('/signup');
  let release;
  const pending = new Promise((resolve) => {
    release = resolve;
  });
  await page.route(
    '**/api/auth/username-availability?username=slow_name',
    async (route) => {
      await pending;
      await route.fulfill({
        json: { username: 'slow_name', available: false },
      });
    },
  );
  const requested = page.waitForRequest(
    '**/api/auth/username-availability?username=slow_name',
  );
  await page.getByLabel('Username', { exact: true }).fill('slow_name');
  await requested;
  await page.getByLabel('Username', { exact: true }).fill(`fresh${Date.now()}`);
  await expect(page.getByText('This username is available.')).toBeVisible();
  release();
  await expect(page.getByText('This username is already taken.')).toHaveCount(
    0,
  );
  await expect(page.getByText('This username is available.')).toBeVisible();
});

test('growth restores each stage, pauses, withers, and real activity grows a nursery calendar and champions', async ({
  page,
}, testInfo) => {
  const suffix = Date.now().toString(),
    username = `growth${suffix}`;
  const signup = await page.request.post('/api/auth/signup', {
    headers,
    data: {
      name: 'Growing Gardener',
      username,
      email: `${username}@example.test`,
      phone: '1234567890',
      password,
    },
  });
  expect(signup.status()).toBe(201);
  const login = await page.request.post('/api/auth/login', {
    headers,
    data: { identifier: username, password },
  });
  expect(login.ok()).toBeTruthy();
  const { user } = await login.json();
  const client = testClient();
  await client.connect();
  try {
    const db = client.db(),
      userId = new ObjectId(user.id);
    await page.goto('/timer');
    await expect(
      page.getByRole('img', { name: 'Rooted tree', exact: true }),
    ).toBeVisible();
    await page
      .getByRole('button', { name: 'Start focusing', exact: true })
      .click();
    await expect(
      page.getByRole('button', { name: 'Take a breath' }),
    ).toBeVisible();
    await expect(
      page.getByRole('img', { name: 'Seed', exact: true }),
    ).toBeVisible();
    // Advance only this test account's stored clock; all session actions use the real API.
    for (const [progress, label] of [
      [0.15, 'First stem'],
      [0.3, 'New leaves'],
      [0.5, 'Young plant'],
      [0.7, 'Growing plant'],
      [0.9, 'Rooted tree'],
    ]) {
      await db
        .collection('sessions')
        .updateOne(
          { userId, active: true },
          { $set: { resumedAt: new Date(Date.now() - 25 * 60000 * progress) } },
        );
      await page.reload();
      await expect(
        page.getByRole('img', { name: label, exact: true }),
      ).toBeVisible();
    }
    await expect(page.locator('.growth-steps, .growth-caption')).toHaveCount(0);
    await page.getByRole('button', { name: 'Take a breath' }).click();
    await expect(page.locator('.timer-art .growth-art')).toHaveClass(/paused/);
    await page.reload();
    await expect(
      page.getByRole('img', { name: 'Rooted tree', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Resume focus' }),
    ).toBeVisible();
    await noOverflow(page);
    await page.screenshot({
      path: testInfo.outputPath('focus-growth.png'),
      fullPage: true,
    });
    await page.getByRole('button', { name: 'End early' }).click();
    await page
      .getByRole('button', { name: 'End session', exact: true })
      .click();
    await expect(
      page.getByRole('img', { name: 'Withered tree — session ended early' }),
    ).toBeVisible();
    const now = new Date();
    // Real stored fixtures exercise daily aggregation and ranking. Never modify development data.
    await db.collection('sessions').insertMany(
      Array.from({ length: 4 }, (_, index) => ({
        userId,
        sessionTime: 25,
        sessionSuccess: index < 3,
        active: false,
        startTime: new Date(now - 25 * 60000),
        endTime: now,
      })),
    );
    for (const [name, total] of [
      ['Second Gardener', 60],
      ['Third Gardener', 30],
    ]) {
      const id = new ObjectId();
      await db.collection('users').insertOne({
        _id: id,
        name,
        username: `${name.split(' ')[0].toLowerCase()}${suffix}`,
        email: `${id}@example.test`,
        phone: '1234567890',
        rankingOptIn: true,
        wallet: { balance: 0, trees: 0 },
        createdAt: now,
      });
      await db.collection('sessions').insertOne({
        userId: id,
        sessionTime: total,
        sessionSuccess: true,
        startTime: new Date(now - total * 60000),
        endTime: now,
      });
    }
    await page.goto('/dashboard/bagiya');
    await expect(page.locator('.calendar-grid')).toBeVisible();
    await expect(page.locator('.calendar-day')).toHaveCount(
      new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0),
      ).getUTCDate(),
    );
    await expect(page.locator('.calendar-day.today')).toHaveAttribute(
      'aria-label',
      /3 completed, 2 ended early/,
    );
    await expect(
      page.locator('.calendar-day.today .day-plant.healthy'),
    ).toHaveCount(1);
    await expect(
      page.locator('.calendar-day.today .day-plant.withered'),
    ).toHaveCount(0);
    await expect(
      page.locator('.calendar-legend, .growth-steps, .growth-caption'),
    ).toHaveCount(0);
    await expect(page.locator('.nursery-panel')).not.toContainText(
      /×|4\+ sessions|1 session/,
    );
    // Many more sessions still produce exactly one plant in the correct date cell.
    await db.collection('sessions').insertMany(
      Array.from({ length: 22 }, () => ({
        userId,
        sessionTime: 5,
        sessionSuccess: true,
        active: false,
        startTime: new Date(now - 5 * 60000),
        endTime: now,
      })),
    );
    await page.reload();
    await expect(page.locator('.calendar-day.today')).toHaveAttribute(
      'aria-label',
      /25 completed, 2 ended early/,
    );
    await expect(page.locator('.calendar-day.today .day-plant')).toHaveCount(1);
    await expect(
      page.locator('.calendar-day:not(.today) .day-plant'),
    ).toHaveCount(0);
    await noOverflow(page);
    await page.screenshot({
      path: testInfo.outputPath('calendar-growth.png'),
      fullPage: true,
    });
    await page.goto('/dashboard/rankings');
    await page
      .getByRole('button', { name: 'Join leaderboard', exact: true })
      .click();
    await expect(
      page.getByRole('button', { name: 'Join leaderboard', exact: true }),
    ).toHaveCount(0);
    expect(
      (await (await page.request.get('/api/auth/check-auth')).json())
        .rankingOptIn,
    ).toBe(true);
    await expect(
      page.getByRole('heading', { name: 'Meet the champions.' }),
    ).toBeVisible();
    await expect(page.locator('.podium-member')).toHaveCount(3);
    const rankings = await (
      await page.request.get('/api/social/rankings?period=week')
    ).json();
    await expect(page.locator('.place-1 .podium-person strong')).toHaveText(
      rankings.rankings[0].name,
    );
    await expect(page.locator('.place-1 .podium-caption')).toHaveText(
      'Champion',
    );
    const heights = await page
      .locator('.podium-member')
      .evaluateAll((nodes) =>
        nodes.map((node) =>
          Number.parseFloat(node.querySelector('.podium-bar').style.height),
        ),
      );
    expect(heights[0]).toBe(100);
    expect(heights[1]).toBeLessThanOrEqual(heights[0]);
    expect(heights[2]).toBeLessThanOrEqual(heights[1]);
    await noOverflow(page);
    await page.screenshot({
      path: testInfo.outputPath('champions.png'),
      fullPage: true,
    });
    await db.collection('sessions').insertOne({
      userId,
      sessionTime: 500,
      sessionSuccess: true,
      active: false,
      startTime: new Date(now - 500 * 60000),
      endTime: now,
    });
    await page.getByRole('button', { name: 'Refresh leaderboard' }).click();
    await expect(page.locator('.place-1 .podium-person strong')).toHaveText(
      'Growing Gardener',
    );
    await expect(page.locator('.place-1 .podium-score')).toHaveText('11h 25m');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/timer');
    await expect
      .poll(() =>
        page
          .locator('.growth-sway')
          .first()
          .evaluate((node) => getComputedStyle(node).animationName),
      )
      .toBe('none');
  } finally {
    await client.close();
  }
});
