import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PasswordStrengthSlider from "../components/common/PasswordStrengthSlider";

/**
 * Signup page with Customer / Store Owner role toggle.
 * Integrates live PasswordStrengthSlider and keeps submit button disabled until criteria are met.
 */
export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState("USER"); // "USER" | "STORE_OWNER"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
  });

  const [isPasswordStrong, setIsPasswordStrong] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (generalError) {
      setGeneralError("");
    }
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (fieldErrors.role) {
      setFieldErrors((prev) => ({ ...prev, role: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedAddress = formData.address.trim();

    if (!trimmedName) {
      errors.name = "Full name is required";
    } else if (trimmedName.length > 60) {
      errors.name = "Name cannot exceed 60 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      errors.email = "Email address is required";
    } else if (!emailRegex.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address";
    } else if (trimmedEmail.length > 255) {
      errors.email = "Email cannot exceed 255 characters";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (!isPasswordStrong) {
      errors.password = "Password must satisfy all strength requirements (8+ chars, uppercase, special character)";
    }

    if (trimmedAddress && trimmedAddress.length > 400) {
      errors.address = "Address cannot exceed 400 characters";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      setFieldErrors({});
      setGeneralError("");

      const user = await signup({
        name: trimmedName,
        email: trimmedEmail,
        password: formData.password,
        address: trimmedAddress || undefined,
        role,
      });

      if (user.role === "STORE_OWNER") {
        navigate("/owner/dashboard", { replace: true });
      } else {
        navigate("/stores", { replace: true });
      }
    } catch (err) {
      const msg = err.message || "Failed to create account";
      const lower = msg.toLowerCase();

      if (lower.includes("email")) {
        setFieldErrors({ email: msg });
      } else if (lower.includes("password")) {
        setFieldErrors({ password: msg });
      } else if (lower.includes("name")) {
        setFieldErrors({ name: msg });
      } else if (lower.includes("address")) {
        setFieldErrors({ address: msg });
      } else {
        setGeneralError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-6 sm:py-8 sm:px-6 lg:px-8 bg-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold-light border border-brand-gold/40 text-slate-800 text-xs font-bold mb-3">
          <span className="text-brand-gold text-sm">★</span> Join StoreRate.io
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create your account
        </h2>
        <p className="mt-1.5 text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-slate-900 hover:text-brand-gold underline">
            Log in here
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

          {/* Role Selection Toggle */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              I want to:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => handleRoleChange("USER")}
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                  role === "USER"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Rate Stores (Customer)
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange("STORE_OWNER")}
                className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                  role === "STORE_OWNER"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Manage Stores (Owner)
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-800">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Jane Doe"
                  className={`block w-full px-3.5 py-2.5 rounded-lg border ${
                    fieldErrors.name
                      ? "border-red-400 focus:ring-red-400 focus:border-red-400 bg-red-50/30"
                      : "border-slate-300 focus:ring-brand-gold focus:border-brand-gold"
                  } text-slate-900 placeholder-slate-400 text-sm shadow-xs transition-colors`}
                />
              </div>
              {fieldErrors.name && (
                <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                  <span>•</span> {fieldErrors.name}
                </p>
              )}
            </div>

            {/* Email Address */}
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

            {/* Password with Strength Slider */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-800">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
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

              {/* Live Password Strength Meter */}
              <PasswordStrengthSlider
                password={formData.password}
                onStrengthChange={setIsPasswordStrong}
              />

              {fieldErrors.password && (
                <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                  <span>•</span> {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Address (Optional) */}
            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-slate-800">
                Address <span className="text-xs text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="mt-1">
                <textarea
                  id="address"
                  name="address"
                  rows="2"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street, City, State, ZIP"
                  className={`block w-full px-3.5 py-2 rounded-lg border ${
                    fieldErrors.address
                      ? "border-red-400 focus:ring-red-400 focus:border-red-400 bg-red-50/30"
                      : "border-slate-300 focus:ring-brand-gold focus:border-brand-gold"
                  } text-slate-900 placeholder-slate-400 text-sm shadow-xs transition-colors`}
                />
              </div>
              {fieldErrors.address && (
                <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                  <span>•</span> {fieldErrors.address}
                </p>
              )}
            </div>

            {/* Submit Button (disabled until all 3 strength criteria pass) */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting || !isPasswordStrong}
                className="w-full flex justify-center py-2.5 px-4 rounded-lg shadow-xs text-sm font-bold text-slate-900 bg-brand-gold hover:bg-brand-gold-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? "Creating account..."
                  : !isPasswordStrong
                  ? "Enter a strong password to continue"
                  : `Register as ${role === "STORE_OWNER" ? "Store Owner" : "Customer"}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
