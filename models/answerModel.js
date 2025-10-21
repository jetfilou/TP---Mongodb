const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  message: String,
  author: String,
  creationDate: { type: Date, default: Date.now }
});

module.exports = answerSchema; // export du sous-schema
