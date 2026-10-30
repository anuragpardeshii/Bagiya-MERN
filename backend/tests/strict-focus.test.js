const { test } = require('node:test');
const assert = require('node:assert/strict');
const { normalizeAllowedLink, isAllowedUrl } = require('../lib/focusPolicy');
const { start } = require('../lib/validation');
const { randomUUID } = require('node:crypto');
const app = 'http://localhost:5179';
test('allowlist canonicalizes domains and pages without accepting lookalike hosts or subdomains', () => {
  assert.equal(normalizeAllowedLink(' EXAMPLE.com '), 'https://example.com');
  const list = [normalizeAllowedLink('example.com')];
  assert.equal(isAllowedUrl('https://example.com/lesson?q=1', list, app), true);
  for (const url of [
    'https://example.com.evil.test',
    'https://sub.example.com',
    'https://evil.test/?next=https://example.com',
    'http://example.com',
    'https://example.com:8443',
  ])
    assert.equal(isAllowedUrl(url, list, app), false, url);
});
test('specific pages match exact paths and queries while allowing anchor changes', () => {
  const list = [normalizeAllowedLink('https://example.com/lesson?q=1#intro')];
  assert.equal(
    isAllowedUrl('https://example.com/lesson?q=1#next', list, app),
    true,
  );
  for (const url of [
    'https://example.com/lesson',
    'https://example.com/lesson/next?q=1',
    'https://example.com/other?q=1',
  ])
    assert.equal(isAllowedUrl(url, list, app), false);
});
test('privileged schemes and embedded credentials are rejected, and only the exact app origin is implicitly allowed', () => {
  for (const url of [
    'javascript:alert(1)',
    'file:///tmp/example',
    'chrome://settings',
    'https://user:password@example.com',
  ])
    assert.throws(() => normalizeAllowedLink(url));
  assert.equal(isAllowedUrl(`${app}/dashboard`, [], app), true);
  assert.equal(isAllowedUrl('http://localhost:5180/timer', [], app), false);
  assert.equal(
    isAllowedUrl('https://user:pass@localhost:5179', [], app),
    false,
  );
});
test('strict configuration is bounded, normalized and cannot be attached to normal sessions', () => {
  const base = { sessionTime: 25, requestId: randomUUID() };
  assert.equal(
    start.safeParse({ ...base, allowedLinks: ['example.com'] }).success,
    false,
  );
  assert.equal(
    start.safeParse({
      ...base,
      strictMode: true,
      allowedLinks: Array(31).fill('example.com'),
    }).success,
    false,
  );
  assert.equal(
    start.safeParse({
      ...base,
      strictMode: true,
      appOrigin: 'https://evil.test',
    }).success,
    false,
  );
  assert.deepEqual(
    start.parse({ ...base, strictMode: true, allowedLinks: ['EXAMPLE.com'] })
      .allowedLinks,
    ['https://example.com'],
  );
});
