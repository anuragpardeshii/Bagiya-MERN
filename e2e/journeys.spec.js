const { test, expect } = require('@playwright/test');
const stamp = () => `${Date.now()}${Math.floor(Math.random() * 10000)}`;
async function navigate(page, label) {
  const menu = page.getByRole('button', { name: 'Open navigation' });
  if (await menu.isVisible()) await menu.click();
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: label, exact: true })
    .click();
}
test('signup, profile, focus pause/reload/cancel, data screens and logout', async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const suffix = stamp(),
    email = `e2e${suffix}@example.test`;
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /Find your focus/ }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Let’s start growing' }).click();
  await page.getByLabel('Full name').fill('Test Gardener');
  await page.getByLabel('Username', { exact: true }).fill(`garden${suffix}`);
  await page.getByLabel('Phone', { exact: true }).fill('1234567890');
  await page.getByLabel('Email address').fill(email);
  await page
    .getByLabel('Password', { exact: true })
    .fill('A-long-test-password');
  await page
    .getByLabel('Confirm password', { exact: true })
    .fill('A-long-test-password');
  await page.getByRole('button', { name: 'Create my account' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('Email, phone or username').fill(email);
  await page
    .getByLabel('Password', { exact: true })
    .fill('A-long-test-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Hello, Test.' }),
  ).toBeVisible();
  await expect(
    page.getByText('A fresh start looks good on you.'),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
  await page.screenshot({
    path: testInfo.outputPath('overview.png'),
    fullPage: true,
  });
  await navigate(page, 'Focus timer');
  await expect(
    page.getByRole('img', { name: 'Rooted tree', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Start focusing', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Take a breath', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Take a breath', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Resume focus' }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Resume focus' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Resume focus' }).click();
  await page.getByRole('button', { name: 'End early' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Keep focusing' }).click();
  await page.getByRole('button', { name: 'End early' }).click();
  await page.getByRole('button', { name: 'End session', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Start focusing', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('img', { name: 'Withered tree — session ended early' }),
  ).toBeVisible();
  await navigate(page, 'My garden');
  await expect(
    page.locator('.calendar-day.today .day-plant.withered'),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Plant a tree · 2,500 coins' }),
  ).toBeDisabled();
  await expect(
    page.getByRole('cell', { name: 'Daily login', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Previous month' }),
  ).toBeDisabled();
  await navigate(page, 'Challenges');
  await expect(
    page.getByRole('heading', { name: 'Daily login', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Collected today', exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole('heading', { name: 'A little beginning' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'In progress' }).first(),
  ).toBeDisabled();
  await navigate(page, 'Friends');
  await page.getByLabel('Search usernames').fill('no_such_member');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByText('No matching members.')).toBeVisible();
  await navigate(page, 'Leaderboard');
  await expect(page.getByText('Grow quietly, or grow together.')).toBeVisible();
  await page.getByRole('link', { name: 'My preferences' }).click();
  await expect(page.getByLabel('Full name')).toBeDisabled();
  await page.getByRole('button', { name: 'Edit profile' }).click();
  await page.getByLabel('Full name').fill('Discard this edit');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByLabel('Full name')).toHaveValue('Test Gardener');
  await expect(page.getByLabel('Full name')).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Save changes' })).toHaveCount(
    0,
  );
  await page.getByRole('button', { name: 'Edit profile' }).click();
  await page.getByLabel('Full name').fill('A Calm Gardener');
  await page.getByLabel('A few words about you').fill('Learning to focus.');
  await page.getByLabel('Join the community leaderboard').check();
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('Your profile is up to date.')).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Full name')).toHaveValue('A Calm Gardener');
  await expect(page.getByLabel('Join the community leaderboard')).toBeChecked();
  const menu = page.getByRole('button', { name: 'Open navigation' });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login$/);
  expect(errors).toEqual([]);
});
test('network failure shows retry and unknown routes stay useful', async ({
  page,
}) => {
  await page.goto('/a-path-that-does-not-exist');
  await expect(
    page.getByRole('heading', { name: 'This page hasn’t taken root.' }),
  ).toBeVisible();
  await page.route('**/api/auth/check-auth', (route) => route.abort());
  await page.goto('/dashboard');
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  await page.unroute('**/api/auth/check-auth');
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page).toHaveURL(/\/login$/);
  // A successful login must clear an earlier auth-bootstrap network error.
  const name = `recovery${stamp()}`;
  await page.request.post('/api/auth/signup', {
    headers: { 'X-Bagiya-Request': '1' },
    data: {
      name: 'Recovered Gardener',
      username: name,
      email: `${name}@example.test`,
      phone: '1234567890',
      password: 'A-long-test-password',
    },
  });
  await page.route('**/api/auth/check-auth', (route) => route.abort());
  await page.goto('/login');
  await page
    .getByLabel('Email, phone or username')
    .fill(`${name}@example.test`);
  await page
    .getByLabel('Password', { exact: true })
    .fill('A-long-test-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Hello, Recovered.' }),
  ).toBeVisible();
});

test('completed focus earns coins, challenge pays once, and a planted tree persists', async ({
  page,
}, testInfo) => {
  const uri = process.env.E2E_TEST_MONGO_URI;
  if (!uri || !new URL(uri).pathname.startsWith('/bagiya_test_'))
    throw new Error(
      'E2E_TEST_MONGO_URI must name an isolated bagiya_test_* database used by the test API',
    );
  const { MongoClient, ObjectId } = require('../backend/node_modules/mongodb');
  const suffix = stamp(),
    name = `reward${suffix}`,
    headers = { 'X-Bagiya-Request': '1' };
  await page.request.post('/api/auth/signup', {
    headers,
    data: {
      name: 'Mindful Gardener',
      username: name,
      email: `${name}@example.test`,
      phone: '1234567890',
      password: 'A-long-test-password',
    },
  });
  const login = await page.request.post('/api/auth/login', {
    headers,
    data: { email: `${name}@example.test`, password: 'A-long-test-password' },
  });
  expect(login.ok()).toBeTruthy();
  const { user } = await login.json();
  await page.goto('/timer');
  await page
    .getByRole('button', { name: 'Start focusing', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Take a breath', exact: true }),
  ).toBeVisible();
  // Advance only the isolated test account's persisted start clock. All browser/API reward writes remain real.
  const client = new MongoClient(uri);
  await client.connect();
  try {
    const changed = await client
      .db()
      .collection('sessions')
      .updateOne(
        { userId: new ObjectId(user.id), active: true },
        { $set: { resumedAt: new Date(Date.now() - 25 * 60000 - 5000) } },
      );
    expect(changed.modifiedCount).toBe(1);
  } finally {
    await client.close();
  }
  await page.reload();
  await expect(
    page.getByText('2,500 coins added to your garden.'),
  ).toBeVisible();
  await navigate(page, 'Challenges');
  await page
    .getByRole('button', { name: 'Collect reward', exact: true })
    .click();
  await expect(page.getByRole('button', { name: 'Collected' })).toBeVisible();
  await navigate(page, 'My garden');
  await page
    .getByRole('button', { name: 'Plant a tree · 2,500 coins' })
    .click();
  await expect(page.getByText('1 tree planted', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('1 tree planted', { exact: true })).toBeVisible();
  await expect(
    page.getByText('Virtual tree planted', { exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath('garden.png'),
    fullPage: true,
  });
  await navigate(page, 'Overview');
  await expect(page.getByText('Completed', { exact: true })).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
});
