const { test } = require('node:test');
const assert = require('node:assert/strict');
const { elapsed } = require('../services/focus');
const { buckets } = require('../services/analytics');
const validation = require('../lib/validation');
const { loadConfig } = require('../config');
const { pagination } = require('../lib/http');
const { normalizePhone } = require('../lib/identity');
test('phone normalization preserves country digits and rejects malformed identities', () => {
  assert.equal(normalizePhone('+91 (98765) 43210'), '919876543210');
  assert.equal(normalizePhone('98765-43210'), '9876543210');
  for (const value of [
    '+++1234567',
    '123',
    '1234567890123456',
    'call1234567',
    null,
  ])
    assert.equal(normalizePhone(value), null);
  assert.equal(
    validation.login.parse({ identifier: ' Alice ', password: 'test' })
      .identifier,
    'Alice',
  );
  assert.equal(
    validation.login.safeParse({ identifier: { $ne: '' }, password: 'test' })
      .success,
    false,
  );
  assert.equal(
    validation.login.safeParse({
      identifier: 'alice',
      email: 'a@b.com',
      password: 'test',
    }).success,
    false,
  );
});
test('paused time is excluded and running time survives refresh', () => {
  const now = new Date('2026-01-01T01:00:00Z');
  assert.equal(
    elapsed(
      { status: 'paused', elapsedMs: 12000, resumedAt: new Date(0) },
      now,
    ),
    12000,
  );
  assert.equal(
    elapsed(
      {
        status: 'running',
        elapsedMs: 12000,
        resumedAt: new Date('2026-01-01T00:59:00Z'),
      },
      now,
    ),
    72000,
  );
});
test('duration rejects forged amounts, invalid increments and user ownership', () => {
  const requestId = '00000000-0000-4000-8000-000000000000';
  for (const sessionTime of [-1, 0, 1, 7, 181, '25', Infinity])
    assert.equal(
      validation.start.safeParse({ sessionTime, requestId }).success,
      false,
    );
  assert.equal(
    validation.start.safeParse({ sessionTime: 25, requestId }).success,
    true,
  );
  assert.equal(
    validation.purchase.safeParse({
      type: 'TREE_PLANTING',
      requestId,
      amount: 1,
    }).success,
    false,
  );
});
test('normalizes identities and rejects operator injection and bcrypt truncation', () => {
  assert.equal(
    validation.login.parse({ email: ' A@Example.com ', password: 'hello' })
      .email,
    'a@example.com',
  );
  assert.equal(
    validation.login.safeParse({ email: { $ne: null }, password: 'hello' })
      .success,
    false,
  );
  const user = {
    name: 'A',
    username: 'abc',
    phone: '1234567890',
    email: 'a@b.com',
    password: '🌳'.repeat(30),
  };
  assert.equal(validation.signup.safeParse(user).success, false);
});
test('UTC buckets span year boundaries and week starts on Monday', () => {
  const months = buckets('monthly', new Date('2026-01-10T10:00:00Z'));
  assert.equal(months[0].key, '2025-02');
  assert.equal(months.at(-1).key, '2026-01');
  const week = buckets('weekly', new Date('2026-01-04T12:00:00Z'));
  assert.equal(week[0].key, '2025-12-29');
  assert.equal(week.at(-1).key, '2026-01-04');
});
test('configuration fails clearly and pagination is bounded', () => {
  assert.throws(() => loadConfig({}), /MONGO_URI/);
  assert.throws(
    () =>
      loadConfig({
        MONGO_URI: 'mongodb://localhost/test',
        SESSION_SECRET: 'short',
        CLIENT_ORIGIN: 'http://localhost',
      }),
    /32/,
  );
  assert.throws(() => pagination({ limit: 101 }));
  assert.throws(() => pagination({ page: -1 }));
  assert.deepEqual(pagination({ page: 2, limit: 10 }), {
    page: 2,
    limit: 10,
    skip: 10,
  });
});
