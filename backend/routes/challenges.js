const router = require('express').Router();
const mongoose = require('mongoose');
const Challenge = require('../models/Challenge');
const Session = require('../models/session');
const User = require('../models/User');
const Transaction = require('../models/transaction');
const { asyncRoute, HttpError } = require('../lib/http');
const { summary } = require('../services/analytics');
const { dailyLogin, claimDailyLogin } = require('../services/dailyLogin');
const definitions = [
  {
    key: 'first-session',
    title: 'A little beginning',
    description: 'Complete your first focus session.',
    coins: 250,
    requiredSessions: 1,
    requiredMinutes: 0,
  },
  {
    key: 'one-hour',
    title: 'An hour for yourself',
    description: 'Build up 60 minutes of completed focus.',
    coins: 500,
    requiredMinutes: 60,
    requiredSessions: 0,
  },
  {
    key: 'five-sessions',
    title: 'Roots of a routine',
    description: 'Complete five focus sessions.',
    coins: 1000,
    requiredSessions: 5,
    requiredMinutes: 0,
  },
];
router.get(
  '/',
  asyncRoute(async (req, res) => {
    const daily = dailyLogin();
    const [stats, records, dailyRecord] = await Promise.all([
      summary(req.user._id),
      Challenge.find({
        userId: req.user._id,
        $or: [
          { key: { $in: definitions.map((item) => item.key) } },
          { key: { $exists: false } },
          { key: null },
        ],
      })
        .sort({ createdAt: 1 })
        .limit(100)
        .lean(),
      Challenge.findOne({ userId: req.user._id, key: daily.key }).lean(),
    ]);
    const all = [
      ...(req.app.locals.milestonesEnabled ? definitions : []).map((d) => ({
        ...d,
        _id: d.key,
        isRedeemed: records.some((r) => r.key === d.key && r.isRedeemed),
      })),
      ...records.filter((r) => !r.key),
    ];
    res.json({
      challenges: [
        {
          ...daily,
          _id: 'daily-login',
          recurring: true,
          eligible: true,
          isRedeemed: Boolean(dailyRecord?.isRedeemed),
        },
        ...all.map((item) => ({
          ...item,
          eligible:
            Number.isFinite(item.requiredMinutes) &&
            Number.isFinite(item.requiredSessions) &&
            stats.totalMinutes >= item.requiredMinutes &&
            stats.successfulSessions >= item.requiredSessions,
        })),
      ],
      stats,
    });
  }),
);
router.post(
  '/redeem/:id',
  asyncRoute(async (req, res) => {
    if (req.params.id === 'daily-login') {
      if (Object.keys(req.body).length)
        throw new HttpError(
          400,
          'Daily login rewards use the current server date',
        );
      return res.json(await claimDailyLogin(req.user._id));
    }
    const definition =
      req.app.locals.milestonesEnabled &&
      definitions.find((d) => d.key === req.params.id);
    const result = await mongoose.connection.transaction(async (session) => {
      let challenge;
      if (definition) {
        challenge = await Challenge.findOneAndUpdate(
          { userId: req.user._id, key: definition.key },
          { $setOnInsert: { ...definition, userId: req.user._id } },
          { upsert: true, new: true, session },
        );
      } else {
        if (!mongoose.isValidObjectId(req.params.id))
          throw new HttpError(404, 'Challenge not found');
        challenge = await Challenge.findOne({
          _id: req.params.id,
          userId: req.user._id,
        }).session(session);
      }
      if (!challenge) throw new HttpError(404, 'Challenge not found');
      if (challenge.key && !definition)
        throw new HttpError(404, 'Challenge not found');
      if (challenge.isRedeemed) return { challenge, replayed: true };
      if (
        !Number.isFinite(challenge.requiredMinutes) ||
        !Number.isFinite(challenge.requiredSessions)
      )
        throw new HttpError(
          409,
          'This legacy challenge needs eligibility review before redemption',
        );
      const [stats] = await Session.aggregate([
        { $match: { userId: req.user._id, sessionSuccess: true } },
        {
          $group: {
            _id: null,
            minutes: { $sum: '$sessionTime' },
            count: { $sum: 1 },
          },
        },
      ]).session(session);
      if (
        (stats?.minutes || 0) < challenge.requiredMinutes ||
        (stats?.count || 0) < challenge.requiredSessions
      )
        throw new HttpError(409, 'Complete the challenge requirements first');
      challenge.isRedeemed = true;
      await challenge.save({ session });
      await User.updateOne(
        { _id: req.user._id },
        { $inc: { 'wallet.balance': challenge.coins } },
        { session },
      );
      await Transaction.create(
        [
          {
            user: req.user._id,
            type: 'earn',
            amount: challenge.coins,
            reference: challenge.title,
            requestId: `challenge:${challenge._id}`,
          },
        ],
        { session },
      );
      return { challenge, replayed: false };
    });
    res.json(result);
  }),
);
module.exports = router;
