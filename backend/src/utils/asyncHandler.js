/**
 * Wraps an async route handler or middleware to forward rejections to Express error handling.
 *
 * @param {Function} fn - Async Express handler (req, res, next)
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
