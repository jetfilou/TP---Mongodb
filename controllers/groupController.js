const Group = require('../models/groupModel');
const GroupPost = require('../models/groupPostModel');
const User = require('../models/userModel');
const path = require('path');
const fs = require('fs');

// GET /groups - Liste des groupes
exports.listGroups = async (req, res) => {
  const groups = await Group.find();
  const user = await User.findOne({ user_id: req.session.userId });
  
  let html = fs.readFileSync(path.join(__dirname, '../views/groups.html'), 'utf-8');
  
  let groupsHtml = '';
  groups.forEach(g => {
    const isMember = g.users.includes(req.session.userId);
    groupsHtml += `<div class="group">
      <h3>${g.name}</h3>
      <p>Créé le ${g.createdAt.toLocaleDateString()}</p>
      <p>Membres: ${g.users.length}</p>
      ${isMember ? `<a href="/group/${g.group_id}">Voir le groupe</a>` : '<span>Non membre</span>'}
    </div>`;
  });
  
  html = html.replace('{{groups}}', groupsHtml)
             .replace('{{firstname}}', user.firstname);
  
  res.send(html);
};

// POST /createGroup
exports.createGroup = async (req, res) => {
  const { name, users } = req.body;
  
  const count = await Group.countDocuments();
  const userIds = users ? users.split(',').map(id => parseInt(id.trim())) : [];
  userIds.push(req.session.userId); // Ajouter le créateur
  
  const newGroup = new Group({
    group_id: count + 1,
    name,
    users: [...new Set(userIds)], // Éviter les doublons
    createdBy: req.session.userId
  });
  
  await newGroup.save();
  
  // Créer le document GroupPost associé
  await new GroupPost({ group: newGroup.group_id, messages: [] }).save();
  
  res.redirect('/groups');
};

// GET /group/:id - Voir messages du groupe
exports.viewGroup = async (req, res) => {
  const groupId = parseInt(req.params.id);
  const group = await Group.findOne({ group_id: groupId });
  
  if (!group) return res.send('Groupe introuvable');
  if (!group.users.includes(req.session.userId)) {
    return res.send('Vous n\'êtes pas membre de ce groupe');
  }
  
  const groupPost = await GroupPost.findOne({ group: groupId });
  const user = await User.findOne({ user_id: req.session.userId });
  
  let html = fs.readFileSync(path.join(__dirname, '../views/group.html'), 'utf-8');
  
  let messagesHtml = '';
  if (groupPost && groupPost.messages) {
    for (const msg of groupPost.messages) {
      const author = await User.findOne({ user_id: msg.user });
      messagesHtml += `<div class="post">
        <p class="author">${author ? author.firstname + ' ' + author.lastname : 'Inconnu'}</p>
        <p>${msg.message}</p>`;
      
      if (msg.image) {
        messagesHtml += `<img src="${msg.image}" alt="Image" style="max-width:100%; border-radius:10px; margin:10px 0;">`;
      }
      
      messagesHtml += `<p class="date">${msg.createdAt.toLocaleString()}</p>`;
      
      // Réponses
      for (const ans of msg.answers) {
        const ansAuthor = await User.findOne({ user_id: ans.user });
        messagesHtml += `<div class="answer">
          <p class="author">${ansAuthor ? ansAuthor.firstname + ' ' + ansAuthor.lastname : 'Inconnu'}</p>
          <p>${ans.message}</p>
          <p class="date">${ans.createdAt.toLocaleString()}</p>
        </div>`;
      }
      
      messagesHtml += `</div>`;
    }
  }
  
  html = html.replace('{{groupName}}', group.name)
             .replace('{{groupId}}', groupId)
             .replace('{{userId}}', req.session.userId)
             .replace('{{messages}}', messagesHtml);
  
  res.send(html);
};

// POST /group/:id/message
exports.postGroupMessage = async (req, res) => {
  const groupId = parseInt(req.params.id);
  const { message, imageData } = req.body;
  
  const group = await Group.findOne({ group_id: groupId });
  if (!group || !group.users.includes(req.session.userId)) {
    return res.send('Accès refusé');
  }
  
  let groupPost = await GroupPost.findOne({ group: groupId });
  if (!groupPost) {
    groupPost = new GroupPost({ group: groupId, messages: [] });
  }
  
  groupPost.messages.push({
    user: req.session.userId,
    message,
    image: imageData || null,
    answers: []
  });
  
  await groupPost.save();
  res.redirect(`/group/${groupId}`);
};