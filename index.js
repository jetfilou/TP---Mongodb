const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuration session
app.use(session({
  secret: 'twitter-clone-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24h
}));

// Connexion MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/TP1-MongoSharding')
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => console.error('❌ Erreur MongoDB :', err));

// Middleware de protection des routes
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/signin');
  }
  next();
};

// Routes publiques (signin/signup)
const userRoutes = require('./routes/userRoutes');
app.use('/', userRoutes);

// Routes protégées
const postRoutes = require('./routes/postRoutes');
const answerRoutes = require('./routes/answerRoutes');
const groupRoutes = require('./routes/groupRoutes');
const profileRoutes = require('./routes/profileRoutes');

app.use('/', requireAuth, postRoutes);
app.use('/', requireAuth, answerRoutes);
app.use('/', requireAuth, groupRoutes);
app.use('/', requireAuth, profileRoutes);

// Redirection racine
app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/index');
  } else {
    res.redirect('/signin');
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Serveur sur http://localhost:${PORT}`));