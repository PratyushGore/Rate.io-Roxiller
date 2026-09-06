const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const ownerService = require("../services/owner.service");

/**
 * Get all stores owned by the authenticated STORE_OWNER.
 */
const getStores = asyncHandler(async (req, res) => {
  const stores = await ownerService.getOwnerStores(req.user.id);
  return sendResponse(res, 200, true, stores, "Owner stores retrieved successfully");
});

/**
 * Get analytics and ratings log for a specific store owned by the caller.
 */
const getStoreAnalytics = asyncHandler(async (req, res) => {
  const storeId = parseInt(req.params.id, 10);
  if (isNaN(storeId) || storeId <= 0) {
    return sendResponse(res, 400, false, null, "Invalid store ID");
  }

  const { sortBy, order } = req.query;
  const analytics = await ownerService.getOwnerStoreAnalytics(storeId, req.user.id, {
    sortBy,
    order,
  });

  return sendResponse(res, 200, true, analytics, "Store analytics retrieved successfully");
});

module.exports = {
  getStores,
  getStoreAnalytics,
};
