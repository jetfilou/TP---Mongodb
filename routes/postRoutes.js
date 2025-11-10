const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.get('/index', postController.getIndexPage);
router.post('/createMessage', postController.createMessage);
router.get('/api/messages', postController.apiMessages);

module.exports = router;