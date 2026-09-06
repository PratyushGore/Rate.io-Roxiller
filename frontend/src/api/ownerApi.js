import axiosClient from "./axiosClient";

/**
 * Store Owner API methods communicating with /api/owner and store creation.
 */
export const ownerApi = {
  /**
   * Retrieve all stores belonging to the authenticated store owner.
   */
  getMyStores: async () => {
    return await axiosClient.get("/owner/stores");
  },

  /**
   * Retrieve per-store analytics and customer ratings log.
   *
   * @param {number} storeId - Store ID
   * @param {Object} [params]
   * @param {string} [params.sortBy="date"] - "customerName" | "value" | "date"
   * @param {string} [params.order="desc"] - "asc" | "desc"
   */
  getStoreAnalytics: async (storeId, { sortBy = "date", order = "desc" } = {}) => {
    return await axiosClient.get(`/owner/stores/${storeId}`, {
      params: { sortBy, order },
    });
  },

  /**
   * Register a new store (defaults to PENDING status for store owners).
   *
   * @param {Object|FormData} storeData
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

export default ownerApi;
