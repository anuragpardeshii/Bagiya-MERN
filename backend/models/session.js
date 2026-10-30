const mongoose = require('mongoose');
const schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sessionTime: { type: Number, required: true, min: 0, max: 180 },
    sessionSuccess: { type: Boolean, default: false },
    startTime: { type: Date, required: true },
    endTime: Date,
    status: {
      type: String,
      enum: ['running', 'paused', 'completed', 'cancelled'],
    },
    active: Boolean,
    elapsedMs: { type: Number, default: 0 },
    resumedAt: Date,
    requestId: String,
    reward: { type: Number, default: 0 },
    strictMode: Boolean,
    allowedLinks: { type: [String], default: undefined },
    appOrigin: String,
    strictDeadline: Date,
    monitorTokenHash: { type: String, select: false },
    interruptionReason: String,
  },
  { timestamps: true, autoIndex: false },
);
module.exports = mongoose.model('Session', schema);
