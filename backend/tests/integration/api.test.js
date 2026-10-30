const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const request = require('supertest');
const { createApp } = require('../../app');
const { run } = require('../../scripts/migrate');
const User = require('../../models/User');
const Session = require('../../models/session');
const Transaction = require('../../models/transaction');
const Challenge = require('../../models/Challenge');
const focus = require('../../services/focus');
const { chart } = require('../../services/analytics');
const uri = process.env.TEST_MONGO_URI;
if (!uri)
  throw new Error(
    'TEST_MONGO_URI is required: use an isolated disposable MongoDB replica set',
  );
const database = `bagiya_test_${process.pid}`;
let app, alice, bob, aliceId, bobId, store;
const post = (agent, path, body = {}) =>
  agent.post(`/api${path}`).set('X-Bagiya-Request', '1').send(body);
const put = (agent, path, body) =>
  agent.put(`/api${path}`).set('X-Bagiya-Request', '1').send(body);
before(async () => {
  await mongoose.connect(uri, {
    dbName: database,
    autoIndex: false,
    serverSelectionTimeoutMS: 10000,
  });
  await run(mongoose.connection.db);
  store = MongoStore.create({
    client: mongoose.connection.getClient(),
    dbName: database,
    collectionName: 'auth_sessions',
  });
  app = createApp(
    {
      secret: 'test-only-secret-with-more-than-thirty-two-characters',
      origins: ['http://localhost:5173'],
      production: false,
      milestonesEnabled: true,
      trustProxy: false,
    },
    store,
  );
  alice = request.agent(app);
  bob = request.agent(app);
  for (const [agent, name] of [
    [alice, 'alice'],
    [bob, 'bob'],
  ]) {
    await post(agent, '/auth/signup', {
      name,
      username: name,
      email: `${name}@example.test`,
      phone: '1234567890',
      password: 'test-password-123',
    }).expect(201);
    const result = await post(agent, '/auth/login', {
      email: `${name}@example.test`,
      password: 'test-password-123',
    }).expect(200);
    if (name === 'alice') aliceId = result.body.user.id;
    else bobId = result.body.user.id;
  }
});
after(async () => {
  if (mongoose.connection.readyState === 1)
    await mongoose.connection.db.dropDatabase();
  if (store) await store.close();
  await mongoose.disconnect();
});
test('fresh migration is tracked, repeatable and readiness succeeds', async () => {
  assert.deepEqual(await run(mongoose.connection.db, 'status'), [
    { id: '001-baseline', applied: true },
    { id: '002-phone-login', applied: true },
    { id: '003-nursery', applied: true },
    { id: '004-strict-focus', applied: true },
  ]);
  await run(mongoose.connection.db);
  await request(app).get('/api/ready').expect(200);
  await assert.rejects(run(mongoose.connection.db, 'down'), /forward-only/);
});
test('case-insensitive duplicate signup and generic invalid login errors', async () => {
  await post(alice, '/auth/signup', {
    name: 'duplicate',
    username: 'ALICE',
    email: 'NEW@example.test',
    phone: '1234567890',
    password: 'test-password-123',
  }).expect(409);
  const wrong = await post(request(app), '/auth/login', {
    email: 'alice@example.test',
    password: 'wrong',
  }).expect(401);
  const absent = await post(request(app), '/auth/login', {
    email: 'absent@example.test',
    password: 'wrong',
  }).expect(401);
  assert.equal(wrong.body.message, absent.body.message);
});
test('session cookie is httpOnly and profile reads cannot leak hashes or cross accounts', async () => {
  const login = await post(alice, '/auth/login', {
    email: 'alice@example.test',
    password: 'test-password-123',
  }).expect(200);
  assert.match(login.headers['set-cookie'][0], /HttpOnly/);
  assert.match(login.headers['set-cookie'][0], /SameSite=Lax/);
  const profile = await alice.get(`/api/users/${aliceId}`).expect(200);
  assert.equal(profile.body.user.password, undefined);
  assert.equal(profile.body.user.wallet.transactions, undefined);
  await alice.get(`/api/users/${bobId}`).expect(403);
  await alice.get(`/api/users/not-an-id`).expect(400);
});
test('production login sets a Secure cookie through the explicitly trusted HTTPS proxy', async () => {
  const production = createApp(
    {
      secret: 'production-test-session-secret-with-sufficient-length',
      origins: ['https://bagiya.test'],
      production: true,
      trustProxy: 1,
    },
    store,
  );
  const result = await request(production)
    .post('/api/auth/login')
    .set('X-Bagiya-Request', '1')
    .set('Origin', 'https://bagiya.test')
    .set('X-Forwarded-Proto', 'https')
    .send({ email: 'alice@example.test', password: 'test-password-123' })
    .expect(200);
  assert.match(result.headers['set-cookie'][0], /Secure/);
  assert.match(result.headers['set-cookie'][0], /HttpOnly/);
  assert.match(result.headers['set-cookie'][0], /SameSite=Lax/);
});

