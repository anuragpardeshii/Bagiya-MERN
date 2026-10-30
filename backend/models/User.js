const mongoose = require('mongoose');
const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    phoneNormalized: String,
    password: { type: String, required: true, select: false },
    profilePicture: String,
    bio: { type: String, default: '' },
    dob: Date,
    rankingOptIn: { type: Boolean, default: false },
    wallet: {
      balance: { type: Number, default: 0, min: 0 },
      trees: { type: Number, default: 0, min: 0 },
      transactions: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
      ],
    },
  },
  { timestamps: true, autoIndex: false },
);
module.exports = mongoose.model('User', schema);
