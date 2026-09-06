import axiosClient from "./axiosClient";

/**
 * Admin API methods communicating with /api/admin.
 */
export const adminApi = {
  /**
   * Retrieve platform dashboard overview metrics.
   */
  getMetrics: async () => {
    return await axiosClient.get("/admin/metrics");
  },

  /**
   * List all platform users with optional search, role filter, and sorting.
   */
  getUsers: async ({ search = "", role = "", sortBy = "createdAt", order = "desc", sort } = {}) => {
    const params = {};
    if (search && search.trim()) params.search = search.trim();
    if (role && role !== "ALL") params.role = role;
    if (sort) params.sort = sort;
    if (sortBy) params.sortBy = sortBy;
    if (order) params.order = order;

    return await axiosClient.get("/admin/users", { params });
  },

  /**
   * Create a new user with designated role (ADMIN, STORE_OWNER, USER).
   */
  createUser: async ({ name, email, password, address, role }) => {
    return await axiosClient.post("/admin/users", {
      name,
      email,
      password,
      address,
      role,
    });
  },

  /**
   * Update a user's role.
   */
  updateUserRole: async (userId, role) => {
    return await axiosClient.patch(`/admin/users/${userId}/role`, { role });
  },

  /**
   * Delete a user by ID.
   */
  deleteUser: async (userId) => {
    return await axiosClient.delete(`/admin/users/${userId}`);
  },

  /**
   * List all stores with status filter, search, and sorting.
   */
  getStores: async ({ status = "", search = "", sortBy = "createdAt", order = "desc", sort } = {}) => {
    const params = {};
    if (status && status !== "ALL") params.status = status;
    if (search && search.trim()) params.search = search.trim();
    if (sort) params.sort = sort;
    if (sortBy) params.sortBy = sortBy;
    if (order) params.order = order;

    return await axiosClient.get("/admin/stores", { params });
  },

  /**
   * Moderate store status (APPROVED or REJECTED).
   */
  updateStoreStatus: async (storeId, status) => {
    return await axiosClient.patch(`/admin/stores/${storeId}/status`, { status });
  },

  /**
   * Delete a store by ID.
   */
  deleteStore: async (storeId) => {
    return await axiosClient.delete(`/admin/stores/${storeId}`);
  },
};

export default adminApi;