test('profile mutation is validated, ownership-bound and visible to refreshed auth', async () => {
  const body = {
    name: 'Alice New',
    username: 'alice',
    email: 'alice@example.test',
    phone: '1234567890',
    bio: 'A mindful routine',
    dob: '2000-01-01',
    rankingOptIn: false,
  };
  await put(alice, `/users/${bobId}`, body).expect(403);
  await put(alice, `/users/${aliceId}`, {
    ...body,
    wallet: { balance: 999999 },
  }).expect(400);
  await put(alice, `/users/${aliceId}`, { ...body, dob: '2999-01-01' }).expect(
    400,
  );
  await put(alice, `/users/${aliceId}`, body).expect(200);
  assert.equal(
    (await alice.get('/api/auth/check-auth').expect(200)).body.name,
    'Alice New',
  );
});
test('timer start is idempotent, only one can run, and forged completion is rejected', async () => {
  const requestId = randomUUID();
  const first = await post(alice, '/sessions/start', {
    sessionTime: 25,
    requestId,
  }).expect(201);
  const replay = await post(alice, '/sessions/start', {
    sessionTime: 25,
    requestId,
  }).expect(201);
  assert.equal(first.body.session._id, replay.body.session._id);
  await post(alice, '/sessions/start', { sessionTime: 30, requestId }).expect(
    409,
  );
  await post(alice, '/sessions/start', {
    sessionTime: 25,
    requestId: randomUUID(),
  }).expect(409);
  await post(alice, `/sessions/${first.body.session._id}/action`, {
    action: 'complete',
  }).expect(409);
  await post(bob, `/sessions/${first.body.session._id}/action`, {
    action: 'cancel',
  }).expect(404);
  await post(alice, '/sessions/create', {
    userId: aliceId,
    sessionTime: 100,
  }).expect(410);
  await post(alice, '/transactions/reward', {
    userId: aliceId,
    amount: 999999,
  }).expect(410);
  await post(alice, `/sessions/${first.body.session._id}/action`, {
    action: 'cancel',
  }).expect(200);
});
test('parallel starts create one active timer', async () => {
  const results = await Promise.all(
    [1, 2].map(() =>
      post(bob, '/sessions/start', { sessionTime: 5, requestId: randomUUID() }),
    ),
  );
  assert.equal(results.filter((r) => r.status === 201).length, 1);
  assert.equal(results.filter((r) => r.status === 409).length, 1);
  assert.equal(
    await Session.countDocuments({ userId: bobId, active: true }),
    1,
  );
  const active = await Session.findOne({ userId: bobId, active: true });
  await focus.act(bobId, active._id, 'cancel');
});
test('pause excludes wall-clock breaks and survives a fresh request', async () => {
  const start = new Date(Date.now() - 600000),
    session = await focus.start(
      aliceId,
      { sessionTime: 5, requestId: randomUUID() },
      start,
    );
  const paused = await focus.act(
    aliceId,
    session._id,
    'pause',
    new Date(+start + 120000),
  );
  assert.equal(paused.remainingMs, 180000);
  assert.equal(
    (await alice.get('/api/sessions/active').expect(200)).body.session.status,
    'paused',
  );
  await assert.rejects(
    focus.act(aliceId, session._id, 'complete', new Date(+start + 900000)),
    /not finished/,
  );
  await focus.act(aliceId, session._id, 'resume', new Date(+start + 900000));
  const finished = await focus.act(
    aliceId,
    session._id,
    'complete',
    new Date(+start + 1080000),
  );
  assert.equal(finished.reward, 500);
});
test('concurrent completion awards exactly once and writes one ledger entry', async () => {
  const start = new Date(Date.now() - 1600000),
    session = await focus.start(
      aliceId,
      { sessionTime: 25, requestId: randomUUID() },
      start,
    );
  const before = (await User.findById(aliceId)).wallet.balance;
  const results = await Promise.all(
    [1, 2].map(() =>
      post(alice, `/sessions/${session._id}/action`, { action: 'complete' }),
    ),
  );
  assert.ok(results.every((r) => r.status === 200));
  assert.equal((await User.findById(aliceId)).wallet.balance, before + 2500);
  assert.equal(
    await Transaction.countDocuments({ requestId: `focus:${session._id}` }),
    1,
  );
});
test('a failed ledger write rolls back the wallet and session; retry succeeds', async () => {
  const item = await focus.start(
    bobId,
    { sessionTime: 5, requestId: randomUUID() },
    new Date(Date.now() - 310000),
  );
  const before = (await User.findById(bobId)).wallet.balance;
  const original = Transaction.create;
  Transaction.create = async () => {
    throw new Error('injected ledger failure');
  };
  try {
    await assert.rejects(focus.act(bobId, item._id, 'complete'), /injected/);
  } finally {
    Transaction.create = original;
  }
  assert.equal((await User.findById(bobId)).wallet.balance, before);
  assert.equal((await Session.findById(item._id)).active, true);
  await focus.act(bobId, item._id, 'complete');
});
test('tree price is server owned; concurrent spending cannot overdraw', async () => {
  await User.updateOne(
    { _id: aliceId },
    { $set: { 'wallet.balance': 2500, 'wallet.trees': 0 } },
  );
  await post(alice, '/transactions/spend', {
    type: 'TREE_PLANTING',
    requestId: randomUUID(),
    amount: 1,
  }).expect(400);
  const results = await Promise.all(
    [1, 2].map(() =>
      post(alice, '/transactions/spend', {
        type: 'TREE_PLANTING',
        requestId: randomUUID(),
      }),
    ),
  );
  assert.equal(results.filter((r) => r.status === 200).length, 1);
  assert.equal(results.filter((r) => r.status === 409).length, 1);
  const user = await User.findById(aliceId);
  assert.equal(user.wallet.balance, 0);
  assert.equal(user.wallet.trees, 1);
});
test('retrying a tree purchase does not spend twice', async () => {
  await User.updateOne({ _id: aliceId }, { $set: { 'wallet.balance': 5000 } });
  const requestId = randomUUID();
  await post(alice, '/transactions/spend', {
    type: 'TREE_PLANTING',
    requestId,
  }).expect(200);
  const replay = await post(alice, '/transactions/spend', {
    type: 'TREE_PLANTING',
    requestId,
  }).expect(200);
  assert.equal(replay.body.replayed, true);
  assert.equal(replay.body.balance, 2500);
});
test('challenge eligibility and ownership are enforced; repeat redemption credits once', async () => {
  await post(bob, '/challenges/redeem/one-hour').expect(409);
  const legacy = await Challenge.create({
    userId: bobId,
    title: 'Legacy',
    description: 'Unknown condition',
    coins: 10,
  });
  const aliceChallenges = await alice.get('/api/challenges').expect(200);
  assert.ok(
    !aliceChallenges.body.challenges.some((c) => c._id === String(legacy._id)),
  );
  await post(alice, `/challenges/redeem/${legacy._id}`).expect(404);
  await post(bob, `/challenges/redeem/${legacy._id}`).expect(409);
  const balance = (await User.findById(aliceId)).wallet.balance;
  await post(alice, '/challenges/redeem/first-session').expect(200);
  await post(alice, '/challenges/redeem/first-session').expect(200);
  assert.equal((await User.findById(aliceId)).wallet.balance, balance + 250);
});
test('history pagination is bounded and analytics use accurate UTC year boundaries', async () => {
  await alice.get(`/api/sessions/user/${aliceId}?limit=101`).expect(400);
  const result = await alice
    .get(`/api/sessions/user/${aliceId}?limit=1`)
    .expect(200);
  assert.equal(result.body.sessions.length, 1);
  assert.ok(result.body.total >= 1);
  await Session.create({
    userId: bobId,
    sessionTime: 10,
    sessionSuccess: true,
    startTime: new Date('2025-12-31T23:30:00Z'),
    endTime: new Date('2025-12-31T23:40:00Z'),
  });
  await Session.create({
    userId: bobId,
    sessionTime: 15,
    sessionSuccess: true,
    startTime: new Date('2026-01-01T00:00:00Z'),
    endTime: new Date('2026-01-01T00:15:00Z'),
  });
  const data = await chart(bobId, 'monthly', new Date('2026-01-10T00:00:00Z'));
  assert.equal(data.find((d) => d.key === '2025-12').timeInvested, 10);
  assert.equal(data.find((d) => d.key === '2026-01').timeInvested, 15);
  await alice.get('/api/sessions/activity?month=2026-13').expect(400);
  await alice.get('/api/sessions/summary?period=unknown').expect(400);
});
test('friend request lifecycle protects acceptance and removal', async () => {
  const found = await alice.get('/api/social/search?q=bo').expect(200);
  assert.equal(found.body.users[0].email, undefined);
  assert.equal(found.body.users[0].username, 'bob');
  const sent = await post(alice, `/social/friends/${bobId}`).expect(201);
  await post(alice, `/social/friends/${bobId}`).expect(201);
  const id = sent.body.friend._id;
  await alice
    .patch(`/api/social/friends/${id}`)
    .set('X-Bagiya-Request', '1')
    .send({})
    .expect(404);
  await bob
    .patch(`/api/social/friends/${id}`)
    .set('X-Bagiya-Request', '1')
    .send({})
    .expect(200);
  assert.equal(
    (await bob.get('/api/social/friends').expect(200)).body.friends[0].status,
    'accepted',
  );
  await alice
    .delete(`/api/social/friends/${id}`)
    .set('X-Bagiya-Request', '1')
    .expect(200);
  assert.equal(
    (await bob.get('/api/social/friends').expect(200)).body.total,
    0,
  );
});
test('leaderboard is real, respects opt-in and never discloses private identity fields', async () => {
  assert.equal(
    (await alice.get('/api/social/rankings?period=all').expect(200)).body.total,
    0,
  );
  await User.updateOne({ _id: bobId }, { $set: { rankingOptIn: true } });
  const rows = (await alice.get('/api/social/rankings?period=all').expect(200))
    .body.rankings;
  assert.equal(rows.length, 1);
  assert.equal(rows[0].username, 'bob');
  assert.equal(rows[0].email, undefined);
  assert.equal(rows[0].phone, undefined);
  assert.equal(rows[0].minutes, 30);
});
test('logout destroys the database-backed session', async () => {
  await post(bob, '/auth/logout').expect(200);
  await bob.get('/api/auth/check-auth').expect(401);
});
test('legacy migration preserves records and blocks normalized collisions without changing data', async () => {
  const db = mongoose.connection
    .getClient()
    .db(`bagiya_test_legacy_${process.pid}`);
  try {
    const id = new mongoose.Types.ObjectId();
    await db.collection('users').insertOne({
      _id: id,
      email: ' OLD@EXAMPLE.TEST ',
      username: ' OLD_USER ',
      password: 'unchanged-hash',
      phone: '+91 (98765) 43210',
      wallet: { balance: 500, trees: 2 },
    });
    await run(db);
    const migrated = await db.collection('users').findOne({ _id: id });
    assert.equal(migrated.email, 'old@example.test');
    assert.equal(migrated.password, 'unchanged-hash');
    assert.equal(migrated.phoneNormalized, '919876543210');
    assert.equal(migrated.phone, '+91 (98765) 43210');
    assert.equal(migrated.wallet.balance, 500);
    await assert.rejects(
      db
        .collection('users')
        .insertOne({ email: 'old@example.test', username: 'unique' }),
      /duplicate key/,
    );
  } finally {
    await db.dropDatabase();
  }
  const collisions = mongoose.connection
    .getClient()
    .db(`bagiya_test_collision_${process.pid}`);
  try {
    await collisions.collection('users').insertMany([
      { email: 'A@EXAMPLE.TEST', username: 'a' },
      { email: 'a@example.test', username: 'b' },
    ]);
    await assert.rejects(run(collisions), /Duplicate normalized email/);
    assert.equal(await collisions.collection('migrations').countDocuments(), 0);
    assert.equal(
      (await collisions.collection('users').findOne({ username: 'a' })).email,
      'A@EXAMPLE.TEST',
    );
  } finally {
    await collisions.dropDatabase();
  }
});

