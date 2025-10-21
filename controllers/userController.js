const User = require('../models/userModel');

exports.getLoginPage = (req, res) => {
  res.sendFile(require('path').join(__dirname, '../views/login.html'));
};

exports.loginUser = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.send('<p>Utilisateur introuvable</p><p><a href="/login">← Retour</a></p>');

  global.currentUserId = user.user_id;
  res.redirect('/index');
};

exports.logoutUser = (req, res) => {
  global.currentUserId = null;
  res.redirect('/login');
};
