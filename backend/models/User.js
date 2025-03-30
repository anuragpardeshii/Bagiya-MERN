const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String, required: true }, // String for better compatibility
    password: { type: String, required: true },
    profilePicture: { type: String },
    bio: { type: String },
    dob: { type: Date },
    wallet: {
      balance: { type: Number, default: 0 }, // User's coin balance
      trees: { type: Number, default: 0 }, // trees planted
      transactions: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
      ],
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
