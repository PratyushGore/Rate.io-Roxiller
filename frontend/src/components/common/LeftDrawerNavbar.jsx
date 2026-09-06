import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getImageUrl } from "../../utils/imageUrl";

/**
 * Slide-over navigation drawer from the left on mobile screens (< md).
 * Features a semi-transparent blurred backdrop and closes on route change or outside click.
 */
export default function LeftDrawerNavbar({ isOpen = false, onClose }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  // Automatically close the drawer whenever route changes
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname]);

  // Lock body scroll while mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
      {/* Semi-transparent blurred backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-white shadow-2xl z-50 flex flex-col justify-between overflow-y-auto transform transition-transform duration-300 ease-out border-r border-surface-border">
        {/* Top Section */}
        <div className="p-5 space-y-6">
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <Link to="/stores" onClick={onClose} className="flex items-center gap-2">
              <span className="bg-brand-gold text-slate-900 font-extrabold px-2 py-0.5 rounded text-xs tracking-wider shadow-xs">
                STORE
              </span>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                Rate<span className="text-brand-gold">.io</span>
              </span>
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Quick Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search stores, tags, categories..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold text-slate-900 placeholder-slate-400 shadow-xs"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>

          {/* Navigation Links */}
          <nav className="space-y-1 text-sm font-medium">
            <Link
              to="/stores"
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive("/stores")
                  ? "bg-slate-100 text-slate-900 font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>🏪</span>
              <span>Browse Stores</span>
            </Link>

            <Link
              to="/search"
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive("/search")
                  ? "bg-slate-100 text-slate-900 font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>🔍</span>
              <span>Search Catalog</span>
            </Link>

            {isAuthenticated && user?.role === "ADMIN" && (
              <Link
                to="/admin/dashboard"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive("/admin/dashboard")
                    ? "bg-purple-50 text-purple-900 font-bold"
                    : "text-slate-600 hover:bg-purple-50/50 hover:text-purple-800"
                }`}
              >
                <span>🛡️</span>
                <span>Admin Hub</span>
              </Link>
            )}

            {isAuthenticated && user?.role === "STORE_OWNER" && (
              <Link
                to="/owner/dashboard"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive("/owner/dashboard")
                    ? "bg-brand-gold-light text-slate-900 font-bold"
                    : "text-slate-600 hover:bg-brand-gold-light/50 hover:text-brand-gold-hover"
                }`}
              >
                <span>💼</span>
                <span>Owner Hub</span>
              </Link>
            )}

            {isAuthenticated && (
              <Link
                to="/profile"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive("/profile")
                    ? "bg-slate-100 text-slate-900 font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span>👤</span>
                <span>My Profile</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Bottom Auth Actions */}
        <div className="p-5 border-t border-slate-100 bg-white">
          {isAuthenticated ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-slate-300">
                  {user?.profilePhoto ? (
                    <img
                      src={getImageUrl(user.profilePhoto)}
                      alt={user?.name || "User"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <span>{user?.name ? user.name.charAt(0).toUpperCase() : "U"}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2 px-3 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors text-center"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                to="/login"
                onClick={onClose}
                className="w-full text-center py-2 px-3 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-xs"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                onClick={onClose}
                className="w-full text-center py-2 px-3 text-xs font-bold text-slate-900 bg-brand-gold hover:bg-brand-gold-hover rounded-lg shadow-xs transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
