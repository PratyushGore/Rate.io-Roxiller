import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ownerApi from "../api/ownerApi";
import ProfilePhotoUploader from "../components/common/ProfilePhotoUploader";

/**
 * Shared Profile page.
 * Implements user account overview, password change, Customer tab,
 * Store Owner summary tab, and Administrator authority tab.
 */
export default function Profile() {
  const { user, changePassword } = useAuth();

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Store owner profile state
  const [ownerStores, setOwnerStores] = useState([]);
  const [loadingOwnerStores, setLoadingOwnerStores] = useState(false);

  useEffect(() => {
    if (user?.role === "STORE_OWNER") {
      setLoadingOwnerStores(true);
      ownerApi
        .getMyStores()
        .then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setOwnerStores(res.data);
          }
        })
        .catch((err) => console.error("Failed to load owner stores in profile:", err))
        .finally(() => setLoadingOwnerStores(false));
    }
  }, [user?.role]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (passwordSuccess) {
      setPasswordSuccess("");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!passwordData.oldPassword) {
      errors.oldPassword = "Current password is required";
    }
    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = "New password must be at least 6 characters long";
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      setPasswordErrors({});
      setPasswordSuccess("");

      const res = await changePassword(passwordData.oldPassword, passwordData.newPassword);
      setPasswordSuccess(res.message || "Password updated successfully!");
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      const msg = err.message || "Failed to update password";
      setPasswordErrors({ general: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleLabels = {
    ADMIN: "System Administrator",
    STORE_OWNER: "Store Owner",
    USER: "Customer Account",
  };

  const statusStyles = {
    APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
    PENDING: "bg-amber-100 text-amber-800 border-amber-200",
    REJECTED: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div className="w-full px-3 sm:px-5 lg:px-6 py-5">
      {/* Page Heading */}
      <div className="pb-4 border-b border-surface-border">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Account & Profile
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your personal details, role credentials, and security settings.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card & Tabs */}
        <div className="lg:col-span-2 space-y-8">
          {/* User Overview Card */}
          <div className="bg-white rounded-2xl border border-surface-border p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-5 mb-6">
              <ProfilePhotoUploader size="lg" />
              <div>
                <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
                <p className="text-xs text-slate-500">{user?.email}</p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-gold-light text-slate-900 border border-brand-gold/30">
                    {roleLabels[user?.role] || user?.role}
                  </span>
                </div>
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-100 text-xs">
              <div>
                <dt className="text-slate-400 font-semibold uppercase tracking-wider">Account ID</dt>
                <dd className="mt-1 font-mono text-slate-800">#{user?.id}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-semibold uppercase tracking-wider">Registered Email</dt>
                <dd className="mt-1 font-medium text-slate-800">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-semibold uppercase tracking-wider">Mailing Address</dt>
                <dd className="mt-1 font-medium text-slate-800">{user?.address || "No address provided"}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-semibold uppercase tracking-wider">Member Since</dt>
                <dd className="mt-1 font-medium text-slate-800">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Active Member"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Customer Tab: Implemented in Phase 3 */}
          <div className="bg-white rounded-2xl border border-surface-border p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-brand-gold text-lg">★</span>
              <h3 className="text-lg font-bold text-slate-900">Customer Activity & Rating Guidelines</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              As a verified customer on StoreRate.io, your reviews directly shape the community rating scores. You can rate any approved store on a scale of 1 to 5 stars directly from the store catalog or the detail page.
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-2">
              <div className="font-bold text-slate-800">Rating Tips:</div>
              <ul className="list-disc list-inside space-y-1 text-slate-500">
                <li>Submit authentic ratings based on your real customer experience.</li>
                <li>You can update or adjust your existing rating for any store at any time.</li>
                <li>Your ratings are compiled into the store's overall weighted average.</li>
              </ul>
            </div>
          </div>

          {/* Store Owner Tab (Phase 4 Active Tab) */}
          {user?.role === "STORE_OWNER" && (
            <div className="bg-white rounded-2xl border border-surface-border p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏪</span>
                  <h3 className="text-lg font-bold text-slate-900">Owned Stores & Status Summary</h3>
                </div>
                <Link
                  to="/owner/dashboard"
                  className="text-xs font-bold text-brand-gold hover:text-brand-gold-hover inline-flex items-center gap-1 transition-colors"
                >
                  <span>Open Owner Console</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>

              <p className="text-xs text-slate-600">
                Summary of your registered locations and customer satisfaction averages:
              </p>

              {loadingOwnerStores ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-12 bg-slate-100 rounded-xl"></div>
                  <div className="h-12 bg-slate-100 rounded-xl"></div>
                </div>
              ) : ownerStores.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                  You have not registered any stores yet.{" "}
                  <Link to="/owner/dashboard" className="text-brand-gold hover:text-brand-gold-hover font-bold underline">
                    Register a store in your console
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                  {ownerStores.map((s) => (
                    <div
                      key={s.id}
                      className="p-3.5 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 block truncate">{s.name}</span>
                        <span className="text-slate-400 text-[11px] block truncate">{s.address}</span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1 font-bold text-slate-800">
                          <span className="text-brand-gold">★</span>
                          <span>{s.ratingDisplay === "Unrated" ? "0.0" : s.ratingDisplay}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({s.totalRatings || 0})</span>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            statusStyles[s.status] || "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {s.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Admin Tab (Phase 4 Active Tab) */}
          {user?.role === "ADMIN" && (
            <div className="bg-white rounded-2xl border border-surface-border p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🛡️</span>
                  <h3 className="text-lg font-bold text-slate-900">Administrator Authority & Privileges</h3>
                </div>
                <Link
                  to="/admin/dashboard"
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1 transition-colors"
                >
                  <span>Open Admin Console</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>

              <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-xl space-y-2 text-xs text-slate-700">
                <div className="font-bold text-purple-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                  <span>Full System Administration Scope</span>
                </div>
                <p className="leading-relaxed text-slate-600">
                  Your account is granted administrative authority over StoreRate.io. You can moderate store registrations (approving or rejecting listings), manage user accounts, and oversee system metrics.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Security & Password Change */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-surface-border p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">Change Password</h3>

            {passwordSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                {passwordSuccess}
              </div>
            )}

            {passwordErrors.general && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 font-medium">
                {passwordErrors.general}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs" noValidate>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                  placeholder="••••••••"
                />
                {passwordErrors.oldPassword && (
                  <p className="mt-1 text-red-600 font-medium">{passwordErrors.oldPassword}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  New Password (min 6 chars)
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                  placeholder="••••••••"
                />
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-red-600 font-medium">{passwordErrors.newPassword}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                  placeholder="••••••••"
                />
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-red-600 font-medium">{passwordErrors.confirmPassword}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 px-3 rounded-lg text-xs font-bold text-slate-900 bg-brand-gold hover:bg-brand-gold-hover shadow-xs transition-colors disabled:opacity-60"
                >
                  {isSubmitting ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
