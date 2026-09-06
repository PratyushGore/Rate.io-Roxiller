import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Route wrapper that enforces authentication and optional role restrictions.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Protected element to render
 * @param {string[]} [props.allowedRoles] - Optional list of authorized roles
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-gold rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-slate-500">Checking authorization...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v.01M12 9v4m-7 8h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
        <p className="text-sm text-slate-600 mb-6">
          You do not have the required permissions ({allowedRoles.join(" or ")}) to view this page.
        </p>
        <a
          href="/stores"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-slate-900 bg-brand-gold hover:bg-brand-gold-hover rounded-lg shadow-xs transition-colors"
        >
          Return to Stores
        </a>
      </div>
    );
  }

  return children;
}
