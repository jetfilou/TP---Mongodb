const User = require('../models/userModel');
const Post = require('../models/postModel');
const fs = require('fs');
const path = require('path');

// GET /index
exports.getIndexPage = async (req, res) => {
  const user = await User.findOne({ user_id: req.session.userId });
  const posts = await Post.find().sort({ creationDate: -1 });

  let html = fs.readFileSync(path.join(__dirname, '../views/index.html'), 'utf-8');

  let postsHtml = '';
  posts.forEach(p => {
    postsHtml += `<div class="post">
      <p class="author">${p.author}</p>
      <p>${p.message}</p>`;
    
    // Affichage image du post si présente
    if (p.image) {
      postsHtml += `<img src="${p.image}" alt="Image" style="max-width:100%; border-radius:10px; margin:10px 0;">`;
    }
    
    postsHtml += `<p class="date">${p.creationDate.toLocaleString()}</p>`;
    
    // Réponses avec images
    p.answers.forEach(a => {
      postsHtml += `<div class="answer">
        <p class="author">${a.author}</p>
        <p>${a.message}</p>`;
      
      // Affichage image de la réponse si présente
      if (a.image) {
        postsHtml += `<img src="${a.image}" alt="Image" style="max-width:100%; border-radius:10px; margin:10px 0;">`;
      }
      
      postsHtml += `<p class="date">${new Date(a.creationDate).toLocaleString()}</p>
      </div>`;
    });

    // Formulaire réponse avec upload d'image
    postsHtml += `<form method="POST" action="/createAnswer" class="answer-form" data-post-id="${p.post_id}">
      <input type="hidden" name="messageId" value="${p.post_id}">
      <input type="hidden" name="authorId" value="${user.user_id}">
      <input type="hidden" name="imageData" class="answer-image-data">
      <textarea name="answer" placeholder="Répondre..." rows="2" required></textarea>
      <input type="file" class="answer-image-upload" accept="image/*">
      <button type="submit">Répondre</button>
    </form></div>`;
  });

  html = html.replace('{{firstname}}', user.firstname)
             .replace('{{lastname}}', user.lastname)
             .replace('{{user_id}}', user.user_id)
             .replace('{{avatar}}', user.avatar)
             .replace('{{posts}}', postsHtml);

  res.send(html);
};

// POST /createMessage (avec image en base64)
exports.createMessage = async (req, res) => {
  const { authorId, message, imageData } = req.body;
  const user = await User.findOne({ user_id: authorId });
  if (!user) return res.send('Auteur introuvable');

  const count = await Post.countDocuments();
  const newPost = new Post({
    post_id: count + 1,
    message,
    author: `${user.firstname} ${user.lastname}`,
    image: imageData || null // Image en base64
  });

  await newPost.save();
  res.redirect('/index');
};

// GET /api/messages
exports.apiMessages = async (req, res) => {
  const posts = await Post.find().sort({ creationDate: -1 });
  res.json(posts);
};