const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const User = require('./models/userModel');
const Post = require('./models/postModel');

const userController = require('./controllers/userController');
const postController = require('./controllers/postController');
const answerController = require('./controllers/answerController');
const userRoutes = require('./routes/userRoutes'); // ✅ nouvelle route regroupée

global.currentUserId = null;

// ✅ Toutes les routes utilisateur : /signin /signup /logout
app.use('/', userRoutes);

// Page principale
app.get('/index', async (req, res) => {
  if (!global.currentUserId) return res.redirect('/login');

  const user = await User.findOne({ user_id: global.currentUserId });
  const posts = await Post.find().sort({ creationDate: -1 });

  let html = fs.readFileSync(path.join(__dirname, 'views/index.html'), 'utf-8');

  let postsHtml = '';
  posts.forEach(p => {
    postsHtml += `<div class="post">
      <p class="author">${p.author}</p>
      <p>${p.message}</p>
      <p class="date">${p.creationDate.toLocaleString()}</p>`;
    
    p.answers.forEach(a => {
      postsHtml += `<div class="answer">
        <p class="author">${a.author}</p>
        <p>${a.message}</p>
        <p class="date">${new Date(a.creationDate).toLocaleString()}</p>
      </div>`;
    });

    postsHtml += `<form method="POST" action="/createAnswer">
      <input type="hidden" name="messageId" value="${p.post_id}">
      <input type="hidden" name="authorId" value="${user.user_id}">
      <textarea name="answer" placeholder="Répondre..." rows="2" required></textarea>
      <button type="submit">Répondre</button>
    </form></div>`;
  });

  html = html.replace('{{firstname}}', user.firstname)
             .replace('{{lastname}}', user.lastname)
             .replace('{{user_id}}', user.user_id)
             .replace('{{posts}}', postsHtml);

  res.send(html);
});

app.post('/createMessage', postController.createMessage);
app.post('/createAnswer', answerController.createAnswer);
app.get('/api/messages', postController.apiMessages);

mongoose.connect('mongodb://127.0.0.1:27017/TP1-MongoSharding')
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => console.error('❌ Erreur MongoDB :', err));

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Serveur en ligne sur http://localhost:${PORT}`));
