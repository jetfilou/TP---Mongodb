const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const path = require('path');
const multer = require('multer');

// ⚙️ Configuration Multer pour upload avatar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/img'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });
exports.uploadAvatar = upload.single('avatar');

// 🧭 GET /login
exports.getLoginPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/login.html'));
};

// 🧭 GET /signup
exports.getSignupPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/signup.html'));
};

// 🧩 POST /signup
exports.signupUser = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    const avatar = req.file ? '/img/' + req.file.filename : '/img/default-avatar.png';

    // Vérifie si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send('<p>Email déjà utilisé</p><p><a href="/signup">← Retour</a></p>');
    }

    // Calcul du prochain ID utilisateur
    const lastUser = await User.findOne().sort({ user_id: -1 });
    const nextId = lastUser ? lastUser.user_id + 1 : 1;

    // Création utilisateur
    const newUser = new User({
      user_id: nextId,
      firstname,
      lastname,
      email,
      password,
      avatar
    });

    await newUser.save();
    res.redirect('/login');
  } catch (err) {
    console.error('Erreur signup :', err);
    res.status(500).send('Erreur serveur lors de la création du compte');
  }
};

// 🧩 POST /login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.send('<p>Utilisateur introuvable</p><p><a href="/login">← Retour</a></p>');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.send('<p>Mot de passe incorrect</p><p><a href="/login">← Retour</a></p>');
  }

  global.currentUserId = user.user_id;
  res.redirect('/index');
};

// 🧭 GET /logout
exports.logoutUser = (req, res) => {
  global.currentUserId = null;
  res.redirect('/login');
};
