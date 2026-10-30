const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
function loadConfig(env = process.env) {
  const required = ['MONGO_URI', 'SESSION_SECRET', 'CLIENT_ORIGIN'];
  for (const key of required)
    if (!env[key]) throw new Error(`Missing required configuration: ${key}`);
  if (env.SESSION_SECRET.length < 32)
    throw new Error('SESSION_SECRET must have at least 32 characters');
  const production = env.NODE_ENV === 'production';
  if (
    production &&
    /local-development|change|example/i.test(env.SESSION_SECRET)
  )
    throw new Error('Production requires a unique SESSION_SECRET');
  const origins = env.CLIENT_ORIGIN.split(',').map(
    (value) => new URL(value.trim()).origin,
  );
  if (production && origins.some((origin) => !origin.startsWith('https://')))
    throw new Error('Production CLIENT_ORIGIN must use HTTPS');
  const port = Number(env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error('Invalid PORT');
  if (!['0', '1', undefined].includes(env.TRUST_PROXY))
    throw new Error('TRUST_PROXY must be 0 or 1');
  if (!['true', 'false', undefined].includes(env.ENABLE_MILESTONE_CHALLENGES))
    throw new Error('ENABLE_MILESTONE_CHALLENGES must be true or false');
  return {
    mongoUri: env.MONGO_URI,
    milestonesEnabled: env.ENABLE_MILESTONE_CHALLENGES === 'true',
    secret: env.SESSION_SECRET,
    origins,
    production,
    port,
    trustProxy: env.TRUST_PROXY === '1' ? 1 : false,
  };
}
module.exports = { loadConfig };
