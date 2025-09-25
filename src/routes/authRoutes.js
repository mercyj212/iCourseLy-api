const express = require('express');
const { body } = require('express-validator');
const {
  registerUser,
  loginUser,
  refreshToken,
  getUserProfile,
  verifyEmail,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequestMiddleware');

const router = express.Router();

// Register
router.post(
  '/register', 
  [
    body('userName').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .optional()
      .isIn(['student', 'instructor', 'admin'])
      .withMessage('Invalid role')
],
validateRequest, 
registerUser
);

// Verify email
router.get('/verify-email/:token', verifyEmail);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validateRequest,
  loginUser
);

  // Forgot Password
  router.post(
    '/forgot-password',
    [body('email').isEmail().withMessage('Valid email required')],
    validateRequest,
    forgotPassword
  );

  // Reset Password
   router.post(
    '/reset-password/:token',
    // [body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')],
    // validateRequest,
    resetPassword
  );

// Refresh access token
router.post('/refresh-token', refreshToken);

// Get user profile (protected)
router.get('/profile', authMiddleware, getUserProfile);

module.exports = router;
