import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import storeApi from "../api/storeApi";
import StoreCard from "../components/stores/StoreCard";
import CategoryPills from "../components/stores/CategoryPills";
import EmptyState from "../components/common/EmptyState";

/**
 * Dedicated search & discovery page.
 * Synchronizes search query and category filter with URL query parameters (/search?query=...&category=...)
 * or route parameter (/category/:category).
 */
export default function SearchPage() {
  const { category: routeCategory } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read initial query params from URL
  const initialQuery = searchParams.get("query") || "";
  const initialCategory = routeCategory || searchParams.get("category") || "All";
  const initialPage = parseInt(searchParams.get("page"), 10) || 1;

  const [queryInput, setQueryInput] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const [stores, setStores] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 12 });
  const [loading, setLoading] = useState(true);

  // Sync state if URL search parameters or route parameter changes externally
  useEffect(() => {
    const urlQ = searchParams.get("query") || "";
    const urlC = routeCategory || searchParams.get("category") || "All";
    const urlP = parseInt(searchParams.get("page"), 10) || 1;

    setQueryInput(urlQ);
    setDebouncedQuery(urlQ);
    setSelectedCategory(urlC);
    setCurrentPage(urlP);
  }, [searchParams, routeCategory]);

  // Debounce query typing by ~400ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(queryInput);
    }, 400);

    return () => clearTimeout(handler);
  }, [queryInput]);

  // Update URL parameters when debounced query, category, or page changes
  const updateUrlParams = useCallback(
    (q, cat, pg) => {
      const nextParams = new URLSearchParams();
      if (q && q.trim()) nextParams.set("query", q.trim());
      if (cat && cat !== "All" && cat !== "All Categories") nextParams.set("category", cat);
      if (pg && pg > 1) nextParams.set("page", pg.toString());

      if (routeCategory) {
        navigate(`/search?${nextParams.toString()}`, { replace: true });
      } else {
        setSearchParams(nextParams, { replace: true });
      }
    },
    [routeCategory, navigate, setSearchParams]
  );

  // Perform search API call
  const performSearch = useCallback(async () => {
    try {
      setLoading(true);
      const res = await storeApi.search({
        query: debouncedQuery,
        category: selectedCategory,
        page: currentPage,
        limit: 12,
      });

      if (res.success && res.data) {
        setStores(res.data.stores || []);
        if (res.data.pagination) {
          setPagination({
            total: res.data.pagination.total,
            totalPages: res.data.pagination.totalPages,
            limit: res.data.pagination.limit,
          });
        }
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, selectedCategory, currentPage]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);

  const handleSearchInputChange = (e) => {
    const val = e.target.value;
    setQueryInput(val);
    setCurrentPage(1);
    updateUrlParams(val, selectedCategory, 1);
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
    updateUrlParams(queryInput, cat, 1);
  };

  const handleClearFilters = () => {
    setQueryInput("");
    setDebouncedQuery("");
    setSelectedCategory("All");
    setCurrentPage(1);
    updateUrlParams("", "All", 1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    updateUrlParams(debouncedQuery, selectedCategory, newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full px-3 sm:px-5 lg:px-6 py-5 space-y-5">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold-light border border-brand-gold/40 text-slate-800 text-xs font-bold mb-2">
          <span>{selectedCategory && selectedCategory !== "All" ? "🏷️" : "🔍"}</span>
          <span>{selectedCategory && selectedCategory !== "All" ? "Category Explorer" : "Store Directory"}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          {selectedCategory && selectedCategory !== "All"
            ? `${selectedCategory} Stores`
            : "Search Stores"}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          {selectedCategory && selectedCategory !== "All"
            ? `Browse and rate verified community stores specializing in ${selectedCategory}.`
            : "Find stores by name, category, address, or product tags with intelligent relevance boosting."}
        </p>
      </div>

      {/* Main Search Input Bar */}
      <div className="relative w-full max-w-2xl">
        <input
          type="text"
          value={queryInput}
          onChange={handleSearchInputChange}
          placeholder="Type to search (e.g. coffee, electronics, Seattle, gadgets)..."
          className="w-full pl-11 pr-10 py-3 text-sm bg-white border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold placeholder-slate-400 shadow-sm transition-all"
        />
        <svg
          className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        {queryInput && (
          <button
            type="button"
            onClick={() => {
              setQueryInput("");
              setDebouncedQuery("");
              updateUrlParams("", selectedCategory, 1);
            }}
            className="absolute right-3.5 top-3.5 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Pills Filter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>Filter by Category:</span>
          {selectedCategory !== "All" && (
            <button
              type="button"
              onClick={() => handleCategorySelect("All")}
              className="text-brand-gold hover:underline font-bold"
            >
              Reset Category
            </button>
          )}
        </div>
        <CategoryPills
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />
      </div>

      {/* Active Filter Summary / Status */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <span>
          {loading ? (
            "Searching catalog..."
          ) : (
            <>
              Found <strong className="text-slate-800 font-bold">{pagination.total}</strong>{" "}
              {pagination.total === 1 ? "store" : "stores"}
              {debouncedQuery && (
                <> matching &ldquo;<strong>{debouncedQuery}</strong>&rdquo;</>
              )}
              {selectedCategory !== "All" && (
                <> in <span className="text-slate-800 font-bold">{selectedCategory}</span></>
              )}
            </>
          )}
        </span>

        {(debouncedQuery || selectedCategory !== "All") && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-slate-500 hover:text-red-600 text-xs font-semibold underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Results Grid */}
      <div>
        {loading ? (
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
              debouncedQuery || selectedCategory !== "All"
                ? "No stores matched your search terms or category selection. Try a different keyword or explore all categories."
                : "No approved stores found in the catalog."
            }
            actionText="Clear search filters"
            onAction={handleClearFilters}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map((store) => (
                <StoreCard
                  key={store.id}
                  store={store}
                  onStoreUpdated={(storeId, fields) => {
                    setStores((prev) =>
                      prev.map((s) => (s.id === storeId ? { ...s, ...fields } : s))
                    );
                  }}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="pt-8 flex items-center justify-between border-t border-slate-200 text-xs">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>

                <span className="font-semibold text-slate-600">
                  Page {currentPage} of {pagination.totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= pagination.totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
