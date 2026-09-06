const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const storeService = require("../services/store.service");

/**
 * Get catalog of approved stores.
 */
const getStores = asyncHandler(async (req, res) => {
  const { search, sortBy, order } = req.query;
  const currentUserId = req.user ? req.user.id : null;

  const stores = await storeService.getStores({
    search,
    sortBy,
    order,
    currentUserId,
  });

  return sendResponse(res, 200, true, stores, "Stores retrieved successfully");
});

/**
 * Get store details by ID including rating breakdown and caller's rating.
 */
const getStoreById = asyncHandler(async (req, res) => {
  const storeId = parseInt(req.params.id, 10);
  if (isNaN(storeId) || storeId <= 0) {
    return sendResponse(res, 400, false, null, "Invalid store ID parameter");
  }

  const currentUserId = req.user ? req.user.id : null;
  const store = await storeService.getStoreById(storeId, currentUserId);

  return sendResponse(res, 200, true, store, "Store details retrieved successfully");
});

/**
 * Create a new store (pending approval for owners, approved for admins).
 */
const createStore = asyncHandler(async (req, res) => {
  const { name, email, address, ownerId, category, tags } = req.body;

  let imageUrl = req.body.imageUrl || null;
  if (req.file) {
    imageUrl = `/uploads/stores/${req.file.filename}`;
  }

  const store = await storeService.createStore({
    name,
    email,
    address,
    category,
    tags,
    imageUrl,
    ownerId,
    userRole: req.user.role,
    userId: req.user.id,
  });

  return sendResponse(res, 201, true, store, "Store created successfully");
});

/**
 * Get top 10 rated approved stores.
 */
const getTopRatedStores = asyncHandler(async (req, res) => {
  const currentUserId = req.user ? req.user.id : null;
  const stores = await storeService.getTopRatedStores(currentUserId);
  return sendResponse(res, 200, true, stores, "Top rated stores retrieved successfully");
});

/**
 * Get distinct store categories.
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await storeService.getCategories();
  return sendResponse(res, 200, true, categories, "Categories retrieved successfully");
});

/**
 * Search stores with relevance boosting and pagination.
 */
const searchStores = asyncHandler(async (req, res) => {
  const { query, category, page, limit } = req.query;
  const currentUserId = req.user ? req.user.id : null;

  const result = await storeService.searchStores({
    query,
    category,
    page,
    limit,
    currentUserId,
  });

  return sendResponse(res, 200, true, result, "Stores search completed successfully");
});

module.exports = {
  getStores,
  getStoreById,
  createStore,
  getTopRatedStores,
  getCategories,
  searchStores,
};

