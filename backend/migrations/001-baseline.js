// Immutable once applied. Add a new migration for subsequent changes.
async function preflight(db) {
  for (const field of ['username', 'email']) {
    const invalid = await db.collection('users').findOne({
      $or: [{ [field]: { $not: { $type: 'string' } } }, { [field]: '' }],
    });
    if (invalid)
      throw new Error(
        `Legacy users contain invalid ${field}; repair after a backup`,
      );
    const duplicates = await db
      .collection('users')
      .aggregate([
        {
          $group: {
            _id: { $toLower: { $trim: { input: `$${field}` } } },
            n: { $sum: 1 },
          },
        },
        { $match: { n: { $gt: 1 } } },
        { $limit: 1 },
      ])
      .toArray();
    if (duplicates.length)
      throw new Error(
        `Duplicate normalized ${field}; resolve manually before migration`,
      );
  }
  const badWallet = await db.collection('users').findOne({
    $or: [{ 'wallet.balance': { $lt: 0 } }, { 'wallet.trees': { $lt: 0 } }],
  });
  if (badWallet)
    throw new Error(
      'Negative legacy wallet value; reconcile ledger before migration',
    );
  for (const [collection, field] of [
    ['sessions', 'userId'],
    ['transactions', 'user'],
    ['challenges', 'userId'],
  ]) {
    const orphan = await db
      .collection(collection)
      .aggregate([
        {
          $lookup: {
            from: 'users',
            localField: field,
            foreignField: '_id',
            as: 'owner',
          },
        },
        { $match: { owner: { $size: 0 } } },
        { $limit: 1 },
      ])
      .toArray();
    if (orphan.length)
      throw new Error(`Orphaned ${collection}; review before migration`);
  }
}
async function up(db) {
  await preflight(db);
  // Normalize only after collision checks; preserve IDs, passwords, history and wallet amounts.
  await db.collection('users').updateMany({}, [
    {
      $set: {
        email: { $toLower: { $trim: { input: '$email' } } },
        username: { $toLower: { $trim: { input: '$username' } } },
        rankingOptIn: { $ifNull: ['$rankingOptIn', false] },
        'wallet.balance': { $ifNull: ['$wallet.balance', 0] },
        'wallet.trees': { $ifNull: ['$wallet.trees', 0] },
      },
    },
  ]);
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('users').createIndex({ username: 1 }, { unique: true });
  await db
    .collection('sessions')
    .createIndex({ userId: 1, startTime: -1, _id: -1 });
  await db
    .collection('sessions')
    .createIndex({ userId: 1, sessionSuccess: 1, endTime: 1 });
  await db
    .collection('sessions')
    .createIndex({ sessionSuccess: 1, endTime: 1, userId: 1 });
  await db.collection('sessions').createIndex(
    { userId: 1, active: 1 },
    {
      unique: true,
      partialFilterExpression: { active: true },
      name: 'one_active_session',
    },
  );
  await db.collection('sessions').createIndex(
    { userId: 1, requestId: 1 },
    {
      unique: true,
      partialFilterExpression: { requestId: { $type: 'string' } },
    },
  );
  await db
    .collection('transactions')
    .createIndex({ user: 1, createdAt: -1, _id: -1 });
  await db.collection('transactions').createIndex(
    { user: 1, requestId: 1 },
    {
      unique: true,
      partialFilterExpression: { requestId: { $type: 'string' } },
    },
  );
  await db.collection('challenges').createIndex({ userId: 1, createdAt: 1 });
  await db
    .collection('challenges')
    .createIndex(
      { userId: 1, key: 1 },
      { unique: true, partialFilterExpression: { key: { $type: 'string' } } },
    );
  await db.collection('friendships').createIndex({ pair: 1 }, { unique: true });
  await db
    .collection('friendships')
    .createIndex({ requester: 1, createdAt: -1 });
  await db
    .collection('friendships')
    .createIndex({ recipient: 1, createdAt: -1 });
}
module.exports = { up, preflight };
