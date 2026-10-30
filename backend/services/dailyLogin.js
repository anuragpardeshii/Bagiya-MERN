const mongoose = require('mongoose');
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const Transaction = require('../models/transaction');
const { HttpError } = require('../lib/http');

function dailyLogin(now = new Date()) {
  const day = now.toISOString().slice(0, 10);
  const reset = new Date(`${day}T00:00:00.000Z`);
  reset.setUTCDate(reset.getUTCDate() + 1);
  return {
    key: `daily-login:${day}`,
    title: 'Daily login',
    description:
      'A little reward for showing up. Sign in each day to earn 10 coins.',
    coins: 10,
    resetsAt: reset.toISOString(),
  };
}

async function claimDailyLogin(userId, now = new Date()) {
  const { resetsAt, ...definition } = dailyLogin(now);
  return mongoose.connection.transaction(async (session) => {
    const existing = await Challenge.findOne({
      userId,
      key: definition.key,
    }).session(session);
    if (existing?.isRedeemed)
      return { challenge: existing, replayed: true, resetsAt };
    // Writing the user first serializes concurrent claims; a transaction retry
    // then sees the committed daily record. Wallet, challenge and ledger commit together.
    const updated = await User.updateOne(
      { _id: userId },
      { $inc: { 'wallet.balance': definition.coins } },
      { session },
    );
    if (!updated.matchedCount) throw new HttpError(404, 'Account not found');
    const challenge = await Challenge.findOneAndUpdate(
      { userId, key: definition.key },
      { $set: { ...definition, userId, isRedeemed: true } },
      { upsert: true, new: true, session },
    );
    await Transaction.create(
      [
        {
          user: userId,
          type: 'earn',
          amount: definition.coins,
          reference: definition.title,
          requestId: definition.key,
        },
      ],
      { session },
    );
    return { challenge, replayed: false, resetsAt };
  });
}
module.exports = { dailyLogin, claimDailyLogin };
