const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const { loadConfig } = require('./config');
const { createApp } = require('./app');
const { expireStrict } = require('./services/focus');
async function main() {
  const config = loadConfig();
  mongoose.set('autoIndex', false);
  mongoose.set('bufferCommands', false);
  await mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 10,
  });
  const topology = await mongoose.connection.db.admin().command({ hello: 1 });
  if (!topology.setName)
    throw new Error(
      'MongoDB must run as a replica set for transactional rewards',
    );
  const store = MongoStore.create({
    client: mongoose.connection.getClient(),
    collectionName: 'auth_sessions',
    ttl: 86400,
  });
  const app = createApp(config, store);
  const server = app.listen(config.port, '0.0.0.0', () =>
    console.log(JSON.stringify({ event: 'listening', port: config.port })),
  );
  const sweep = () =>
    expireStrict().catch(() =>
      console.error(JSON.stringify({ event: 'strict_expiry_failed' })),
    );
  await sweep();
  const expiryTimer = setInterval(sweep, 15000);
  expiryTimer.unref();
  const shutdown = () => {
    clearInterval(expiryTimer);
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
main().catch((error) => {
  console.error(
    JSON.stringify({
      event: 'startup_failed',
      message:
        error.name === 'Error'
          ? error.message
          : 'Database startup failed. Check configuration and availability.',
    }),
  );
  process.exit(1);
});
