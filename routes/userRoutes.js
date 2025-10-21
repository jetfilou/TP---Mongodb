const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 🔐 Login
router.get('/login', userController.getLoginPage);
router.post('/login', userController.loginUser);

// 🆕 Signup
router.get('/signup', userController.getSignupPage);
router.post('/signup', userController.uploadAvatar, userController.signupUser);

// 🚪 Logout
router.get('/logout', userController.logoutUser);

module.exports = router;
