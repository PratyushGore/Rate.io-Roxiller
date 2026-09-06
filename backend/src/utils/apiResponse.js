/**
 * Sends a standardized API response.
 *
 * @param {import('express').Response} res - Express response object
 * @param {number} statusCode - HTTP status code (e.g. 200, 201, 400, 500)
 * @param {boolean} success - Boolean indicator of success or failure
 * @param {any} [data=null] - Payload to return (objects, arrays, etc.)
 * @param {string} [message=""] - Human-readable status message
 * @returns {import('express').Response}
 */
const sendResponse = (res, statusCode, success, data = null, message = "") => {
  return res.status(statusCode).json({
    success,
    data,
    message,
  });
};

module.exports = {
  sendResponse,
};
