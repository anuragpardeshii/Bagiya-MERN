const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/transaction');
const { HttpError, pagination } = require('../lib/http');
const TREE_PRICE = 2500;
async function purchaseTree(userId, requestId) {
  return mongoose.connection.transaction(async (session) => {
    const prior = await Transaction.findOne({
      user: userId,
      requestId: `tree:${requestId}`,
    }).session(session);
    if (prior) return { transaction: prior, replayed: true };
    const user = await User.findOneAndUpdate(
      { _id: userId, 'wallet.balance': { $gte: TREE_PRICE } },
      { $inc: { 'wallet.balance': -TREE_PRICE, 'wallet.trees': 1 } },
      { new: true, session },
    );
    if (!user) throw new HttpError(409, 'You need 2,500 coins to plant a tree');
    const [transaction] = await Transaction.create(
      [
        {
          user: userId,
          type: 'spend',
          amount: -TREE_PRICE,
          reference: 'Virtual tree planted',
          requestId: `tree:${requestId}`,
        },
      ],
      { session },
    );
    return { transaction, replayed: false };
  });
}
const spendCoins = async (req, res) => {
  const result = await purchaseTree(req.user._id, req.body.requestId);
  const user = await User.findById(req.user._id).select('wallet').lean();
  res.json({
    ...result,
    balance: user.wallet.balance,
    trees: user.wallet.trees,
  });
};
const rewardUser = (req, res) =>
  res.status(410).json({
    message:
      'Coins are awarded automatically when eligible sessions or challenges complete',
  });
const getTransactions = async (req, res) => {
  const { page, limit, skip } = pagination(req.query),
    query = { user: req.user._id };
  const [transactions, total] = await Promise.all([
    Transaction.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Transaction.countDocuments(query),
  ]);
  res.json({ transactions, page, total, pages: Math.ceil(total / limit) });
};
module.exports = {
  spendCoins,
  rewardUser,
  getTransactions,
  purchaseTree,
  TREE_PRICE,
};
