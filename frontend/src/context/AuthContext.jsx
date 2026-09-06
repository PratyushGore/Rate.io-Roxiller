import React, { createContext, useContext, useState, useEffect } from "react";
import authApi from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Rehydrate authenticated user on app load
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const savedToken = localStorage.getItem("token");
      if (!savedToken) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const res = await authApi.getMe();
        if (isMounted && res.success && res.data) {
          setUser(res.data);
          setToken(savedToken);
        }
      } catch (err) {
        if (isMounted) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Log in user and fetch updated profile.
   */
  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.success && res.data) {
      const { user: loggedInUser, token: receivedToken } = res.data;
      localStorage.setItem("token", receivedToken);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      setToken(receivedToken);

      // Verify and set authoritative user state from /me
      try {
        const meRes = await authApi.getMe();
        const authoritativeUser = meRes.data || loggedInUser;
        setUser(authoritativeUser);
        return authoritativeUser;
      } catch {
        setUser(loggedInUser);
        return loggedInUser;
      }
    }
    throw new Error(res.message || "Failed to log in");
  };

  /**
   * Sign up new user.
   */
  const signup = async (data) => {
    const res = await authApi.signup(data);
    if (res.success && res.data) {
      const { user: newUser, token: receivedToken } = res.data;
      localStorage.setItem("token", receivedToken);
      localStorage.setItem("user", JSON.stringify(newUser));
      setToken(receivedToken);
      setUser(newUser);
      return newUser;
    }
    throw new Error(res.message || "Failed to sign up");
  };

  /**
   * Log out user and clear stored credentials.
   */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
  };

  /**
   * Change user password.
   */
  const changePassword = async (oldPassword, newPassword) => {
    return await authApi.changePassword({ oldPassword, newPassword });
  };

  /**
   * Refresh user profile from backend.
   */
  const refreshUser = async () => {
    try {
      const res = await authApi.getMe();
      if (res.success && res.data) {
        setUser(res.data);
      }
    } catch {
      // Ignored
    }
  };

  /**
   * Update user data in state and localStorage.
   */
  const updateUserData = (updatedUser) => {
    setUser(updatedUser);
    if (updatedUser) {
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    login,
    signup,
    logout,
    changePassword,
    refreshUser,
    updateUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
