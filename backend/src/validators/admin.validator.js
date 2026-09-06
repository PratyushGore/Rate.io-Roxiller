const { sendResponse } = require("../utils/apiResponse");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ROLES = ["ADMIN", "STORE_OWNER", "USER"];

/**
 * Validates payload for admin user creation.
 */
const validateAdminCreateUser = (req, res, next) => {
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

  if (!role || !ALLOWED_ROLES.includes(role)) {
    return sendResponse(res, 400, false, null, `Role must be one of: ${ALLOWED_ROLES.join(", ")}`);
  }

  return next();
};

/**
 * Validates payload for updating user role.
 */
const validateUserRoleUpdate = (req, res, next) => {
  const { role } = req.body;

  if (!role || !ALLOWED_ROLES.includes(role)) {
    return sendResponse(res, 400, false, null, `Role must be one of: ${ALLOWED_ROLES.join(", ")}`);
  }

  return next();
};

/**
 * Validates store status update.
 * Strictly requires status to be APPROVED or REJECTED.
 * Specifically rejects PENDING as an invalid transition target.
 */
const validateStoreStatusUpdate = (req, res, next) => {
  const { status } = req.body;

  if (status === "PENDING") {
    return sendResponse(
      res,
      400,
      false,
      null,
      "Invalid status transition: PENDING is not an allowed target status"
    );
  }

  if (!status || !["APPROVED", "REJECTED"].includes(status)) {
    return sendResponse(
      res,
      400,
      false,
      null,
      "Status must be either APPROVED or REJECTED"
    );
  }

  return next();
};

module.exports = {
  validateAdminCreateUser,
  validateUserRoleUpdate,
  validateStoreStatusUpdate,
};
