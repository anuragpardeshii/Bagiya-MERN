const router = require('express').Router();
const { owner } = require('../middleware/authMiddleware');
const { asyncRoute, validate } = require('../lib/http');
const { profile } = require('../lib/validation');
const c = require('../controllers/userController');
router.get('/balance/:userId', owner, c.getBalance);
router.get('/:userId', owner, c.getUser);
router.put('/:userId', owner, validate(profile), asyncRoute(c.updateUser));
module.exports = router;
