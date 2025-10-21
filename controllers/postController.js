const User = require('../models/userModel');
const Post = require('../models/postModel');

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

exports.apiMessages = async (req, res) => {
  const posts = await Post.find().sort({ creationDate: -1 });
  res.json(posts);
};
