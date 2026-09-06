import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Login page supporting Customer, Store Owner, and Admin authentication.
 * Displays backend and client validation errors inline per field.
 */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error as user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (generalError) {
      setGeneralError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!formData.email.trim()) {
      errors.email = "A valid email address is required";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      setFieldErrors({});
      setGeneralError("");

      const user = await login(formData.email.trim(), formData.password);

      // Route by role as specified
      if (user.role === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      } else if (user.role === "STORE_OWNER") {
        navigate("/owner/dashboard", { replace: true });
      } else {
        const from = location.state?.from?.pathname || "/stores";
        navigate(from, { replace: true });
      }
    } catch (err) {
      const msg = err.message || "Failed to log in";
      const lower = msg.toLowerCase();

      if (lower.includes("email") && !lower.includes("password")) {
        setFieldErrors({ email: msg });
      } else if (lower.includes("password") && !lower.includes("email")) {
        setFieldErrors({ password: msg });
      } else {
        // "Invalid email or password" or other combined errors
        setGeneralError(msg);
        setFieldErrors({
          email: "Please check your email",
          password: "Please check your password",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-6 sm:py-8 sm:px-6 lg:px-8 bg-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold-light border border-brand-gold/40 text-slate-800 text-xs font-bold mb-3">
          <span className="text-brand-gold text-sm">★</span> Welcome Back
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Log in to your account
        </h2>
        <p className="mt-1.5 text-sm text-slate-600">
          Or{" "}
          <Link to="/signup" className="font-semibold text-slate-900 hover:text-brand-gold underline">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-6 sm:px-8 rounded-2xl border border-surface-border shadow-sm">
          {generalError && (
            <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2.5">
              <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-800">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`block w-full px-3.5 py-2.5 rounded-lg border ${
                    fieldErrors.email
                      ? "border-red-400 focus:ring-red-400 focus:border-red-400 bg-red-50/30"
                      : "border-slate-300 focus:ring-brand-gold focus:border-brand-gold"
                  } text-slate-900 placeholder-slate-400 text-sm shadow-xs transition-colors`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                  <span>•</span> {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-800">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`block w-full px-3.5 py-2.5 rounded-lg border ${
                    fieldErrors.password
                      ? "border-red-400 focus:ring-red-400 focus:border-red-400 bg-red-50/30"
                      : "border-slate-300 focus:ring-brand-gold focus:border-brand-gold"
                  } text-slate-900 placeholder-slate-400 text-sm shadow-xs transition-colors`}
                />
              </div>
              {fieldErrors.password && (
                <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                  <span>•</span> {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2.5 px-4 rounded-lg shadow-xs text-sm font-bold text-slate-900 bg-brand-gold hover:bg-brand-gold-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold transition-all duration-150 disabled:opacity-60"
              >
                {isSubmitting ? "Signing in..." : "Log in"}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials Footer */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Test Credentials:</p>
            <p>Admin: <span className="font-mono text-slate-600">admin@platform.com</span> / <span className="font-mono text-slate-600">Admin@123</span></p>
            <p>Owner: <span className="font-mono text-slate-600">owner1@craftcoffee.com</span> / <span className="font-mono text-slate-600">Owner@123</span></p>
            <p>Customer: <span className="font-mono text-slate-600">user1@example.com</span> / <span className="font-mono text-slate-600">User@123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
