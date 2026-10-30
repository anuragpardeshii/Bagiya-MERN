const { normalizePhone } = require('../lib/identity');
async function up(db) {
  // Preserve original contact details and shared legacy numbers. Ambiguous phone logins are rejected.
  const cursor = db.collection('users').find({}, { projection: { phone: 1 } });
  let writes = [];
  for await (const user of cursor) {
    const phoneNormalized = normalizePhone(user.phone);
    writes.push({
      updateOne: {
        filter: { _id: user._id },
        update: phoneNormalized
          ? { $set: { phoneNormalized } }
          : { $unset: { phoneNormalized: '' } },
      },
    });
    if (writes.length === 500) {
      await db.collection('users').bulkWrite(writes);
      writes = [];
    }
  }
  if (writes.length) await db.collection('users').bulkWrite(writes);
  await db
    .collection('users')
    .createIndex({ phoneNormalized: 1 }, { name: 'phone_login' });
}
module.exports = { up };
