import React, { useState, useEffect, useCallback } from "react";
import ownerApi from "../api/ownerApi";
import OwnerStoreSelector from "../components/owner/OwnerStoreSelector";
import AddStoreModal from "../components/owner/AddStoreModal";
import CustomerRatingTable from "../components/owner/CustomerRatingTable";
import StarRating from "../components/common/StarRating";
import EmptyState from "../components/common/EmptyState";

/**
 * Store Owner Dashboard console.
 * Enables switching owned stores, registering new stores, viewing live analytics, and sorting customer ratings.
 */
export default function OwnerDashboard() {
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [sortOption, setSortOption] = useState({ sortBy: "date", order: "desc" });

  // Fetch all stores owned by this owner
  const fetchOwnerStores = async () => {
    try {
      setLoadingStores(true);
      const res = await ownerApi.getMyStores();
      if (res.success && Array.isArray(res.data)) {
        setStores(res.data);
        if (res.data.length > 0 && !selectedStoreId) {
          setSelectedStoreId(res.data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch owner stores:", err);
    } finally {
      setLoadingStores(false);
    }
  };

  useEffect(() => {
    fetchOwnerStores();
  }, []);

  // Fetch store analytics whenever selectedStoreId or sortOption changes
  const fetchStoreAnalytics = useCallback(async () => {
    if (!selectedStoreId) return;

    try {
      setLoadingAnalytics(true);
      const res = await ownerApi.getStoreAnalytics(selectedStoreId, {
        sortBy: sortOption.sortBy,
        order: sortOption.order,
      });
      if (res.success && res.data) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.error("Failed to load store analytics:", err);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [selectedStoreId, sortOption]);

  useEffect(() => {
    fetchStoreAnalytics();
  }, [fetchStoreAnalytics]);

  const handleStoreAdded = (newStore) => {
    setStores((prev) => [newStore, ...prev]);
    setSelectedStoreId(newStore.id);
  };

  const handleSortChange = (sortBy, order) => {
    setSortOption({ sortBy, order });
  };

  const activeStore = stores.find((s) => s.id === selectedStoreId) || analytics;

  return (
    <div className="w-full px-3 sm:px-5 lg:px-6 py-5 space-y-5">
      {/* Page Header */}
      <div className="pb-4 border-b border-surface-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold mb-2">
            <span>🏪</span> Store Owner Console
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Store Performance & Reviews
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor customer reviews, track average store ratings, and register business locations.
          </p>
        </div>
      </div>

      {/* Store Switcher & Register Button */}
      <OwnerStoreSelector
        stores={stores}
        selectedStoreId={selectedStoreId}
        onSelectStore={(id) => setSelectedStoreId(id)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {loadingStores ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          <div className="h-32 bg-white rounded-2xl border border-slate-200"></div>
          <div className="h-32 bg-white rounded-2xl border border-slate-200"></div>
          <div className="h-32 bg-white rounded-2xl border border-slate-200"></div>
        </div>
      ) : stores.length === 0 ? (
        <div className="bg-white rounded-2xl border border-surface-border p-12 text-center">
          <EmptyState
            title="You don't have any registered stores"
            description="Register your first store to start collecting customer ratings and monitoring review analytics."
            actionText="+ Register Store"
            onAction={() => setIsAddModalOpen(true)}
          />
        </div>
      ) : (
        activeStore && (
          <div className="space-y-8">
            {/* Status Notification Banners */}
            {activeStore.status === "PENDING" && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
                <span className="text-lg">⏳</span>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider">Pending Administrative Review</h3>
                  <p className="text-xs text-amber-800 mt-0.5">
                    This store was submitted for review. Once verified and approved by system administrators, it will be visible to the public in the catalog and open for ratings.
                  </p>
                </div>
              </div>
            )}

            {activeStore.status === "REJECTED" && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
                <span className="text-lg">❌</span>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider">Store Submission Rejected</h3>
                  <p className="text-xs text-red-800 mt-0.5">
                    This store submission was rejected by platform administrators. Please contact administrative support or review your details.
                  </p>
                </div>
              </div>
            )}

            {/* Performance Metric Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Average Rating Tile */}
              <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Average Rating
                  </span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">
                      {activeStore.ratingDisplay === "Unrated"
                        ? "0.0"
                        : activeStore.averageRating !== undefined
                        ? activeStore.averageRating
                        : activeStore.ratingDisplay}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">/ 5.0</span>
                  </div>
                  <div className="mt-1">
                    <StarRating
                      value={activeStore.averageRating || 0}
                      readOnly={true}
                      size="sm"
                    />
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-brand-gold-light text-brand-gold flex items-center justify-center text-xl font-bold">
                  ★
                </div>
              </div>

              {/* Total Reviews Tile */}
              <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Customer Ratings
                  </span>
                  <div className="mt-2 text-3xl font-black text-slate-900">
                    {activeStore.totalRatings || 0}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {activeStore.totalRatings === 1 ? "1 review submitted" : `${activeStore.totalRatings || 0} total reviews`}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-xl">
                  👥
                </div>
              </div>

              {/* Store Details Tile */}
              <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Store Information
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <h4 className="font-bold text-slate-900 truncate">{activeStore.name}</h4>
                    {activeStore.status && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 ${
                          activeStore.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : activeStore.status === "PENDING"
                            ? "bg-amber-100 text-amber-800 border-amber-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        }`}
                      >
                        {activeStore.status}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{activeStore.address}</p>
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-2 truncate">
                  {activeStore.email}
                </div>
              </div>
            </div>

            {/* Customer Ratings Log Table */}
            <CustomerRatingTable
              ratingsLog={analytics?.ratingsLog || []}
              sortBy={sortOption.sortBy}
              order={sortOption.order}
              onSortChange={handleSortChange}
              loading={loadingAnalytics}
            />
          </div>
        )
      )}

      {/* Add Store Modal Dialog */}
      <AddStoreModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onStoreAdded={handleStoreAdded}
      />
    </div>
  );
}
