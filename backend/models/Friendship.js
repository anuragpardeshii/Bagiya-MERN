const mongoose = require('mongoose');
module.exports = mongoose.model(
  'Friendship',
  new mongoose.Schema(
    {
      pair: { type: String, required: true },
      requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      status: {
        type: String,
        enum: ['pending', 'accepted'],
        default: 'pending',
      },
    },
    { timestamps: true, autoIndex: false },
  ),
);
