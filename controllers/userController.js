const User = require('../models/userModel');

let currentUserId = null;

exports.getLoginPage = (req, res) => {
  res.sendFile('login.html', { root: './views' });
};

exports.loginUser = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.send('<p>Utilisateur introuvable</p><p><a href="/login">← Retour</a></p>');
  currentUserId = user.user_id;
  res.redirect('/index');
};

exports.logoutUser = (req, res) => {
  currentUserId = null;
  res.redirect('/login');
};

exports.getCurrentUserId = () => currentUserId;
