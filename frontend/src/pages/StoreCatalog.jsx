import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import storeApi from "../api/storeApi";
import StoreCard from "../components/stores/StoreCard";
import HeroSlider from "../components/stores/HeroSlider";
import CategoryPills from "../components/stores/CategoryPills";
import CategoryCardsSection from "../components/stores/CategoryCardsSection";
import Top10Stores from "../components/stores/Top10Stores";
import EmptyState from "../components/common/EmptyState";

/**
 * Store catalog & homepage featuring full-width HeroSlider, CategoryPills, and store discovery.
 */
export default function StoreCatalog() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("rating_desc");

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);

    return () => clearTimeout(handler);
  }, [search]);

  // Fetch stores from API
  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      let sortBy = "rating";
      let order = "desc";

      if (sortOption === "rating_asc") {
        sortBy = "rating";
        order = "asc";
      } else if (sortOption === "name_asc") {
        sortBy = "name";
        order = "asc";
      } else if (sortOption === "name_desc") {
        sortBy = "name";
        order = "desc";
      }

      // If a category is selected and not "All", filter by search/category
      const res = await storeApi.getStores({
        search: debouncedSearch,
        sortBy,
        order,
      });

      if (res.success && Array.isArray(res.data)) {
        let filtered = res.data;
        if (selectedCategory && selectedCategory !== "All" && selectedCategory !== "All Categories") {
          filtered = filtered.filter(
            (s) => s.category?.toLowerCase() === selectedCategory.toLowerCase()
          );
        }
        setStores(filtered);
      }
    } catch (err) {
      console.error("Failed to load stores:", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory, sortOption]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Handle local store state update when rated inline
  const handleStoreUpdated = (storeId, updatedFields) => {
    setStores((prevStores) =>
      prevStores.map((s) => (s.id === storeId ? { ...s, ...updatedFields } : s))
    );
  };

  return (
    <div className="space-y-5 pb-6">
      {/* 1. Full-Width Edge-to-Edge Hero Carousel */}
      <section aria-label="Featured Top-Rated Stores" className="w-full">
        <HeroSlider />
      </section>

      {/* Main Page Container */}
      <div className="w-full px-3 sm:px-5 lg:px-6 space-y-6">
        {/* Categories Section (Cards Grid) */}
        <CategoryCardsSection stores={stores} />

        {/* 2. Category Filter Pills Bar */}
        <section className="space-y-2.5" aria-label="Store Categories">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Explore by Category
            </h2>
            {selectedCategory !== "All" && (
              <button
                type="button"
                onClick={() => setSelectedCategory("All")}
                className="text-xs font-semibold text-brand-gold hover:underline"
              >
                Reset to All
              </button>
            )}
          </div>
          <CategoryPills
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
          />
        </section>

        {/* 3. Catalog Section with Header & Controls */}
        <section className="space-y-4" aria-label="Store Catalog">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-surface-border">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold-light border border-brand-gold/40 text-slate-900 text-xs font-bold mb-2">
                <span className="text-brand-gold text-sm">★</span> Community Rated
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {selectedCategory && selectedCategory !== "All"
                  ? `${selectedCategory} Stores`
                  : "All Approved Stores"}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Browse verified community stores, review customer feedback, and submit your personal ratings.
              </p>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or address..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold placeholder-slate-400 shadow-xs"
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
                    className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <label htmlFor="sortBy" className="text-xs font-bold text-slate-500 whitespace-nowrap">
                  Sort:
                </label>
                <select
                  id="sortBy"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="py-2 pl-3 pr-8 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold font-semibold text-slate-700 shadow-xs cursor-pointer"
                >
                  <option value="rating_desc">Highest Rated</option>
                  <option value="rating_asc">Lowest Rated</option>
                  <option value="name_asc">Name (A-Z)</option>
                  <option value="name_desc">Name (Z-A)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Grid Content */}
          <div>
            {loading ? (
              /* Loading Skeletons */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
                    <div className="w-full aspect-video bg-slate-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                      <div className="h-8 bg-slate-50 rounded mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : stores.length === 0 ? (
              <EmptyState
                title="No matching stores found"
                description={
                  search || selectedCategory !== "All"
                    ? "No stores match your current filters. Try resetting the category or adjusting your search term."
                    : "No approved stores are currently available in the catalog."
                }
                actionText={search || selectedCategory !== "All" ? "Clear all filters" : undefined}
                onAction={
                  search || selectedCategory !== "All"
                    ? () => {
                        setSearch("");
                        setSelectedCategory("All");
                      }
                    : undefined
                }
              />
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stores.slice(0, 6).map((store) => (
                    <StoreCard
                      key={store.id}
                      store={store}
                      onStoreUpdated={handleStoreUpdated}
                    />
                  ))}
                </div>

                {stores.length > 6 && (
                  <div className="pt-2 text-center">
                    <Link
                      to="/search"
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-lg shadow-xs transition-colors"
                    >
                      <span>Explore All {stores.length} Approved Stores</span>
                      <span>→</span>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* 4. Top 10 Stores Leaderboard Section */}
        <Top10Stores onStoreUpdated={handleStoreUpdated} />
      </div>
    </div>
  );
}
