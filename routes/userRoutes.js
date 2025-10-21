const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 🔐 signin
router.get('/signin', userController.getsigninPage);
router.post('/signin', userController.signinUser);

// 🆕 Signup
router.get('/signup', userController.getSignupPage);
router.post('/signup', userController.uploadAvatar, userController.signupUser);

// 🚪 Logout
router.get('/logout', userController.logoutUser);

module.exports = router;
