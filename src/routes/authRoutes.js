const express = require('express');
const {
  registerUser,
  loginUser,
  refreshToken,
  getUserProfile
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Register
router.post('/register', registerUser);

// Login
router.post('/login', loginUser);

// Refresh access token
router.post('/refresh-token', refreshToken);

// Get user profile (protected)
router.get('/profile', authMiddleware, getUserProfile);

module.exports = router;
