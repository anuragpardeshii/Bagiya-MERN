const mongoose = require('mongoose');
module.exports = mongoose.model(
  'Transaction',
  new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      type: {
        type: String,
        enum: ['earn', 'spend', 'transfer'],
        required: true,
      },
      amount: { type: Number, required: true },
      reference: String,
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed',
      },
      requestId: String,
      createdAt: { type: Date, default: Date.now },
    },
    { autoIndex: false },
  ),
);
