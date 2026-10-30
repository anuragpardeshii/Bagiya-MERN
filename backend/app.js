const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const { randomUUID } = require('node:crypto');
const mongoose = require('mongoose');
const { rateLimit } = require('express-rate-limit');
const { migrationIds } = require('./scripts/migrate');
const { auth } = require('./middleware/authMiddleware');
const { HttpError, errorHandler, asyncRoute } = require('./lib/http');
function createApp(config, store) {
  if (!store) throw new Error('A persistent session store is required');
  const app = express();
  app.locals.production = config.production;
  app.locals.origins = config.origins;
  app.locals.milestonesEnabled = config.milestonesEnabled === true;
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);
  app.use((req, res, next) => {
    req.requestId = randomUUID();
    res.setHeader('X-Request-ID', req.requestId);
    const started = Date.now();
    res.on('finish', () => {
      if (process.env.NODE_ENV !== 'test')
        console.log(
          JSON.stringify({
            event: 'request',
            requestId: req.requestId,
            method: req.method,
            status: res.statusCode,
            durationMs: Date.now() - started,
          }),
        );
    });
    next();
  });
  app.use(helmet());
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.get(
    '/api/ready',
    asyncRoute(async (req, res) => {
      if (mongoose.connection.readyState !== 1)
        throw new HttpError(503, 'Database unavailable');
      const applied = await mongoose.connection.db
        .collection('migrations')
        .countDocuments({ _id: { $in: migrationIds } });
      if (applied !== migrationIds.length)
        throw new HttpError(503, 'Database migrations are pending');
      res.json({ status: 'ready' });
    }),
  );
  app.use('/api/focus-monitor', require('./routes/focusMonitor'));
  app.use(
    cors({
      origin(origin, callback) {
        callback(null, !origin || config.origins.includes(origin));
      },
      credentials: true,
    }),
  );
  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    if (req.get('origin') && !config.origins.includes(req.get('origin')))
      return next(new HttpError(403, 'Origin is not allowed'));
    if (req.get('sec-fetch-site') === 'cross-site')
      return next(new HttpError(403, 'Cross-site requests are not allowed'));
    if (req.get('x-bagiya-request') !== '1')
      return next(new HttpError(403, 'Missing request protection header'));
    if (req.method !== 'DELETE' && !req.is('application/json'))
      return next(new HttpError(415, 'Use application/json'));
    next();
  });
  app.use(express.json({ limit: '32kb' }));
  app.use(
    rateLimit({
      windowMs: 60000,
      limit: 300,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: { message: 'Too many requests. Please try again shortly.' },
    }),
  );
  app.use(
    session({
      name: 'bagiya.sid',
      secret: config.secret,
      store,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: config.production,
        sameSite: 'lax',
        maxAge: 86400000,
      },
    }),
  );
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api', auth);
  for (const [path, file] of [
    ['users', 'userRoutes'],
    ['sessions', 'sessionRoutes'],
    ['transactions', 'transactionRoutes'],
    ['challenges', 'challenges'],
    ['social', 'social'],
  ])
    app.use(`/api/${path}`, require(`./routes/${file}`));
  app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
  app.use(errorHandler);
  return app;
}
module.exports = { createApp };
