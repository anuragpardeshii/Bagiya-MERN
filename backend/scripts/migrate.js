const mongoose = require('mongoose');
const { loadConfig } = require('../config');
const migrations = [
  { id: '001-baseline', ...require('../migrations/001-baseline') },
  { id: '002-phone-login', ...require('../migrations/002-phone-login') },
  { id: '003-nursery', ...require('../migrations/003-nursery') },
  { id: '004-strict-focus', ...require('../migrations/004-strict-focus') },
];
async function run(db, command = 'up') {
  if (command === 'down')
    throw new Error(
      'Baseline normalization is forward-only. Restore a verified backup or apply a reviewed repair migration; no data was changed.',
    );
  if (!['up', 'status'].includes(command))
    throw new Error('Use up, status or down');
  const applied = await db.collection('migrations').find().toArray();
  if (command === 'status')
    return migrations.map((m) => ({
      id: m.id,
      applied: applied.some((a) => a._id === m.id),
    }));
  // No automatic lock expiry: an interrupted runner requires operator inspection.
  try {
    await db
      .collection('migration_locks')
      .insertOne({ _id: 'runner', startedAt: new Date() });
  } catch (error) {
    if (error.code === 11000)
      throw new Error(
        'Migration lock exists. Verify no migration is running before removing the runner lock.',
      );
    throw error;
  }
  try {
    for (const migration of migrations)
      if (!applied.some((a) => a._id === migration.id)) {
        await migration.up(db);
        await db
          .collection('migrations')
          .insertOne({ _id: migration.id, appliedAt: new Date() });
      }
  } finally {
    await db.collection('migration_locks').deleteOne({ _id: 'runner' });
  }
  return run(db, 'status');
}
if (require.main === module)
  (async () => {
    try {
      await mongoose.connect(loadConfig().mongoUri, { autoIndex: false });
      console.log(
        JSON.stringify(
          await run(mongoose.connection.db, process.argv[2] || 'up'),
          null,
          2,
        ),
      );
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    } finally {
      await mongoose.disconnect();
    }
  })();
module.exports = {
  run,
  migrationIds: migrations.map((migration) => migration.id),
};
