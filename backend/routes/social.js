const router = require('express').Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Friendship = require('../models/Friendship');
const Session = require('../models/session');
const { asyncRoute, HttpError, pagination, validate } = require('../lib/http');
const { z } = require('zod');
const { safeUser } = require('../services/users');
router.patch(
  '/rankings/preference',
  validate(z.object({ rankingOptIn: z.boolean() }).strict()),
  asyncRoute(async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { rankingOptIn: req.body.rankingOptIn } },
      { new: true },
    );
    res.json({ user: safeUser(user) });
  }),
);
router.get(
  '/search',
  asyncRoute(async (req, res) => {
    const q = req.query.q;
    if (typeof q !== 'string' || !/^[a-zA-Z0-9_]{2,30}$/.test(q))
      throw new HttpError(400, 'Search with at least two username characters');
    const users = await User.find({
      _id: { $ne: req.user._id },
      username: { $regex: `^${q.toLowerCase()}` },
    })
      .select('username name')
      .sort({ username: 1 })
      .limit(20)
      .lean();
    res.json({ users });
  }),
);
router.get(
  '/friends',
  asyncRoute(async (req, res) => {
    const { limit, skip, page } = pagination(req.query);
    const query = {
      $or: [{ requester: req.user._id }, { recipient: req.user._id }],
    };
    const [friends, total] = await Promise.all([
      Friendship.find(query)
        .populate('requester recipient', 'name username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Friendship.countDocuments(query),
    ]);
    res.json({ friends, total, page, pages: Math.ceil(total / limit) });
  }),
);
router.post(
  '/friends/:userId',
  asyncRoute(async (req, res) => {
    const id = req.params.userId;
    if (!mongoose.isValidObjectId(id) || id === String(req.user._id))
      throw new HttpError(400, 'Choose another member');
    if (!(await User.exists({ _id: id })))
      throw new HttpError(404, 'Member not found');
    const pair = [String(req.user._id), id].sort().join(':');
    const friend = await Friendship.findOneAndUpdate(
      { pair },
      { $setOnInsert: { pair, requester: req.user._id, recipient: id } },
      { upsert: true, new: true },
    );
    res.status(201).json({ friend });
  }),
);
router.patch(
  '/friends/:id',
  asyncRoute(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id))
      throw new HttpError(400, 'Invalid request ID');
    const friend = await Friendship.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id, status: 'pending' },
      { $set: { status: 'accepted' } },
      { new: true },
    );
    if (!friend) throw new HttpError(404, 'Pending request not found');
    res.json({ friend });
  }),
);
router.delete(
  '/friends/:id',
  asyncRoute(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id))
      throw new HttpError(400, 'Invalid request ID');
    const friend = await Friendship.findOneAndDelete({
      _id: req.params.id,
      $or: [{ requester: req.user._id }, { recipient: req.user._id }],
    });
    if (!friend) throw new HttpError(404, 'Connection not found');
    res.json({ message: 'Connection removed' });
  }),
);
router.get(
  '/rankings',
  asyncRoute(async (req, res) => {
    const period = req.query.period || 'week';
    if (!['week', 'month', 'all'].includes(period))
      throw new HttpError(400, 'Invalid ranking period');
    const { page, limit, skip } = pagination(req.query),
      now = new Date(),
      start = new Date(now);
    start.setUTCHours(0, 0, 0, 0);
    if (period === 'week')
      start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7));
    if (period === 'month') start.setUTCDate(1);
    const match = { sessionSuccess: true, endTime: { $lte: now } };
    if (period !== 'all') match.endTime.$gte = start;
    const [result] = await Session.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$userId',
          minutes: { $sum: '$sessionTime' },
          sessions: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'member',
        },
      },
      { $unwind: '$member' },
      { $match: { 'member.rankingOptIn': true } },
      { $sort: { minutes: -1, _id: 1 } },
      {
        $facet: {
          rows: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                minutes: 1,
                sessions: 1,
                username: '$member.username',
                name: '$member.name',
                trees: '$member.wallet.trees',
              },
            },
          ],
          total: [{ $count: 'count' }],
        },
      },
    ]);
    res.json({
      rankings: result.rows.map((r, i) => ({ ...r, rank: skip + i + 1 })),
      page,
      total: result.total[0]?.count || 0,
      pages: Math.ceil((result.total[0]?.count || 0) / limit),
    });
  }),
);
module.exports = router;
