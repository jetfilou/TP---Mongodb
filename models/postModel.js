const mongoose = require('mongoose');
const answerSchema = require('./answerModel');

const postSchema = new mongoose.Schema({
  post_id: Number,
  message: String,
  author: String,
  answers: [answerSchema],
  creationDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);
