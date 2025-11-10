const mongoose = require('mongoose');

const groupMessageSchema = new mongoose.Schema({
  user: Number,
  message: String,
  image: String, // Base64
  createdAt: { type: Date, default: Date.now },
  answers: [{
    user: Number,
    message: String,
    createdAt: { type: Date, default: Date.now }
  }]
});

const groupPostSchema = new mongoose.Schema({
  group: { type: Number, required: true }, // group_id
  messages: [groupMessageSchema]
});

module.exports = mongoose.model('GroupPosts', groupPostSchema);