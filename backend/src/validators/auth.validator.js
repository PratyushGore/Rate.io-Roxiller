const { sendResponse } = require("../utils/apiResponse");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates signup payload.
 */
const validateSignup = (req, res, next) => {
  const { name, email, password, address, role } = req.body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return sendResponse(res, 400, false, null, "Name is required");
  }

  if (name.trim().length > 60) {
    return sendResponse(res, 400, false, null, "Name cannot exceed 60 characters");
  }

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    return sendResponse(res, 400, false, null, "A valid email address is required");
  }

  if (email.trim().length > 255) {
    return sendResponse(res, 400, false, null, "Email cannot exceed 255 characters");
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    return sendResponse(res, 400, false, null, "Password must be at least 6 characters long");
  }

  if (address && (typeof address !== "string" || address.length > 400)) {
    return sendResponse(res, 400, false, null, "Address cannot exceed 400 characters");
  }

  if (role) {
    if (role === "ADMIN") {
      return sendResponse(res, 400, false, null, "Registration as ADMIN is not permitted");
    }
    if (!["USER", "STORE_OWNER"].includes(role)) {
      return sendResponse(res, 400, false, null, "Role must be either USER or STORE_OWNER");
    }
  }

  return next();
};

/**
 * Validates login payload.
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    return sendResponse(res, 400, false, null, "A valid email address is required");
  }

  if (!password || typeof password !== "string" || password.length === 0) {
    return sendResponse(res, 400, false, null, "Password is required");
  }

  return next();
};

/**
 * Validates password change payload.
 */
const validateChangePassword = (req, res, next) => {
  const oldPassword = req.body.oldPassword || req.body.currentPassword;
  const { newPassword } = req.body;

  if (!oldPassword || typeof oldPassword !== "string") {
    return sendResponse(res, 400, false, null, "Current password is required");
  }

  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
    return sendResponse(res, 400, false, null, "New password must be at least 6 characters long");
  }

  if (oldPassword === newPassword) {
    return sendResponse(res, 400, false, null, "New password must be different from current password");
  }

  return next();
};

module.exports = {
  validateSignup,
  validateLogin,
  validateChangePassword,
};