test('unapproved default milestones stay disabled without explicit configuration', async () => {
  const disabled = createApp(
    {
      secret: 'test-disabled-catalog-secret-at-least-32-characters',
      origins: ['http://localhost:5173'],
      production: false,
      trustProxy: false,
    },
    store,
  );
  const agent = request.agent(disabled);
  await post(agent, '/auth/login', {
    email: 'alice@example.test',
    password: 'test-password-123',
  }).expect(200);
  const result = await agent.get('/api/challenges').expect(200);
  assert.ok(!result.body.challenges.some((item) => item._id === 'one-hour'));
  assert.equal(result.body.challenges[0]._id, 'daily-login');
  assert.equal(result.body.challenges[0].coins, 10);
  assert.equal(result.body.challenges[0].isRedeemed, true);
  await post(agent, '/challenges/redeem/one-hour').expect(404);
});

test('username availability validates, normalizes and returns no account details', async () => {
  const taken = await request(app)
    .get('/api/auth/username-availability?username=ALICE')
    .expect(200);
  assert.deepEqual(taken.body, { username: 'alice', available: false });
  assert.equal(taken.headers['cache-control'], 'no-store');
  const free = await request(app)
    .get('/api/auth/username-availability?username=available_name')
    .expect(200);
  assert.equal(free.body.available, true);
  await request(app)
    .get('/api/auth/username-availability?username=ab')
    .expect(400);
  await request(app)
    .get('/api/auth/username-availability?username[$ne]=alice')
    .expect(400);
});

