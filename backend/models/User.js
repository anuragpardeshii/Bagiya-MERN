const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
  name: String,
  username: { type: String, unique: true },
  phone: Number,
  email: { type: String, unique: true },
  password: String,

});
const User = mongoose.model('User', userSchema);