const authService = require('../services/authService');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  const result = await authService.register({
    email,
    password,
    firstName,
    lastName
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: result
  });
});

/**
 * Login user
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login({ email, password });

  res.json({
    success: true,
    message: 'Login successful',
    data: result
  });
});

/**
 * Get current user profile
 * GET /api/auth/profile
 */
const getProfile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      user: req.user
    }
  });
});

/**
 * Update user profile
 * PUT /api/auth/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName } = req.body;
  const userId = req.userId;

  // Get current user
  const user = await authService.getUserById(userId);
  
  // Update user fields
  const updatedUser = await user.update({
    firstName: firstName || user.firstName,
    lastName: lastName || user.lastName
  });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    }
  });
});

/**
 * Change user password
 * PUT /api/auth/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.userId;

  await authService.changePassword(userId, currentPassword, newPassword);

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

/**
 * Deactivate user account
 * DELETE /api/auth/account
 */
const deactivateAccount = asyncHandler(async (req, res) => {
  const userId = req.userId;

  await authService.deactivateAccount(userId);

  res.json({
    success: true,
    message: 'Account deactivated successfully'
  });
});

/**
 * Verify token (for client-side token validation)
 * POST /api/auth/verify-token
 */
const verifyToken = asyncHandler(async (req, res) => {
  // If we reach here, the token is valid (authentication middleware passed)
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      user: req.user
    }
  });
});

/**
 * Logout user (client-side token removal)
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  // Since we're using stateless JWT, logout is handled client-side
  // This endpoint exists for consistency and potential future features
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  deactivateAccount,
  verifyToken,
  logout
};
