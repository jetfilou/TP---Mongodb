const Post = require('../models/postModel');
const User = require('../models/userModel');
const { getCurrentUserId } = require('./userController');

exports.getIndexPage = async (req, res) => {
  const currentUserId = getCurrentUserId();
  if (!currentUserId) return res.redirect('/login');

  const currentUser = await User.findOne({ user_id: currentUserId });
  const posts = await Post.find().sort({ creationDate: -1 });

  let html = `
  <html><head><title>Accueil</title></head><body>
    <h2>Bienvenue, ${currentUser.firstname} ${currentUser.lastname}</h2>
    <form method="POST" action="/createMessage">
      <input type="hidden" name="authorId" value="${currentUser.user_id}">
      <textarea name="message" required></textarea>
      <button type="submit">Publier</button>
    </form><hr>`;

  posts.forEach(p => {
    html += `<div><b>${p.author}</b>: ${p.message}<br><small>${p.creationDate.toLocaleString()}</small></div>`;
  });

  html += '</body></html>';
  res.send(html);
};

exports.createMessage = async (req, res) => {
  const { authorId, message } = req.body;
  const user = await User.findOne({ user_id: authorId });
  if (!user) return res.send('Auteur introuvable');

  const count = await Post.countDocuments();
  const newPost = new Post({
    post_id: count + 1,
    message,
    author: `${user.firstname} ${user.lastname}`
  });

  await newPost.save();
  res.redirect('/index');
};

exports.listMessagesAPI = async (req, res) => {
  const posts = await Post.find().sort({ creationDate: -1 });
  res.json(posts);
};