test('email, username and normalized phone sign in; shared phones fail safely and edits refresh lookup', async () => {
  const agent = request.agent(app);
  const signup = {
    name: 'Phone Gardener',
    username: 'phone_gardener',
    email: 'phone@example.test',
    phone: '+91 (98765) 43210',
    password: 'test-password-123',
  };
  await post(agent, '/auth/signup', signup).expect(201);
  let id;
  for (const identifier of [
    ' PHONE@EXAMPLE.TEST ',
    'PHONE_GARDENER',
    '+91 98765-43210',
    '919876543210',
  ]) {
    const login = await post(agent, '/auth/login', {
      identifier,
      password: signup.password,
    }).expect(200);
    id = login.body.user.id;
    assert.equal(login.body.user.username, signup.username);
    assert.equal(login.body.user.phoneNormalized, undefined);
  }
  const wrong = await post(request(app), '/auth/login', {
    identifier: 'phone_gardener',
    password: 'wrong',
  }).expect(401);
  const ambiguous = await post(request(app), '/auth/login', {
    identifier: '1234567890',
    password: signup.password,
  }).expect(401);
  assert.equal(ambiguous.body.message, wrong.body.message);
  const { password: ignored, ...profile } = signup;
  void ignored;
  await put(agent, `/users/${id}`, {
    ...profile,
    phone: '+44 7700 900123',
  }).expect(200);
  await post(request(app), '/auth/login', {
    identifier: '919876543210',
    password: signup.password,
  }).expect(401);
  await post(request(app), '/auth/login', {
    identifier: '+44 (7700) 900123',
    password: signup.password,
  }).expect(200);
  // A numeric username that collides with someone else's phone cannot select an arbitrary account.
  await post(request(app), '/auth/signup', {
    ...signup,
    email: 'numeric@example.test',
    username: '447700900123',
    phone: '9876543210',
  }).expect(201);
  await post(request(app), '/auth/login', {
    identifier: '447700900123',
    password: signup.password,
  }).expect(401);
  await post(request(app), '/auth/login', {
    identifier: 'phone@example.test',
    password: signup.password,
  }).expect(200);
});

