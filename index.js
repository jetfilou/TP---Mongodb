const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const { connectDB } = require('./config/database');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connexion MongoDB
connectDB();

// Routes
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const answerRoutes = require('./routes/answerRoutes');

app.use('/', userRoutes);
app.use('/', postRoutes);
app.use('/', answerRoutes);

// Démarrage du serveur
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Serveur en ligne sur http://localhost:${PORT}`));
