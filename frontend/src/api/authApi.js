import axiosClient from "./axiosClient";

/**
 * Authentication API methods communicating with /api/auth.
 */
export const authApi = {
  /**
   * Log in user with email and password.
   */
  login: async ({ email, password }) => {
    return await axiosClient.post("/auth/login", { email, password });
  },

  /**
   * Register a new user (USER or STORE_OWNER).
   */
  signup: async ({ name, email, password, address, role }) => {
    return await axiosClient.post("/auth/signup", {
      name,
      email,
      password,
      address,
      role,
    });
  },

  /**
   * Retrieve currently authenticated user profile.
   */
  getMe: async () => {
    return await axiosClient.get("/auth/me");
  },

  /**
   * Change user password.
   */
  changePassword: async ({ oldPassword, newPassword }) => {
    return await axiosClient.patch("/auth/password", {
      oldPassword,
      newPassword,
    });
  },

  /**
   * Upload user profile photo.
   * @param {FormData} formData - FormData containing the file field 'photo'
   */
  uploadProfilePhoto: async (formData) => {
    return await axiosClient.post("/auth/profile-photo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * Remove user profile photo.
   */
  removeProfilePhoto: async () => {
    return await axiosClient.delete("/auth/profile-photo");
  },
};

export default authApi;
