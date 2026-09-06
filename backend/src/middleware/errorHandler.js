const { sendResponse } = require("../utils/apiResponse");

/**
 * Centralized error handling middleware.
 * Formats all unhandled errors into the standard API response structure.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal Server Error";

  // Prisma unique constraint violation error code
  if (err.code === "P2002") {
    statusCode = 409;
    const target = err.meta?.target ? ` (${err.meta.target})` : "";
    message = `A record with this field already exists${target}.`;
  }

  // Prisma record not found error code
  if (err.code === "P2025") {
    statusCode = 404;
    message = "Requested record not found.";
  }

  // In development, log stack trace for debugging
  if (process.env.NODE_ENV !== "test") {
    console.error(`[Error] ${statusCode} - ${message}`);
    if (statusCode === 500 && err.stack) {
      console.error(err.stack);
    }
  }

  return sendResponse(res, statusCode, false, null, message);
};

module.exports = errorHandler;
