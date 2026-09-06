import React, { useState, useEffect } from "react";
import adminApi from "../api/adminApi";
import MetricTile from "../components/admin/MetricTile";
import StoreModerationTable from "../components/admin/StoreModerationTable";
import UserTable from "../components/admin/UserTable";

/**
 * Platform Administrator Console page.
 * Displays system metrics, store moderation lifecycle, and user account management.
 */
export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [activeTab, setActiveTab] = useState("stores"); // "stores" | "users"

  const fetchMetrics = async () => {
    try {
      setLoadingMetrics(true);
      const res = await adminApi.getMetrics();
      if (res.success && res.data) {
        setMetrics(res.data);
      }
    } catch (err) {
      console.error("Failed to load admin metrics:", err);
    } finally {
      setLoadingMetrics(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="w-full px-3 sm:px-5 lg:px-6 py-5 space-y-5">
      {/* Header */}
      <div className="pb-4 border-b border-surface-border">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold mb-2">
          <span>🛡️</span> Administrator Console
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          System Overview & Moderation
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Review business listings, moderate store submissions, and administer platform user accounts.
        </p>
      </div>

      {/* Metrics Overview Tiles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <MetricTile
          label="Total Users"
          value={metrics?.totalUsers}
          subtitle={`${metrics?.roleBreakdown?.users || 0} customers • ${metrics?.roleBreakdown?.storeOwners || 0} owners`}
          badgeText="Active"
          badgeType="success"
          icon="👥"
        />

        <MetricTile
          label="Total Stores"
          value={metrics?.totalStores}
          subtitle={`${metrics?.storeBreakdown?.approved || 0} approved • ${metrics?.storeBreakdown?.rejected || 0} rejected`}
          badgeText="Listed"
          badgeType="neutral"
          icon="🏪"
        />

        <MetricTile
          label="Pending Review"
          value={metrics?.storeBreakdown?.pending}
          subtitle={
            (metrics?.storeBreakdown?.pending || 0) > 0
              ? "Action required"
              : "All stores reviewed"
          }
          badgeText={(metrics?.storeBreakdown?.pending || 0) > 0 ? "Pending" : "Cleared"}
          badgeType={(metrics?.storeBreakdown?.pending || 0) > 0 ? "warning" : "success"}
          icon="⏳"
        />
      </div>

      {/* Console Tab Selector */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("stores")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "stores"
              ? "border-brand-gold text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Store Moderation</span>
          {(metrics?.storeBreakdown?.pending || 0) > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900">
              {metrics.storeBreakdown.pending}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "users"
              ? "border-brand-gold text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          User Management
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "stores" && (
          <StoreModerationTable onDataChanged={fetchMetrics} />
        )}
        {activeTab === "users" && (
          <UserTable onDataChanged={fetchMetrics} />
        )}
      </div>
    </div>
  );
}
