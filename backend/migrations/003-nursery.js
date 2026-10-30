async function up(db) {
  await db
    .collection('sessions')
    .createIndex({ userId: 1, endTime: 1, _id: 1 }, { name: 'nursery_month' });
}
module.exports = { up };