test('nursery keeps one entry per finished session, isolates owners and pages a UTC month without duplicates', async () => {
  const startTime = new Date('2024-02-29T22:00:00Z');
  await Session.insertMany(
    Array.from({ length: 28 }, (_, i) => ({
      userId: aliceId,
      sessionTime: 25,
      sessionSuccess: i % 3 !== 0,
      active: false,
      startTime,
      endTime: new Date(Date.UTC(2024, 1, 29, 23, i)),
    })),
  );
  await Session.create({
    userId: bobId,
    sessionTime: 25,
    sessionSuccess: true,
    startTime,
    endTime: new Date('2024-02-29T23:00:00Z'),
  });
  await Session.create({
    userId: aliceId,
    sessionTime: 25,
    sessionSuccess: true,
    startTime,
    endTime: new Date('2024-03-01T00:00:00Z'),
  });
  const first = await alice
    .get('/api/sessions/nursery?month=2024-02')
    .expect(200);
  const second = await alice
    .get('/api/sessions/nursery?month=2024-02&page=2')
    .expect(200);
  assert.equal(first.body.total, 28);
  assert.equal(first.body.pages, 2);
  assert.equal(first.body.sessions.length, 25);
  assert.equal(second.body.sessions.length, 3);
  const plants = [...first.body.sessions, ...second.body.sessions];
  assert.equal(new Set(plants.map((item) => item._id)).size, 28);
  assert.equal(plants.filter((item) => item.sessionSuccess).length, 18);
  assert.equal(plants.filter((item) => !item.sessionSuccess).length, 10);
  assert.deepEqual(Object.keys(plants[0]).sort(), [
    '_id',
    'endTime',
    'sessionSuccess',
    'sessionTime',
  ]);
  await alice.get('/api/sessions/nursery?month=2024-13').expect(400);
  await alice.get('/api/sessions/nursery?month=2024-02&limit=26').expect(400);
  await alice.get('/api/sessions/nursery?month=2024-02&page=-1').expect(400);
  const empty = await alice
    .get('/api/sessions/nursery?month=2024-01')
    .expect(200);
  assert.deepEqual(empty.body.sessions, []);
  await request(app).get('/api/sessions/nursery?month=2024-02').expect(401);
});

