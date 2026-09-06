import axiosClient from "./axiosClient";

/**
 * Rating API methods communicating with /api/ratings.
 */
export const ratingApi = {
  /**
   * Submit or modify a rating for a store.
   *
   * @param {Object} payload
   * @param {number} payload.storeId - Target store ID
   * @param {number} payload.rating - Integer rating between 1 and 5
   */
  upsertRating: async ({ storeId, rating }) => {
    return await axiosClient.post("/ratings", { storeId, rating });
  },
};

export default ratingApi;
