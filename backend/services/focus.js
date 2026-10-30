const mongoose = require('mongoose');
const Session = require('../models/session');
const User = require('../models/User');
const Transaction = require('../models/transaction');
const { HttpError } = require('../lib/http');
const { randomBytes, createHash } = require('node:crypto');
const COINS_PER_MINUTE = 100;
const STRICT_GRACE_MS = 90000;
const tokenHash = (token) => createHash('sha256').update(token).digest('hex');
function elapsed(session, now = new Date()) {
  return (
    Math.max(0, session.elapsedMs || 0) +
    (session.status === 'running'
      ? Math.max(0, now - new Date(session.resumedAt))
      : 0)
  );
}
function view(session, now = new Date()) {
  const result = session.toObject ? session.toObject() : { ...session };
  delete result.monitorTokenHash;
  return {
    ...result,
    remainingMs: Math.max(0, result.sessionTime * 60000 - elapsed(result, now)),
    serverTime: now.toISOString(),
  };
}
async function start(userId, input, now = new Date()) {
  await expireStrict(now, userId);
  const existing = await Session.findOne({
    userId,
    requestId: input.requestId,
  });
  if (existing) {
    if (
      existing.sessionTime !== input.sessionTime ||
      Boolean(existing.strictMode) !== Boolean(input.strictMode) ||
      (input.strictMode &&
        (existing.appOrigin !== input.appOrigin ||
          JSON.stringify(existing.allowedLinks || []) !==
            JSON.stringify(input.allowedLinks || [])))
    )
      throw new HttpError(
        409,
        'Request ID was already used for a different duration',
      );
    return view(existing, now);
  }
  const active = await Session.findOne({ userId, active: true });
  if (active)
    throw new HttpError(409, 'Finish your current focus session first');
  const session = await Session.create({
    userId,
    ...input,
    startTime: now,
    resumedAt: now,
    status: 'running',
    active: true,
    ...(input.strictMode
      ? { strictDeadline: new Date(+now + STRICT_GRACE_MS) }
      : {}),
  });
  return view(session, now);
}
async function act(userId, id, action, now = new Date()) {
  if (!mongoose.isValidObjectId(id))
    throw new HttpError(400, 'Invalid session ID');
  return mongoose.connection.transaction(async (dbSession) => {
    const item = await Session.findOne({ _id: id, userId }).session(dbSession);
    if (!item) throw new HttpError(404, 'Focus session not found');
    if (!item.active) {
      if (
        (action === 'complete' && item.status === 'completed') ||
        (action === 'cancel' && item.status === 'cancelled')
      )
        return view(item, now);
      throw new HttpError(409, 'This session has already ended');
    }
    if (item.strictMode) {
      if (now >= item.strictDeadline) {
        interrupt(item, 'monitoring-lost', item.strictDeadline);
        await item.save({ session: dbSession });
        return view(item, now);
      }
      if (action !== 'cancel')
        throw new HttpError(
          409,
          'The extension verifies Strict focus sessions; pausing is unavailable',
        );
    }
    const spent = elapsed(item, now);
    if (action === 'pause') {
      if (item.status === 'running') {
        item.elapsedMs = spent;
        item.status = 'paused';
        item.resumedAt = null;
      }
    } else if (action === 'resume') {
      if (item.status === 'paused') {
        item.status = 'running';
        item.resumedAt = now;
      }
    } else {
      if (action === 'complete' && spent < item.sessionTime * 60000)
        throw new HttpError(409, 'Your focus session is not finished yet');
      item.elapsedMs = Math.min(spent, item.sessionTime * 60000);
      item.active = false;
      item.status = action === 'complete' ? 'completed' : 'cancelled';
      item.sessionSuccess = action === 'complete';
      item.endTime = now;
      item.resumedAt = null;
      if (item.sessionSuccess) {
        item.reward = item.sessionTime * COINS_PER_MINUTE;
        await User.updateOne(
          { _id: userId },
          { $inc: { 'wallet.balance': item.reward } },
          { session: dbSession },
        );
        await Transaction.create(
          [
            {
              user: userId,
              type: 'earn',
              amount: item.reward,
              reference: 'Focus session completed',
              requestId: `focus:${item._id}`,
            },
          ],
          { session: dbSession },
        );
      }
    }
    await item.save({ session: dbSession });
    return view(item, now);
  });
}
function interrupt(item, reason, now) {
  item.elapsedMs = Math.min(item.sessionTime * 60000, elapsed(item, now));
  item.active = false;
  item.status = 'cancelled';
  item.sessionSuccess = false;
  item.reward = 0;
  item.endTime = now;
  item.resumedAt = null;
  item.interruptionReason = reason;
}
async function expireStrict(now = new Date(), userId) {
  return Session.updateMany(
    {
      active: true,
      strictMode: true,
      strictDeadline: { $lte: now },
      ...(userId ? { userId } : {}),
    },
    [
      {
        $set: {
          active: false,
          status: 'cancelled',
          sessionSuccess: false,
          reward: 0,
          endTime: '$strictDeadline',
          interruptionReason: 'monitoring-lost',
          resumedAt: null,
          elapsedMs: {
            $min: [
              { $multiply: ['$sessionTime', 60000] },
              { $max: [0, { $subtract: ['$strictDeadline', '$startTime'] }] },
            ],
          },
        },
      },
    ],
  );
}
async function attachMonitor(userId, id, now = new Date()) {
  const token = randomBytes(32).toString('hex');
  const item = await Session.findOneAndUpdate(
    {
      _id: id,
      userId,
      active: true,
      strictMode: true,
      strictDeadline: { $gt: now },
    },
    { $set: { monitorTokenHash: tokenHash(token) } },
  );
  if (!item) throw new HttpError(409, 'This Strict focus session has ended');
  return token;
}
async function monitor(id, token, event, now = new Date()) {
  if (!mongoose.isValidObjectId(id) || !/^[a-f0-9]{64}$/.test(token || ''))
    throw new HttpError(401, 'Invalid monitor credential');
  return mongoose.connection.transaction(async (dbSession) => {
    const item = await Session.findOne({
      _id: id,
      strictMode: true,
      monitorTokenHash: tokenHash(token),
    }).session(dbSession);
    if (!item) throw new HttpError(401, 'Invalid monitor credential');
    if (!item.active) return view(item, now);
    if (now >= item.strictDeadline)
      interrupt(item, 'monitoring-lost', item.strictDeadline);
    else if (event.action === 'violation') interrupt(item, event.reason, now);
    else if (elapsed(item, now) >= item.sessionTime * 60000) {
      item.active = false;
      item.status = 'completed';
      item.sessionSuccess = true;
      item.elapsedMs = item.sessionTime * 60000;
      item.endTime = now;
      item.resumedAt = null;
      item.reward = item.sessionTime * COINS_PER_MINUTE;
      await User.updateOne(
        { _id: item.userId },
        { $inc: { 'wallet.balance': item.reward } },
        { session: dbSession },
      );
      await Transaction.create(
        [
          {
            user: item.userId,
            type: 'earn',
            amount: item.reward,
            reference: 'Focus session completed',
            requestId: `focus:${item._id}`,
          },
        ],
        { session: dbSession },
      );
    } else item.strictDeadline = new Date(+now + STRICT_GRACE_MS);
    await item.save({ session: dbSession });
    return view(item, now);
  });
}
module.exports = {
  elapsed,
  view,
  start,
  act,
  COINS_PER_MINUTE,
  STRICT_GRACE_MS,
  expireStrict,
  attachMonitor,
  monitor,
};
