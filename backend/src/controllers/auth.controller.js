const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const authService = require("../services/auth.service");

/**
 * Handle new user registration.
 */
const signup = asyncHandler(async (req, res) => {
  const result = await authService.signup(req.body);
  return sendResponse(res, 201, true, result, "Registration successful");
});

/**
 * Handle user login.
 */
const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return sendResponse(res, 200, true, result, "Login successful");
});

/**
 * Handle password change for authenticated user.
 */
const changePassword = asyncHandler(async (req, res) => {
  const oldPassword = req.body.oldPassword || req.body.currentPassword;
  const { newPassword } = req.body;
  const result = await authService.changePassword(req.user.id, oldPassword, newPassword);
  return sendResponse(res, 200, true, null, result.message);
});

/**
 * Get profile of currently authenticated user.
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);
  return sendResponse(res, 200, true, user, "User profile retrieved successfully");
});

/**
 * Handle user profile photo upload.
 */
const uploadProfilePhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendResponse(res, 400, false, null, "Please select an image file to upload");
  }

  const photoPath = `/uploads/profiles/${req.file.filename}`;
  const updatedUser = await authService.updateProfilePhoto(req.user.id, photoPath);
  return sendResponse(res, 200, true, { user: updatedUser }, "Profile photo updated successfully");
});

/**
 * Handle user profile photo removal.
 */
const removeProfilePhoto = asyncHandler(async (req, res) => {
  const updatedUser = await authService.removeProfilePhoto(req.user.id);
  return sendResponse(res, 200, true, { user: updatedUser }, "Profile photo removed successfully");
});

module.exports = {
  signup,
  login,
  changePassword,
  getMe,
  uploadProfilePhoto,
  removeProfilePhoto,
};
