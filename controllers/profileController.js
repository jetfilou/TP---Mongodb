const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
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

// GET /profile
exports.getProfilePage = async (req, res) => {
  const user = await User.findOne({ user_id: req.session.userId });
  if (!user) return res.redirect('/signin');
  
  let html = fs.readFileSync(path.join(__dirname, '../views/profile.html'), 'utf-8');
  
  html = html.replace('{{firstname}}', user.firstname)
             .replace('{{lastname}}', user.lastname)
             .replace('{{email}}', user.email)
             .replace('{{avatar}}', user.avatar);
  
  res.send(html);
};

// POST /profile
exports.updateProfile = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  const user = await User.findOne({ user_id: req.session.userId });
  
  if (!user) return res.redirect('/signin');
  
  // Mise à jour des champs
  if (firstname) user.firstname = firstname;
  if (lastname) user.lastname = lastname;
  if (email) user.email = email;
  
  // CORRECTION : Changement de mot de passe manuel (éviter le double hachage)
  if (password && password.trim() !== '') {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    // Empêcher le pre-save hook de re-hasher
    user.markModified('password');
  }
  
  // Changement d'avatar si uploadé
  if (req.file) {
    user.avatar = '/img/' + req.file.filename;
  }
  
  // Sauvegarder sans déclencher le pre-save hook pour le password
  await User.updateOne(
    { user_id: req.session.userId },
    {
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      password: user.password,
      avatar: user.avatar
    }
  );
  
  res.redirect('/profile?success=1');
};