const express = require('express');
const userController = require('../controllers/userController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', userController.registerUser);
router.post('/login', userController.LoginUser);

// Protected routes
router.get('/getUserInfo', auth, userController.getUserInfo);
router.put('/update-profile', auth, userController.updateUserProfile);

// Admin-only routes
router.get('/all', auth, adminAuth, userController.getAllUsers);
router.delete('/delete/:id', auth, adminAuth, userController.deleteUser);

module.exports = router;