test('daily login is visible with milestones disabled and repeated sign-ins pay only once', async () => {
  const key = require('../../services/dailyLogin').dailyLogin().key;
  const record = await Challenge.findOne({ userId: aliceId, key });
  assert.equal(record.isRedeemed, true);
  assert.equal(record.coins, 10);
  assert.equal(
    await Transaction.countDocuments({ user: aliceId, requestId: key }),
    1,
  );
  const balance = (await User.findById(aliceId)).wallet.balance;
  const results = await Promise.all(
    [1, 2, 3].map(() => post(alice, '/challenges/redeem/daily-login')),
  );
  assert.ok(results.every((r) => r.status === 200 && r.body.replayed));
  assert.equal((await User.findById(aliceId)).wallet.balance, balance);
  const list = await alice.get('/api/challenges').expect(200);
  assert.equal(list.body.challenges[0]._id, 'daily-login');
  assert.equal(list.body.challenges[0].isRedeemed, true);
  await post(alice, '/challenges/redeem/daily-login', {
    coins: 999,
    date: '2099-01-01',
  }).expect(400);
  await post(request(app), '/challenges/redeem/daily-login').expect(401);
});

test('daily login serializes first claims, resets at UTC midnight, and rolls back on ledger failure', async () => {
  const { claimDailyLogin, dailyLogin } = require('../../services/dailyLogin');
  const before = (await User.findById(aliceId)).wallet.balance;
  const date = new Date('2040-02-29T23:59:59.999Z');
  const results = await Promise.all(
    [1, 2, 3, 4].map(() => claimDailyLogin(aliceId, date)),
  );
  assert.equal(results.filter((r) => !r.replayed).length, 1);
  assert.equal((await User.findById(aliceId)).wallet.balance, before + 10);
  assert.equal(results[0].resetsAt, '2040-03-01T00:00:00.000Z');
  assert.equal(
    await Transaction.countDocuments({
      user: aliceId,
      requestId: dailyLogin(date).key,
    }),
    1,
  );
  const next = new Date('2040-03-01T00:00:00.000Z');
  const create = Transaction.create;
  Transaction.create = async () => {
    throw new Error('daily ledger failure');
  };
  try {
    await assert.rejects(
      claimDailyLogin(aliceId, next),
      /daily ledger failure/,
    );
  } finally {
    Transaction.create = create;
  }
  assert.equal((await User.findById(aliceId)).wallet.balance, before + 10);
  assert.equal(
    await Challenge.countDocuments({
      userId: aliceId,
      key: dailyLogin(next).key,
    }),
    0,
  );
  assert.equal((await claimDailyLogin(aliceId, next)).replayed, false);
  assert.equal((await User.findById(aliceId)).wallet.balance, before + 20);
});

