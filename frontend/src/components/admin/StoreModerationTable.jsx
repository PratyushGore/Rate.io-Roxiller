import React, { useState, useEffect } from "react";
import adminApi from "../../api/adminApi";
import ConfirmDialog from "../common/ConfirmDialog";
import StarRating from "../common/StarRating";
import EmptyState from "../common/EmptyState";
import SortDropdown from "./SortDropdown";

const STORE_SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "rating_desc", label: "Highest Rated" },
  { value: "name_asc", label: "Name (A–Z)" },
  { value: "name_desc", label: "Name (Z–A)" },
];

/**
 * Store moderation console table for administrators.
 * Allows filtering, reviewing, approving, rejecting, and deleting stores.
 */
export default function StoreModerationTable({ onDataChanged }) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOption, setSortOption] = useState("newest");
  const [updatingStoreId, setUpdatingStoreId] = useState(null);

  // Confirmation dialog states
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    isDestructive: false,
    onConfirm: null,
  });

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getStores({
        search: debouncedSearch,
        status: statusFilter,
        sort: sortOption,
      });
      if (res.success && Array.isArray(res.data)) {
        setStores(res.data);
      }
    } catch (err) {
      console.error("Failed to load stores for moderation:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [debouncedSearch, statusFilter, sortOption]);

  // Handle status update with confirmation and optimistic UI
  const handleStatusUpdatePrompt = (store, targetStatus) => {
    setConfirmState({
      isOpen: true,
      title: `${targetStatus === "APPROVED" ? "Approve" : "Reject"} Store`,
      message: `Are you sure you want to mark "${store.name}" as ${targetStatus}?`,
      confirmText: targetStatus === "APPROVED" ? "Approve Store" : "Reject Store",
      isDestructive: targetStatus === "REJECTED",
      onConfirm: async () => {
        const previousStatus = store.status;
        // Optimistic UI update
        setUpdatingStoreId(store.id);
        setStores((prev) =>
          prev.map((s) => (s.id === store.id ? { ...s, status: targetStatus } : s))
        );
        setConfirmState((prev) => ({ ...prev, isOpen: false }));

        try {
          const res = await adminApi.updateStoreStatus(store.id, targetStatus);
          if (!res.success) {
            // Revert on non-success
            setStores((prev) =>
              prev.map((s) => (s.id === store.id ? { ...s, status: previousStatus } : s))
            );
            alert(res.message || "Failed to update store status");
          } else {
            if (onDataChanged) onDataChanged();
          }
        } catch (err) {
          // Revert on error
          setStores((prev) =>
            prev.map((s) => (s.id === store.id ? { ...s, status: previousStatus } : s))
          );
          alert(err.message || "Failed to update store status");
        } finally {
          setUpdatingStoreId(null);
        }
      },
    });
  };

  // Handle store deletion with confirmation
  const handleDeleteStorePrompt = (store) => {
    setConfirmState({
      isOpen: true,
      title: "Delete Store",
      message: `Are you sure you want to permanently delete store "${store.name}"? All associated ratings will also be removed. This cannot be undone.`,
      confirmText: "Delete Store",
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await adminApi.deleteStore(store.id);
          if (res.success) {
            setStores((prev) => prev.filter((s) => s.id !== store.id));
            if (onDataChanged) onDataChanged();
          }
        } catch (err) {
          alert(err.message || "Failed to delete store");
        } finally {
          setConfirmState((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const statusStyles = {
    APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
    PENDING: "bg-amber-100 text-amber-800 border-amber-200",
    REJECTED: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-surface-border shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-xs">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by store name, address, email..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="moderationStatusFilter" className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              Status:
            </label>
            <select
              id="moderationStatusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 pl-3 pr-8 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <SortDropdown
            id="storeModerationSort"
            value={sortOption}
            onChange={setSortOption}
            options={STORE_SORT_OPTIONS}
            label="Sort:"
          />
        </div>

        <span className="text-xs font-semibold text-slate-500 shrink-0">
          Showing {stores.length} {stores.length === 1 ? "store" : "stores"}
        </span>
      </div>

      {/* Moderation Table */}
      <div className="bg-white rounded-2xl border border-surface-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
            <thead className="bg-slate-50 font-bold text-slate-600 uppercase tracking-wider text-[11px]">
              <tr>
                <th scope="col" className="py-3.5 px-5">Store</th>
                <th scope="col" className="py-3.5 px-5">Owner</th>
                <th scope="col" className="py-3.5 px-5">Status</th>
                <th scope="col" className="py-3.5 px-5">Rating</th>
                <th scope="col" className="py-3.5 px-5">Address</th>
                <th scope="col" className="py-3.5 px-5 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-5">
                      <div className="h-4 bg-slate-200 rounded w-32 mb-1"></div>
                      <div className="h-3 bg-slate-100 rounded w-24"></div>
                    </td>
                    <td className="py-4 px-5"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                    <td className="py-4 px-5"><div className="h-5 bg-slate-200 rounded-full w-16"></div></td>
                    <td className="py-4 px-5"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                    <td className="py-4 px-5"><div className="h-4 bg-slate-100 rounded w-28"></div></td>
                    <td className="py-4 px-5 text-right"><div className="h-6 bg-slate-200 rounded w-24 ml-auto"></div></td>
                  </tr>
                ))
              ) : stores.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12">
                    <EmptyState
                      title="No stores found"
                      description="No stores match the current status filter or search criteria."
                    />
                  </td>
                </tr>
              ) : (
                stores.map((store) => {
                  const isUpdating = updatingStoreId === store.id;

                  return (
                    <tr key={store.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900">{store.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{store.email}</div>
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap text-slate-700">
                        {store.owner?.name || `Owner #${store.ownerId}`}
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            statusStyles[store.status] || "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {store.status}
                        </span>
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <StarRating value={store.averageRating || 0} readOnly={true} size="sm" />
                          <span className="font-bold text-slate-800 text-xs">
                            {store.ratingDisplay === "Unrated" ? "0.0" : store.ratingDisplay}
                          </span>
                          <span className="text-[10px] text-slate-400">({store.totalRatings || 0})</span>
                        </div>
                      </td>

                      <td className="py-4 px-5 max-w-xs truncate text-slate-600">
                        {store.address}
                      </td>

                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {/* Approve Action */}
                          {store.status !== "APPROVED" && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleStatusUpdatePrompt(store, "APPROVED")}
                              className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors disabled:opacity-50"
                            >
                              Approve
                            </button>
                          )}

                          {/* Reject Action */}
                          {store.status !== "REJECTED" && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleStatusUpdatePrompt(store, "REJECTED")}
                              className="px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>
                          )}

                          {/* Delete Action */}
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleDeleteStorePrompt(store)}
                            className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        isDestructive={confirmState.isDestructive}
        onConfirm={confirmState.onConfirm}
        onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
