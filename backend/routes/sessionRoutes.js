const router = require('express').Router();
const c = require('../controllers/sessionController');
const { asyncRoute, validate } = require('../lib/http');
const { owner } = require('../middleware/authMiddleware');
const schema = require('../lib/validation');
router.post('/start', validate(schema.start), asyncRoute(c.createSession));
router.get('/active', asyncRoute(c.active));
router.get('/summary', asyncRoute(c.overview));
router.get('/activity', asyncRoute(c.activity));
router.get('/nursery', asyncRoute(c.nursery));
router.post('/:id/action', validate(schema.action), asyncRoute(c.action));
router.get('/user/:userId', owner, asyncRoute(c.getUserSessions));
router.get(
  '/user/:userId/:period(hourly|weekly|monthly)',
  owner,
  asyncRoute(c.chart),
);
router.post('/create', (req, res) =>
  res.status(410).json({
    message: 'Start a server-tracked session with /api/sessions/start',
  }),
);
module.exports = router;
