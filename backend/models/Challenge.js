const mongoose = require('mongoose');
module.exports = mongoose.model(
  'Challenge',
  new mongoose.Schema(
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
      coins: { type: Number, required: true, min: 1 },
      isRedeemed: { type: Boolean, default: false },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      key: String,
      requiredMinutes: Number,
      requiredSessions: Number,
    },
    { timestamps: true, autoIndex: false },
  ),
);
