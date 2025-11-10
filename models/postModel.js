const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  message: String,
  author: String,
  creationDate: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  post_id: Number,
  message: String,
  author: String,
  image: String, // Image en base64
  answers: [answerSchema],
  creationDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Posts', postSchema);