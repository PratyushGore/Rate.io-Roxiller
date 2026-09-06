import React, { useState, useEffect } from "react";
import adminApi from "../../api/adminApi";

/**
 * Modal form for admins to create user accounts with designated roles.
 */
export default function AddUserModal({ isOpen = false, onClose, onUserAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "USER",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    if (generalError) setGeneralError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedAddress = formData.address.trim();

    if (!trimmedName) errors.name = "Name is required";
    else if (trimmedName.length > 60) errors.name = "Name cannot exceed 60 characters";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) errors.email = "Email is required";
    else if (!emailRegex.test(trimmedEmail)) errors.email = "Please enter a valid email";

    if (!formData.password) errors.password = "Password is required";
    else if (formData.password.length < 6) errors.password = "Password must be at least 6 characters";

    if (trimmedAddress && trimmedAddress.length > 400) errors.address = "Address cannot exceed 400 characters";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      setFieldErrors({});
      setGeneralError("");

      const res = await adminApi.createUser({
        name: trimmedName,
        email: trimmedEmail,
        password: formData.password,
        address: trimmedAddress || undefined,
        role: formData.role,
      });

      if (res.success && res.data) {
        onUserAdded(res.data);
        onClose();
        setFormData({
          name: "",
          email: "",
          password: "",
          address: "",
          role: "USER",
        });
      }
    } catch (err) {
      const msg = err.message || "Failed to create user";
      const lower = msg.toLowerCase();
      if (lower.includes("email")) {
        setFieldErrors({ email: msg });
      } else if (lower.includes("password")) {
        setFieldErrors({ password: msg });
      } else {
        setGeneralError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-0"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={!isSubmitting ? onClose : undefined}
      />

      <div className="relative bg-white rounded-2xl border border-surface-border p-6 sm:p-8 shadow-xl max-w-md w-full z-10 animate-scale-in">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Add Platform User</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Create an administrative, owner, or standard customer account.
            </p>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {generalError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs" noValidate>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Eleanor Vance"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold ${
                fieldErrors.name ? "border-red-400 bg-red-50/30" : "border-slate-300"
              }`}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-red-600 font-medium">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@example.com"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold ${
                fieldErrors.email ? "border-red-400 bg-red-50/30" : "border-slate-300"
              }`}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-red-600 font-medium">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold ${
                fieldErrors.password ? "border-red-400 bg-red-50/30" : "border-slate-300"
              }`}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-red-600 font-medium">{fieldErrors.password}</p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Account Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold bg-white"
            >
              <option value="USER">USER (Customer)</option>
              <option value="STORE_OWNER">STORE_OWNER (Store Owner)</option>
              <option value="ADMIN">ADMIN (System Administrator)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Address (Optional)</label>
            <textarea
              name="address"
              rows="2"
              value={formData.address}
              onChange={handleChange}
              placeholder="Mailing address..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-slate-900 bg-brand-gold hover:bg-brand-gold-hover rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
