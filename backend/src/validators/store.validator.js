const { sendResponse } = require("../utils/apiResponse");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates store creation payload.
 */
const validateCreateStore = (req, res, next) => {
  const { name, email, address, category, tags } = req.body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return sendResponse(res, 400, false, null, "Store name is required");
  }

  // 20-60 character name rule
  if (name.trim().length < 20 || name.trim().length > 60) {
    return sendResponse(res, 400, false, null, "Store name must be between 20 and 60 characters");
  }

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    return sendResponse(res, 400, false, null, "A valid store contact email is required");
  }

  if (email.trim().length > 255) {
    return sendResponse(res, 400, false, null, "Store email cannot exceed 255 characters");
  }

  if (!address || typeof address !== "string" || address.trim().length === 0) {
    return sendResponse(res, 400, false, null, "Store address is required");
  }

  if (address.trim().length > 400) {
    return sendResponse(res, 400, false, null, "Store address cannot exceed 400 characters");
  }

  if (category && (typeof category !== "string" || category.trim().length > 50)) {
    return sendResponse(res, 400, false, null, "Category cannot exceed 50 characters");
  }

  if (tags && (typeof tags !== "string" || tags.trim().length > 255)) {
    return sendResponse(res, 400, false, null, "Tags cannot exceed 255 characters");
  }

  return next();
};

module.exports = {
  validateCreateStore,
};
