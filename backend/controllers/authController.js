const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { HttpError } = require('../lib/http');
const { safeUser } = require('../services/users');
const { normalizePhone } = require('../lib/identity');
const { claimDailyLogin } = require('../services/dailyLogin');
const signup = async (req, res) => {
  const password = await bcrypt.hash(req.body.password, 12);
  await User.create({
    ...req.body,
    password,
    phoneNormalized: normalizePhone(req.body.phone),
  });
  res.status(201).json({ message: 'Account created. You can now sign in.' });
};
// A valid dummy hash keeps missing-user requests on the same password-comparison path.
const dummyHash = bcrypt.hashSync('not-a-user-password', 12);
const login = async (req, res) => {
  const identifier = (req.body.identifier || req.body.email).toLowerCase();
  const phone = normalizePhone(identifier);
  const query = identifier.includes('@')
    ? { email: identifier }
    : {
        $or: [
          { username: identifier },
          ...(phone ? [{ phoneNormalized: phone }] : []),
        ],
      };
  // Shared legacy numbers and numeric-username collisions must never choose an arbitrary account.
  const matches = await User.find(query).select('+password').limit(2);
  const user = matches.length === 1 ? matches[0] : null;
  const valid = await bcrypt.compare(
    req.body.password,
    user?.password || dummyHash,
  );
  if (!user || !valid)
    throw new HttpError(
      401,
      'Sign-in details are incorrect. If your phone number is shared, use your email or username.',
    );
  const dailyReward = await claimDailyLogin(user._id);
  await new Promise((resolve, reject) =>
    req.session.regenerate((error) => (error ? reject(error) : resolve())),
  );
  req.session.userId = String(user._id);
  await new Promise((resolve, reject) =>
    req.session.save((error) => (error ? reject(error) : resolve())),
  );
  res.json({
    user: safeUser(await User.findById(user._id)),
    dailyReward: {
      coins: dailyReward.replayed ? 0 : 10,
      resetsAt: dailyReward.resetsAt,
    },
  });
};
const checkAuth = (req, res) => res.json(safeUser(req.user));
const logout = async (req, res) => {
  await new Promise((resolve, reject) =>
    req.session.destroy((error) => (error ? reject(error) : resolve())),
  );
  res.clearCookie('bagiya.sid', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: req.app.locals.production,
  });
  res.json({ message: 'Signed out' });
};
module.exports = { signup, login, checkAuth, logout };
