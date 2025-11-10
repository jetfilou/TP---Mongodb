const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

router.get('/groups', groupController.listGroups);
router.post('/createGroup', groupController.createGroup);
router.get('/group/:id', groupController.viewGroup);
router.post('/group/:id/message', groupController.postGroupMessage);

module.exports = router;