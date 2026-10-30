const { test } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const session = require('express-session');
const { createApp } = require('../app');
// Unit boundary tests only: no authenticated requests or persistence rely on this store.
const app = createApp(
  {
    secret: 'test-secret-with-at-least-thirty-two-characters',
    origins: ['http://localhost:5173'],
    production: false,
    trustProxy: false,
  },
  new session.MemoryStore(),
);
test('health is public and private APIs require an authenticated session', async () => {
  await request(app).get('/api/health').expect(200);
  for (const path of [
    '/api/users/507f1f77bcf86cd799439011',
    '/api/challenges',
    '/api/sessions/active',
    '/api/social/friends',
  ])
    await request(app).get(path).expect(401);
});
test('rejects cross-origin and form-based mutations before database access', async () => {
  await request(app).post('/api/auth/login').send({}).expect(403);
  await request(app)
    .post('/api/auth/login')
    .set('X-Bagiya-Request', '1')
    .set('Origin', 'https://untrusted.example')
    .send({})
    .expect(403);
  await request(app)
    .post('/api/auth/login')
    .set('X-Bagiya-Request', '1')
    .type('form')
    .send('email=x')
    .expect(415);
});
test('invalid input has predictable field errors and no stack trace', async () => {
  const response = await request(app)
    .post('/api/auth/signup')
    .set('X-Bagiya-Request', '1')
    .send({ email: { $ne: null } })
    .expect(400);
  assert.ok(response.body.fields.email);
  assert.equal(response.body.stack, undefined);
});
