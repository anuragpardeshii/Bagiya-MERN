const Session = require('../models/session');
const focus = require('../services/focus');
const analytics = require('../services/analytics');
const { pagination, HttpError } = require('../lib/http');
const createSession = async (req, res) => {
  const input = { ...req.body };
  if (input.strictMode) {
    if (!req.app.locals.origins.includes(req.get('origin')))
      throw new HttpError(
        400,
        'Start Strict focus from your Bagiya browser tab',
      );
    input.appOrigin = req.get('origin');
    input.allowedLinks = [...new Set(input.allowedLinks || [])];
  }
  const session = await focus.start(req.user._id, input);
  const monitorToken =
    session.strictMode && session.active
      ? await focus.attachMonitor(req.user._id, session._id)
      : undefined;
  res.status(201).json({ session, ...(monitorToken ? { monitorToken } : {}) });
};
const active = async (req, res) => {
  await focus.expireStrict(new Date(), req.user._id);
  const item = await Session.findOne({
    userId: req.user._id,
    active: true,
  }).lean();
  const last = !item
    ? await Session.findOne({
        userId: req.user._id,
        active: false,
        // Restore only the most recently created session, including normal mode.
      })
        .sort({ createdAt: -1, _id: -1 })
        .lean()
    : null;
  res.json({
    session: item ? focus.view(item) : null,
    lastSession: last?.strictMode ? focus.view(last) : null,
  });
};
const action = async (req, res) =>
  res.json({
    session: await focus.act(req.user._id, req.params.id, req.body.action),
  });
const getUserSessions = async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const query = { userId: req.user._id, active: { $ne: true } };
  const [sessions, total] = await Promise.all([
    Session.find(query)
      .sort({ startTime: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Session.countDocuments(query),
  ]);
  res.json({ sessions, page, total, pages: Math.ceil(total / limit) });
};
const overview = async (req, res) => {
  const period = req.query.period || 'weekly';
  if (!['hourly', 'weekly', 'monthly'].includes(period))
    throw new HttpError(400, 'Invalid period');
  const [stats, chart] = await Promise.all([
    analytics.summary(req.user._id),
    analytics.chart(req.user._id, period),
  ]);
  res.json({
    ...stats,
    wallet: {
      balance: req.user.wallet?.balance || 0,
      trees: req.user.wallet?.trees || 0,
    },
    chart,
    timezone: 'UTC',
  });
};
const chart = async (req, res) =>
  res.json(await analytics.chart(req.user._id, req.params.period));
function monthRange(month) {
  if (typeof month !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month))
    throw new HttpError(400, 'Use a YYYY-MM month');
  const from = new Date(`${month}-01T00:00:00Z`),
    to = new Date(from);
  to.setUTCMonth(to.getUTCMonth() + 1);
  return { from, to };
}
const nursery = async (req, res) => {
  const { from, to } = monthRange(req.query.month);
  const { page, limit, skip } = pagination({
    ...req.query,
    limit: req.query.limit || 25,
  });
  if (limit > 25)
    throw new HttpError(400, 'Use at most 25 plants per nursery plot');
  const query = {
    userId: req.user._id,
    active: { $ne: true },
    endTime: { $gte: from, $lt: to },
  };
  const [sessions, total] = await Promise.all([
    Session.find(query)
      .select('_id sessionTime sessionSuccess endTime')
      .sort({ endTime: 1, _id: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Session.countDocuments(query),
  ]);
  res.json({
    sessions,
    total,
    page,
    pages: Math.ceil(total / limit),
    month: req.query.month,
  });
};
const activity = async (req, res) => {
  const month = req.query.month;
  const { from, to } = monthRange(month);
  const days = await Session.aggregate([
    { $match: { userId: req.user._id, endTime: { $gte: from, $lt: to } } },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$endTime',
            timezone: 'UTC',
          },
        },
        minutes: { $sum: { $cond: ['$sessionSuccess', '$sessionTime', 0] } },
        completed: { $sum: { $cond: ['$sessionSuccess', 1, 0] } },
        cancelled: { $sum: { $cond: ['$sessionSuccess', 0, 1] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  res.json({ days, month });
};
module.exports = {
  createSession,
  active,
  action,
  getUserSessions,
  overview,
  chart,
  activity,
  nursery,
};
