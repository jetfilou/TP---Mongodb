const express = require('express');
const router = express.Router();
const answerController = require('../controllers/answerController');

router.post('/createAnswer', answerController.createAnswer);

module.exports = router;
