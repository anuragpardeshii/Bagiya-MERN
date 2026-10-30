const router = require('express').Router();
const { rateLimit } = require('express-rate-limit');
const controller = require('../controllers/authController');
const schema = require('../lib/validation');
const { asyncRoute, validate } = require('../lib/http');
const { auth } = require('../middleware/authMiddleware');
const User = require('../models/User');
const availabilityLimiter = rateLimit({
  windowMs: 60000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    message: 'Please wait a moment before checking another username.',
  },
});
router.get(
  '/username-availability',
  availabilityLimiter,
  asyncRoute(async (req, res) => {
    const parsed = schema.username.safeParse(req.query.username);
    if (!parsed.success)
      return res
        .status(400)
        .json({ message: 'Use 3–30 letters, numbers or underscores.' });
    const exists = await User.exists({ username: parsed.data });
    res.json({ username: parsed.data, available: !exists });
  }),
);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again in 15 minutes.' },
});
router.post(
  '/signup',
  limiter,
  validate(schema.signup),
  asyncRoute(controller.signup),
);
router.post(
  '/login',
  limiter,
  validate(schema.login),
  asyncRoute(controller.login),
);
router.get('/check-auth', auth, controller.checkAuth);
router.post('/logout', asyncRoute(controller.logout));
module.exports = router;
