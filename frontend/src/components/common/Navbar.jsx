import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LeftDrawerNavbar from "./LeftDrawerNavbar";
import { getImageUrl } from "../../utils/imageUrl";

/**
 * Responsive top navigation bar styled with IMDb-inspired light aesthetics and brand-gold accents.
 * Includes a persistent global search bar on desktop and opens LeftDrawerNavbar on mobile.
 */
export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopSearch, setDesktopSearch] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDesktopSearch = (e) => {
    e.preventDefault();
    if (desktopSearch.trim()) {
      navigate(`/search?query=${encodeURIComponent(desktopSearch.trim())}`);
      setDesktopSearch("");
    }
  };

  const isActive = (path) => location.pathname === path;

  const roleBadgeStyles = {
    ADMIN: "bg-purple-100 text-purple-800 border-purple-200",
    STORE_OWNER: "bg-blue-100 text-blue-800 border-blue-200",
    USER: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };

  return (
    <>
      <header className="border-b border-surface-border bg-white sticky top-0 z-30 shadow-xs">
        <div className="w-full px-3 sm:px-5 lg:px-6">
          <div className="h-16 flex items-center justify-between gap-4">
            {/* Left: Brand Logo & Desktop Navigation Links */}
            <div className="flex items-center gap-6 shrink-0">
              <Link to="/stores" className="flex items-center gap-2 group">
                <span className="bg-brand-gold group-hover:bg-brand-gold-hover text-slate-900 font-extrabold px-2.5 py-1 rounded text-xs tracking-wider shadow-xs transition-colors">
                  STORE
                </span>
                <span className="font-extrabold text-xl text-slate-900 tracking-tight">
                  Rate<span className="text-brand-gold">.io</span>
                </span>
              </Link>

              {/* Desktop Nav Links */}
              <nav className="hidden lg:flex items-center space-x-1">
                <Link
                  to="/stores"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/stores")
                      ? "text-slate-900 bg-slate-100 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  Browse Stores
                </Link>

                <Link
                  to="/search"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/search")
                      ? "text-slate-900 bg-slate-100 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  Search
                </Link>

                {isAuthenticated && user?.role === "ADMIN" && (
                  <Link
                    to="/admin/dashboard"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/admin/dashboard")
                        ? "text-purple-900 bg-purple-50 font-semibold"
                        : "text-slate-600 hover:text-purple-700 hover:bg-slate-50"
                    }`}
                  >
                    Admin Hub
                  </Link>
                )}

                {isAuthenticated && user?.role === "STORE_OWNER" && (
                  <Link
                    to="/owner/dashboard"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/owner/dashboard")
                        ? "text-slate-900 bg-brand-gold-light font-semibold"
                        : "text-slate-600 hover:text-brand-gold-hover hover:bg-slate-50"
                    }`}
                  >
                    Owner Hub
                  </Link>
                )}
              </nav>
            </div>

            {/* Middle: Persistent Global Search Bar on Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-2">
              <form onSubmit={handleDesktopSearch} className="w-full relative">
                <input
                  type="text"
                  value={desktopSearch}
                  onChange={(e) => setDesktopSearch(e.target.value)}
                  placeholder="Search stores, tags, categories..."
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold placeholder-slate-400 shadow-xs transition-all"
                />
                <button
                  type="submit"
                  className="absolute left-3 top-2 text-slate-400 hover:text-slate-600"
                  title="Search"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
            </div>

            {/* Right: Desktop Auth & Profile Actions */}
            <div className="hidden md:flex items-center space-x-3 shrink-0">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  {/* Role Pill */}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${
                      roleBadgeStyles[user?.role] || "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {user?.role === "STORE_OWNER" ? "Owner" : user?.role}
                  </span>

                  {/* Profile Link */}
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 py-1.5 px-3 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs overflow-hidden shrink-0 border border-slate-300">
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
                    <span className="max-w-[120px] truncate">{user?.name}</span>
                  </Link>

                  {/* Logout Button */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-xs font-semibold text-slate-500 hover:text-red-600 px-2.5 py-1.5 rounded-md hover:bg-red-50 transition-colors"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="text-sm font-semibold text-slate-900 bg-brand-gold hover:bg-brand-gold-hover px-4 py-2 rounded-lg shadow-xs transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden items-center gap-2">
              <Link
                to="/search"
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
                aria-label="Open navigation menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-over Left Drawer on Mobile */}
      <LeftDrawerNavbar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}
