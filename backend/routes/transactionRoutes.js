const router = require('express').Router();
const c = require('../controllers/transactionController');
const { asyncRoute, validate } = require('../lib/http');
const { owner } = require('../middleware/authMiddleware');
router.post('/reward', c.rewardUser);
router.post(
  '/spend',
  validate(require('../lib/validation').purchase),
  asyncRoute(c.spendCoins),
);
router.get('/:userId', owner, asyncRoute(c.getTransactions));
module.exports = router;
