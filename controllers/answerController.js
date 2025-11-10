const User = require('../models/userModel');
const Post = require('../models/postModel');

exports.createAnswer = async (req, res) => {
  const { authorId, messageId, answer, imageData } = req.body;
  const user = await User.findOne({ user_id: authorId });
  if (!user) return res.send('Auteur introuvable');

  const post = await Post.findOne({ post_id: messageId });
  if (!post) return res.send('Message introuvable');
  if (post.answers.length >= 100) return res.send('Nombre maximum de réponses atteint');

  post.answers.push({ 
    message: answer, 
    author: `${user.firstname} ${user.lastname}`,
    image: imageData || null // Image en base64
  });
  
  await post.save();
  res.redirect('/index');
};