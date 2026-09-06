const { sendResponse } = require("../utils/apiResponse");

/**
 * Role-based authorization middleware.
 * Verifies that the authenticated user's role is included in the allowed roles.
 *
 * @param  {...string} roles - Permitted roles (e.g. "ADMIN", "STORE_OWNER", "USER")
 */
const requireRole = (...roles) => {
  const allowedRoles = roles.flat();

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return sendResponse(res, 401, false, null, "Authentication required");
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendResponse(
        res,
        403,
        false,
        null,
        `Forbidden: Access restricted to ${allowedRoles.join(" or ")}`
      );
    }

    return next();
  };
};

module.exports = {
  requireRole,
};
