const jwt = require("jsonwebtoken");
const { sendResponse } = require("../utils/apiResponse");

/**
 * Middleware to authenticate requests using JWT Bearer token.
 * Populates req.user with { id, role } if valid.
 */
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendResponse(res, 401, false, null, "Authentication required: Bearer token missing");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret_roxiller");
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };
    return next();
  } catch (error) {
    return sendResponse(res, 401, false, null, "Invalid or expired token");
  }
};

module.exports = auth;
