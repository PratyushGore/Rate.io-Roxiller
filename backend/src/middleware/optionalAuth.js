const jwt = require("jsonwebtoken");

/**
 * Non-blocking authentication middleware.
 * If a valid Bearer token is provided, populates req.user with { id, role }.
 * If missing, invalid, or expired, req.user is set to null and request continues.
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret_roxiller");
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };
  } catch (error) {
    req.user = null;
  }

  return next();
};

module.exports = optionalAuth;