test('leaderboard preferences update only the authenticated account and ranks reflect new completions', async () => {
  const preference = (body) =>
    alice
      .patch('/api/social/rankings/preference')
      .set('X-Bagiya-Request', '1')
      .send(body);
  await preference({ rankingOptIn: true, userId: bobId }).expect(400);
  await preference({ rankingOptIn: 'true' }).expect(400);
  const result = await preference({ rankingOptIn: true }).expect(200);
  assert.equal(result.body.user.rankingOptIn, true);
  const rows = (await alice.get('/api/social/rankings?period=all').expect(200))
    .body.rankings;
  assert.ok(rows.some((row) => row._id === aliceId));
  await preference({ rankingOptIn: false }).expect(200);
  assert.ok(
    !(
      await alice.get('/api/social/rankings?period=all').expect(200)
    ).body.rankings.some((row) => row._id === aliceId),
  );
});

test('calendar aggregates three successful and two interrupted sessions on their UTC date only', async () => {
  const endTime = new Date('2041-10-24T23:59:59.999Z');
  await Session.insertMany(
    Array.from({ length: 5 }, (_, i) => ({
      userId: aliceId,
      sessionTime: 25,
      sessionSuccess: i < 3,
      active: false,
      startTime: new Date(+endTime - 25 * 60000),
      endTime,
    })),
  );
  await Session.create({
    userId: bobId,
    sessionTime: 90,
    sessionSuccess: true,
    startTime: endTime,
    endTime,
  });
  await Session.create({
    userId: aliceId,
    sessionTime: 5,
    sessionSuccess: false,
    active: false,
    startTime: new Date('2041-10-25T00:00:00Z'),
    endTime: new Date('2041-10-25T00:05:00Z'),
  });
  const result = await alice
    .get('/api/sessions/activity?month=2041-10')
    .expect(200);
  assert.deepEqual(result.body.days, [
    { _id: '2041-10-24', minutes: 75, completed: 3, cancelled: 2 },
    { _id: '2041-10-25', minutes: 0, completed: 0, cancelled: 1 },
  ]);
  assert.deepEqual(
    (await alice.get('/api/sessions/activity?month=2041-11').expect(200)).body
      .days,
    [],
  );
});

const startStrict = (agent, extra = {}) =>
  post(agent, '/sessions/start', {
    sessionTime: 5,
    requestId: randomUUID(),
    strictMode: true,
    allowedLinks: ['https://example.com/lesson'],
    ...extra,
  }).set('Origin', 'http://localhost:5173');
const checkIn = (id, token, body = { action: 'heartbeat' }) =>
  request(app)
    .post(`/api/focus-monitor/${id}`)
    .set('Authorization', `Bearer ${token}`)
    .send(body);

test('strict start validates its origin, hides monitor hashes, and rejects pause or mode changes', async () => {
  await post(alice, '/sessions/start', {
    sessionTime: 5,
    requestId: randomUUID(),
    strictMode: true,
  }).expect(400);
  const requestId = randomUUID();
  const first = await startStrict(alice, { requestId }).expect(201);
  const { session, monitorToken } = first.body;
  assert.match(monitorToken, /^[a-f0-9]{64}$/);
  assert.equal(session.monitorTokenHash, undefined);
  assert.equal(session.appOrigin, 'http://localhost:5173');
  assert.equal(
    (await alice.get('/api/sessions/active')).body.session.monitorTokenHash,
    undefined,
  );
  await post(alice, `/sessions/${session._id}/action`, {
    action: 'pause',
  }).expect(409);
  await post(alice, `/sessions/${session._id}/action`, {
    action: 'complete',
  }).expect(409);
  await post(alice, '/sessions/start', { sessionTime: 5, requestId }).expect(
    409,
  );
  await startStrict(alice, {
    requestId,
    allowedLinks: ['https://other.test'],
  }).expect(409);
  const retry = await startStrict(alice, { requestId }).expect(201);
  assert.equal(retry.body.session._id, session._id);
  await checkIn(session._id, monitorToken).expect(401);
  await checkIn(session._id, retry.body.monitorToken).expect(200);
  await post(alice, `/sessions/${session._id}/action`, {
    action: 'cancel',
  }).expect(200);
});

