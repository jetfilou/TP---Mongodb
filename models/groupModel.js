const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  group_id: Number,
  name: { type: String, required: true },
  users: [Number], // Liste des user_id membres
  createdBy: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Groups', groupSchema);