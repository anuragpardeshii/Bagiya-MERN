const mongoose = require('mongoose');
const User = require('../models/User');
const { asyncRoute, HttpError } = require('../lib/http');
const auth = asyncRoute(async (req, res, next) => {
  if (!req.session.userId)
    throw new HttpError(401, 'Please sign in to continue');
  req.user = await User.findById(req.session.userId).lean();
  if (!req.user)
    throw new HttpError(401, 'Your account is no longer available');
  next();
});
const owner = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.userId))
    return next(new HttpError(400, 'Invalid user ID'));
  if (String(req.user._id) !== req.params.userId)
    return next(new HttpError(403, 'You cannot access this account'));
  next();
};
module.exports = { auth, owner };
