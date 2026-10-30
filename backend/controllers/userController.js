const User = require('../models/User');
const { safeUser } = require('../services/users');
const { normalizePhone } = require('../lib/identity');
const getBalance = (req, res) =>
  res.json({ success: true, ...safeUser(req.user).wallet });
const getUser = (req, res) => res.json({ user: safeUser(req.user) });
const updateUser = async (req, res) => {
  const changes = { ...req.body };
  changes.phoneNormalized = normalizePhone(changes.phone);
  if (changes.dob === '') changes.dob = null;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: changes },
    { new: true, runValidators: true },
  );
  res.json({ user: safeUser(user) });
};
module.exports = { getBalance, getUser, updateUser };
