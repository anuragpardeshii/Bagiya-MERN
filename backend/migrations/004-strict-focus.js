async function up(db) {
  await db
    .collection('sessions')
    .createIndex(
      { userId: 1, createdAt: -1, _id: -1 },
      { name: 'latest_focus_session' },
    );
  await db.collection('sessions').createIndex(
    { strictDeadline: 1 },
    {
      name: 'strict_focus_expiry',
      partialFilterExpression: { active: true, strictMode: true },
    },
  );
}
module.exports = { up };
