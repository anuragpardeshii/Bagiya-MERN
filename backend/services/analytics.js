const mongoose = require('mongoose');
const Session = require('../models/session');
function periodStart(period, now = new Date()) {
  const date = new Date(now);
  date.setUTCHours(0, 0, 0, 0);
  if (period === 'weekly')
    date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  if (period === 'monthly') {
    date.setUTCDate(1);
    date.setUTCMonth(date.getUTCMonth() - 11);
  }
  return date;
}
function buckets(period, now = new Date()) {
  const first = periodStart(period, now),
    count = period === 'monthly' ? 12 : period === 'weekly' ? 7 : 24;
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(first);
    if (period === 'monthly') date.setUTCMonth(first.getUTCMonth() + i);
    else if (period === 'weekly') date.setUTCDate(first.getUTCDate() + i);
    else date.setUTCHours(i);
    const key = date
      .toISOString()
      .slice(0, period === 'monthly' ? 7 : period === 'weekly' ? 10 : 13);
    return {
      key,
      label:
        period === 'monthly'
          ? date.toLocaleDateString('en', {
              month: 'short',
              year: '2-digit',
              timeZone: 'UTC',
            })
          : period === 'weekly'
            ? date.toLocaleDateString('en', {
                weekday: 'short',
                timeZone: 'UTC',
              })
            : `${i}:00`,
      timeInvested: 0,
    };
  });
}
async function chart(userId, period, now = new Date()) {
  const format =
    period === 'monthly'
      ? '%Y-%m'
      : period === 'weekly'
        ? '%Y-%m-%d'
        : '%Y-%m-%dT%H';
  const records = await Session.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        sessionSuccess: true,
        endTime: { $gte: periodStart(period, now), $lte: now },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format, date: '$endTime', timezone: 'UTC' } },
        minutes: { $sum: '$sessionTime' },
      },
    },
  ]);
  const lookup = new Map(records.map((r) => [r._id, r.minutes]));
  return buckets(period, now).map((b) => ({
    ...b,
    timeInvested: lookup.get(b.key) || 0,
  }));
}
async function summary(userId, now = new Date()) {
  const result = await Session.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        endTime: { $lte: now },
      },
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        successfulSessions: { $sum: { $cond: ['$sessionSuccess', 1, 0] } },
        totalMinutes: {
          $sum: { $cond: ['$sessionSuccess', '$sessionTime', 0] },
        },
      },
    },
  ]);
  return (
    result[0] || { totalSessions: 0, successfulSessions: 0, totalMinutes: 0 }
  );
}
module.exports = { periodStart, buckets, chart, summary };
