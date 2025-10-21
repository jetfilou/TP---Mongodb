const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_id: Number,
  firstname: String,
  lastname: String,
  email: String
});

module.exports = mongoose.model('User', userSchema);
