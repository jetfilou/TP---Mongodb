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

// POST /createGroup - MODIFIÉ POUR UTILISER DES EMAILS
exports.createGroup = async (req, res) => {
  const { name, userEmails } = req.body;
  
  const count = await Group.countDocuments();
  let userIds = [req.session.userId]; // Ajouter le créateur
  
  // Convertir les emails en user_id
  if (userEmails && userEmails.trim() !== '') {
    const emails = userEmails.split(',').map(email => email.trim());
    
    for (const email of emails) {
      const user = await User.findOne({ email });
      if (user && !userIds.includes(user.user_id)) {
        userIds.push(user.user_id);
      }
    }
  }
  
  const newGroup = new Group({
    group_id: count + 1,
    name,
    users: userIds,
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
      
      // SUPPRESSION DE L'AFFICHAGE DES IMAGES
      
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
  
  // CORRECTION : Remplacement correct du nom du groupe
  html = html.replace(/{{groupName}}/g, group.name)
             .replace('{{groupId}}', groupId)
             .replace('{{userId}}', req.session.userId)
             .replace('{{messages}}', messagesHtml);
  
  res.send(html);
};

// POST /group/:id/message - SUPPRESSION DES IMAGES
exports.postGroupMessage = async (req, res) => {
  const groupId = parseInt(req.params.id);
  const { message } = req.body; // SUPPRESSION de imageData
  
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
    image: null, // Toujours null
    answers: []
  });
  
  await groupPost.save();
  res.redirect(`/group/${groupId}`);
};
