const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const path = require('path');
const multer = require('multer');

// Configuration Multer
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

// Fonction de validation d'email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// GET /signin
exports.getsigninPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/signin.html'));
};

// GET /signup
exports.getSignupPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/signup.html'));
};

// POST /signup
exports.signupUser = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    
    // Validation email
    if (!isValidEmail(email)) {
      return res.send('<p>Format d\'email invalide (ex: user@example.com)</p><p><a href="/signup">← Retour</a></p>');
    }
    
    const avatar = req.file ? '/img/' + req.file.filename : '/img/default-avatar.png';

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send('<p>Email déjà utilisé</p><p><a href="/signup">← Retour</a></p>');
    }

    const lastUser = await User.findOne().sort({ user_id: -1 });
    const nextId = lastUser ? lastUser.user_id + 1 : 1;

    // LE MOT DE PASSE SERA HACHÉ PAR LE PRE-SAVE HOOK
    const newUser = new User({
      user_id: nextId,
      firstname,
      lastname,
      email,
      password, // Pas de hachage manuel ici
      avatar
    });

    await newUser.save();
    res.redirect('/signin');
  } catch (err) {
    console.error('Erreur signup :', err);
    res.status(500).send('Erreur serveur');
  }
};

// POST /signin
exports.signinUser = async (req, res) => {
  const { email, password } = req.body;
  
  // Validation email
  if (!isValidEmail(email)) {
    return res.send('<p>Format d\'email invalide</p><p><a href="/signin">← Retour</a></p>');
  }
  
  const user = await User.findOne({ email });

  if (!user) {
    return res.send('<p>Utilisateur introuvable</p><p><a href="/signin">← Retour</a></p>');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.send('<p>Mot de passe incorrect</p><p><a href="/signin">← Retour</a></p>');
  }

  // Utilisation de la session
  req.session.userId = user.user_id;
  res.redirect('/index');
};

// GET /logout
exports.logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error(err);
    res.redirect('/signin');
  });
};