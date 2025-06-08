const express = require('express');
const router = express.Router();

// Import middleware
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const { authLimiter, passwordLimiter } = require('../middlewares/rateLimiter');

// Import validation schemas
const { 
  registerSchema, 
  loginSchema, 
  changePasswordSchema 
} = require('../middlewares/validationSchemas');

// Import controller
const authController = require('./authController');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  authController.login
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
router.post(
  '/logout',
  authenticate,
  authController.logout
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/profile',
  authenticate,
  authController.getProfile
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  authenticate,
  validate({
    firstName: require('joi').string().min(2).max(50).pattern(/^[a-zA-ZÀ-ÿ\s]+$/),
    lastName: require('joi').string().min(2).max(50).pattern(/^[a-zA-ZÀ-ÿ\s]+$/)
  }),
  authController.updateProfile
);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put(
  '/change-password',
  passwordLimiter,
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword
);

/**
 * @route   POST /api/auth/verify-token
 * @desc    Verify JWT token
 * @access  Private
 */
router.post(
  '/verify-token',
  authenticate,
  authController.verifyToken
);

/**
 * @route   DELETE /api/auth/account
 * @desc    Deactivate user account
 * @access  Private
 */
router.delete(
  '/account',
  authenticate,
  authController.deactivateAccount
);

module.exports = router;
