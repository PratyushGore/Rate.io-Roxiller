import axiosClient from "./axiosClient";

/**
 * Store API methods communicating with /api/stores.
 */
export const storeApi = {
  /**
   * Retrieve catalog of approved stores with optional search and sorting.
   */
  getStores: async ({ search = "", sortBy = "name", order = "asc" } = {}) => {
    const params = {};
    if (search && search.trim()) {
      params.search = search.trim();
    }
    if (sortBy) {
      params.sortBy = sortBy;
    }
    if (order) {
      params.order = order;
    }

    return await axiosClient.get("/stores", { params });
  },

  /**
   * Retrieve store details including rating distribution and caller's userRating.
   */
  getStoreById: async (id) => {
    return await axiosClient.get(`/stores/${id}`);
  },

  /**
   * Retrieve top-rated approved stores (top 10 sorted by rating).
   */
  getTopRated: async () => {
    return await axiosClient.get("/stores/top-rated");
  },

  /**
   * Retrieve distinct categories of approved stores.
   */
  getCategories: async () => {
    return await axiosClient.get("/stores/categories");
  },

  /**
   * Search stores with query/category boosting and pagination.
   */
  search: async ({ query = "", category = "", page = 1, limit = 10 } = {}) => {
    const params = {};
    if (query && query.trim()) params.query = query.trim();
    if (category && category.trim() && category !== "All" && category !== "All Categories") {
      params.category = category.trim();
    }
    if (page) params.page = page;
    if (limit) params.limit = limit;

    return await axiosClient.get("/stores/search", { params });
  },

  /**
   * Create a new store (pending for owners, approved for admin).
   * Supports both JSON and FormData (for image uploads).
   */
  createStore: async (storeData) => {
    if (storeData instanceof FormData) {
      return await axiosClient.post("/stores", storeData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    return await axiosClient.post("/stores", storeData);
  },
};

export default storeApi;
