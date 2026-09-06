const { sendResponse } = require("../utils/apiResponse");

/**
 * Validates rating upsert payload.
 */
const validateUpsertRating = (req, res, next) => {
  const storeId = req.body.storeId || req.params.storeId || req.params.id;
  const rating = req.body.rating !== undefined ? Number(req.body.rating) : req.body.value !== undefined ? Number(req.body.value) : undefined;

  const parsedStoreId = parseInt(storeId, 10);
  if (isNaN(parsedStoreId) || parsedStoreId <= 0) {
    return sendResponse(res, 400, false, null, "A valid positive integer storeId is required");
  }

  if (rating === undefined || isNaN(rating) || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return sendResponse(res, 400, false, null, "Rating must be an integer between 1 and 5");
  }

  // Ensure normalized storeId & rating on req.body
  req.body.storeId = parsedStoreId;
  req.body.rating = rating;

  return next();
};

module.exports = {
  validateUpsertRating,
};