test('monitor capability is session-bound, needs no cookie, and rejects unknown payload fields', async () => {
  const first = await startStrict(alice).expect(201);
  const id = first.body.session._id,
    token = first.body.monitorToken;
  await checkIn(id, '0'.repeat(64)).expect(401);
  await checkIn(new mongoose.Types.ObjectId(), token).expect(401);
  await checkIn(id, token, {
    action: 'heartbeat',
    url: 'https://example.com',
    reward: 999,
  }).expect(400);
  await request(app)
    .post(`/api/focus-monitor/${id}`)
    .send({ action: 'heartbeat' })
    .expect(401);
  const balance = (await User.findById(aliceId)).wallet.balance;
  const result = await checkIn(id, token, {
    action: 'violation',
    reason: 'outside-allowlist',
  }).expect(200);
  assert.equal(result.body.session.status, 'cancelled');
  assert.equal(result.body.session.interruptionReason, 'outside-allowlist');
  assert.equal(result.body.session.reward, 0);
  const replay = await checkIn(id, token).expect(200);
  assert.equal(replay.body.session.active, false);
  assert.equal((await User.findById(aliceId)).wallet.balance, balance);
  assert.equal(
    await Transaction.countDocuments({ requestId: `focus:${id}` }),
    0,
  );
});

test('strict completion requires a fresh monitor check and awards once under concurrent requests', async () => {
  const first = await startStrict(alice).expect(201);
  const id = first.body.session._id,
    token = first.body.monitorToken;
  await Session.updateOne(
    { _id: id },
    { $set: { resumedAt: new Date(Date.now() - 301000) } },
  );
  await post(alice, `/sessions/${id}/action`, { action: 'complete' }).expect(
    409,
  );
  const balance = (await User.findById(aliceId)).wallet.balance;
  const results = await Promise.all([checkIn(id, token), checkIn(id, token)]);
  assert.ok(
    results.every(
      (result) => result.status === 200 && result.body.session.sessionSuccess,
    ),
  );
  assert.equal((await User.findById(aliceId)).wallet.balance, balance + 500);
  assert.equal(
    await Transaction.countDocuments({ requestId: `focus:${id}` }),
    1,
  );
});

test('late check-ins cannot revive or reward a strict session, even after the planned finish', async () => {
  const first = await startStrict(alice).expect(201);
  const id = first.body.session._id,
    token = first.body.monitorToken;
  const deadline = new Date(Date.now() - 1000);
  await Session.updateOne(
    { _id: id },
    {
      $set: {
        resumedAt: new Date(Date.now() - 301000),
        strictDeadline: deadline,
      },
    },
  );
  const balance = (await User.findById(aliceId)).wallet.balance;
  const result = await checkIn(id, token).expect(200);
  assert.equal(result.body.session.interruptionReason, 'monitoring-lost');
  assert.equal(result.body.session.endTime, deadline.toISOString());
  assert.equal(result.body.session.sessionSuccess, false);
  assert.equal((await User.findById(aliceId)).wallet.balance, balance);
  assert.equal(
    await Transaction.countDocuments({ requestId: `focus:${id}` }),
    0,
  );
});

test('expiry sweep persists a failed session without a browser and leaves normal sessions alone', async () => {
  const strict = await startStrict(alice).expect(201);
  const normal = await focus.start(bobId, {
    sessionTime: 5,
    requestId: randomUUID(),
  });
  const deadline = new Date(Date.now() - 1000);
  await Session.updateOne(
    { _id: strict.body.session._id },
    { $set: { strictDeadline: deadline } },
  );
  await focus.expireStrict();
  await focus.expireStrict();
  const item = await Session.findById(strict.body.session._id);
  assert.equal(item.active, false);
  assert.equal(item.interruptionReason, 'monitoring-lost');
  assert.equal((await Session.findById(normal._id)).active, true);
  const recovered = await alice.get('/api/sessions/active').expect(200);
  assert.equal(recovered.body.session, null);
  assert.equal(recovered.body.lastSession._id, String(item._id));
  await focus.act(bobId, normal._id, 'cancel');
});

test('strict reward and session completion roll back if the ledger write fails', async () => {
  const first = await startStrict(alice).expect(201);
  const id = first.body.session._id,
    token = first.body.monitorToken;
  await Session.updateOne(
    { _id: id },
    { $set: { resumedAt: new Date(Date.now() - 301000) } },
  );
  const balance = (await User.findById(aliceId)).wallet.balance;
  const create = Transaction.create;
  Transaction.create = async () => {
    throw new Error('strict ledger failure');
  };
  try {
    await assert.rejects(
      focus.monitor(id, token, { action: 'heartbeat' }),
      /strict ledger failure/,
    );
  } finally {
    Transaction.create = create;
  }
  assert.equal((await Session.findById(id)).active, true);
  assert.equal((await User.findById(aliceId)).wallet.balance, balance);
  await checkIn(id, token).expect(200);
});
