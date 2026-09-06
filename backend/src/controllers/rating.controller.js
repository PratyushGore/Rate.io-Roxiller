const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const ratingService = require("../services/rating.service");

/**
 * Submit or modify a rating for a store.
 */
const upsertRating = asyncHandler(async (req, res) => {
  const { storeId, rating } = req.body;
  const userId = req.user.id;

  const result = await ratingService.upsertRating({
    userId,
    storeId,
    rating,
  });

  return sendResponse(res, 200, true, result, "Rating submitted successfully");
});

module.exports = {
  upsertRating,
};
