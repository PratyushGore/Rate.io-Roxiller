import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Placeholder component for Admin and Store Owner dashboards until Phase 4 implementation.
 */
export default function PlaceholderDashboard({ title, roleRequired }) {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold-light border border-brand-gold/40 text-slate-900 text-xs font-bold mb-4">
        <span>★</span> Scheduled for Phase 4
      </div>

      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
        {title || "Dashboard Hub"}
      </h1>

      <p className="text-sm text-slate-600 max-w-lg mx-auto mb-8">
        Welcome back, <span className="font-semibold text-slate-800">{user?.name}</span> ({user?.role}). The dedicated management interface for {roleRequired || "this role"} is being built in Phase 4.
      </p>

      <div className="bg-white rounded-2xl border border-surface-border p-6 shadow-xs max-w-md mx-auto text-left mb-8">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phase 4 Roadmap:</h3>
        <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
          <li>Interactive statistics, analytics, and metrics</li>
          <li>Store lifecycle moderation & approval queue</li>
          <li>Customer review logs and detailed analytics</li>
        </ul>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Link
          to="/stores"
          className="inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-900 bg-brand-gold hover:bg-brand-gold-hover rounded-lg shadow-xs transition-colors"
        >
          Browse Public Stores
        </Link>
        <Link
          to="/profile"
          className="inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          View My Profile
        </Link>
      </div>
    </div>
  );
}
