const asyncHandler = require("../utils/asyncHandler");
const { sendResponse } = require("../utils/apiResponse");
const adminService = require("../services/admin.service");

/**
 * Get admin dashboard metrics.
 */
const getMetrics = asyncHandler(async (req, res) => {
  const metrics = await adminService.getDashboardMetrics();
  return sendResponse(res, 200, true, metrics, "Dashboard metrics retrieved successfully");
});

/**
 * List all users.
 */
const listUsers = asyncHandler(async (req, res) => {
  const users = await adminService.listUsers(req.query);
  return sendResponse(res, 200, true, users, "Users retrieved successfully");
});

/**
 * Create a user with specified role.
 */
const createUser = asyncHandler(async (req, res) => {
  const user = await adminService.createUser(req.body);
  return sendResponse(res, 201, true, user, "User created successfully");
});

/**
 * Update user role.
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (isNaN(userId) || userId <= 0) {
    return sendResponse(res, 400, false, null, "Invalid user ID");
  }

  const updatedUser = await adminService.updateUserRole(userId, req.body.role);
  return sendResponse(res, 200, true, updatedUser, "User role updated successfully");
});

/**
 * Delete a user.
 */
const deleteUser = asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (isNaN(userId) || userId <= 0) {
    return sendResponse(res, 400, false, null, "Invalid user ID");
  }

  const result = await adminService.deleteUser(userId, req.user.id);
  return sendResponse(res, 200, true, null, result.message);
});

/**
 * List all stores with status filter and sorting.
 */
const listStores = asyncHandler(async (req, res) => {
  const stores = await adminService.listStores(req.query);
  return sendResponse(res, 200, true, stores, "Stores retrieved successfully");
});

/**
 * Update store status (moderation).
 */
const updateStoreStatus = asyncHandler(async (req, res) => {
  const storeId = parseInt(req.params.id, 10);
  if (isNaN(storeId) || storeId <= 0) {
    return sendResponse(res, 400, false, null, "Invalid store ID");
  }

  const updatedStore = await adminService.updateStoreStatus(storeId, req.body.status);
  return sendResponse(res, 200, true, updatedStore, "Store status updated successfully");
});

/**
 * Delete a store.
 */
const deleteStore = asyncHandler(async (req, res) => {
  const storeId = parseInt(req.params.id, 10);
  if (isNaN(storeId) || storeId <= 0) {
    return sendResponse(res, 400, false, null, "Invalid store ID");
  }

  const result = await adminService.deleteStore(storeId);
  return sendResponse(res, 200, true, null, result.message);
});

module.exports = {
  getMetrics,
  listUsers,
  createUser,
  updateUserRole,
  deleteUser,
  listStores,
  updateStoreStatus,
  deleteStore,
};
