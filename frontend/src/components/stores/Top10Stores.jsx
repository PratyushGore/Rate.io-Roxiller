import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import storeApi from "../../api/storeApi";
import { getImageUrl } from "../../utils/imageUrl";

/**
 * Top 10 Stores section on the normal page theme:
 * - Top row: 3 large featured cards for #1, #2, #3 (poster on left, details on right).
 * - Bottom row: 7 vertical poster cards for #4 through #10 in a 7-column grid.
 * - Integrates directly into the page's light theme without an outer dark box container.
 */
export default function Top10Stores() {
  const [topStores, setTopStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchTopStores = async () => {
      try {
        setLoading(true);
        const res = await storeApi.getTopRated();
        if (isMounted && res.success && Array.isArray(res.data)) {
          // Strictly sorted descending by averageRating, then totalRatings
          const sorted = [...res.data]
            .sort((a, b) => {
              const ratingDiff = (b.averageRating || 0) - (a.averageRating || 0);
              if (ratingDiff !== 0) return ratingDiff;
              return (b.totalRatings || 0) - (a.totalRatings || 0);
            })
            .slice(0, 10);

          setTopStores(sorted);
        }
      } catch (err) {
        console.error("Failed to load top 10 stores:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTopStores();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="space-y-4" aria-label="Top 10 Stores">
        <div className="h-7 bg-slate-200 rounded w-52 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white h-56 rounded-xl animate-pulse border border-slate-200" />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
          {[4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="bg-white h-48 rounded-xl animate-pulse border border-slate-200" />
          ))}
        </div>
      </section>
    );
  }

  if (topStores.length === 0) {
    return null;
  }

  // Top 3 featured stores for the top row
  const top3 = topStores.slice(0, 3);
  // Remaining stores (up to 7) for the bottom row
  const rest7 = topStores.slice(3, 10);

  return (
    <section
      aria-label="Top 10 Stores on StoreRate"
      className="space-y-5"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-4">
        <div className="flex items-center gap-3">
          {/* Gold accent bar */}
          <div className="w-1.5 h-7 bg-brand-gold rounded-full shrink-0" />
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              Top 10 Stores
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Ranked by verified customer rating — highest rated first (#1) through tenth (#10).
            </p>
          </div>
        </div>

        <Link
          to="/search?category=All"
          className="text-xs font-semibold text-brand-gold hover:text-brand-gold-hover hover:underline transition-colors shrink-0"
        >
          View Full Ranking →
        </Link>
      </div>

      {/* 1. TOP ROW: 3 Large Featured Cards (#1, #2, #3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {top3.map((store, index) => {
          const rankNumber = index + 1;
          const year = store.createdAt
            ? new Date(store.createdAt).getFullYear()
            : 2026;

          return (
            <div
              key={store.id}
              className="bg-white rounded-xl border border-surface-border shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex group"
            >
              {/* Left: Poster Image with Bookmark overlay */}
              <Link
                to={`/stores/${store.id}`}
                className="relative w-5/12 sm:w-2/5 shrink-0 bg-slate-100 block overflow-hidden aspect-[2/3]"
              >
                <img
                  src={getImageUrl(store.imageUrl)}
                  alt={store.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />

                {/* Bookmark Flag overlay */}
                <div className="absolute top-0 left-0">
                  <div className="relative bg-white/90 hover:bg-white text-slate-900 w-7 h-9 flex items-center justify-center backdrop-blur-xs transition-colors shadow-xs">
                    <svg
                      className="w-4 h-4 text-slate-900"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                </div>
              </Link>

              {/* Right: Info & Description */}
              <div className="w-7/12 sm:w-3/5 p-3.5 sm:p-4 flex flex-col justify-between space-y-2">
                <div className="space-y-1.5">
                  {/* Gold Rank Badge */}
                  <div className="flex items-center gap-2">
                    <span className="bg-brand-gold text-slate-900 text-[11px] font-black px-2 py-0.5 rounded-sm shadow-xs">
                      #{rankNumber}
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider truncate">
                      {store.category || "General"}
                    </span>
                  </div>

                  {/* Store Title */}
                  <Link
                    to={`/stores/${store.id}`}
                    className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-brand-gold-hover hover:underline line-clamp-1 transition-colors"
                  >
                    {store.name}
                  </Link>

                  {/* Meta Line: Year, City/Location */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <span>{year}</span>
                    <span>•</span>
                    <span className="truncate">{store.address.split(",")[1]?.trim() || "Store"}</span>
                  </div>

                  {/* Rating Line: Gold Star + Rate link */}
                  <div className="flex items-center gap-3 text-xs pt-0.5">
                    <div className="flex items-center gap-1 font-bold text-slate-900">
                      <span className="text-brand-gold text-sm font-black">★</span>
                      <span>{store.ratingDisplay === "Unrated" ? "0.0" : store.ratingDisplay}</span>
                      <span className="text-slate-400 text-[11px] font-normal">
                        ({store.totalRatings})
                      </span>
                    </div>

                    <Link
                      to={`/stores/${store.id}`}
                      className="text-brand-gold hover:text-brand-gold-hover hover:underline flex items-center gap-1 text-[11px] font-semibold transition-colors"
                    >
                      <span>☆</span> Rate
                    </Link>
                  </div>

                  {/* Store Description / Synopsis */}
                  <p className="text-[11px] leading-relaxed text-slate-600 line-clamp-3 pt-1">
                    {store.address}. Featuring premium offerings in {store.category}
                    {store.tags ? ` with tags: ${store.tags}.` : "."}
                  </p>
                </div>

                {/* Action Link */}
                <div className="pt-2 border-t border-slate-100">
                  <Link
                    to={`/stores/${store.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>View Store Details</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. BOTTOM ROW: 7 Vertical Poster Cards (#4 through #10) */}
      {rest7.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-1">
          {rest7.map((store, index) => {
            const rankNumber = index + 4;

            return (
              <Link
                key={store.id}
                to={`/stores/${store.id}`}
                className="bg-white rounded-xl border border-surface-border shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group hover:scale-[1.02]"
              >
                {/* Vertical Poster with Blue Rank Badge */}
                <div className="relative w-full aspect-[2/3] bg-slate-100 overflow-hidden">
                  <img
                    src={getImageUrl(store.imageUrl)}
                    alt={store.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Gold Rank Badge in Top-Left */}
                  <div className="absolute top-0 left-0">
                    <span className="bg-brand-gold text-slate-900 text-[11px] font-black px-2 py-0.5 rounded-br-md shadow-xs block">
                      #{rankNumber}
                    </span>
                  </div>

                  {/* Rating Tag in Top-Right */}
                  <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-white/90 backdrop-blur-xs text-slate-900 px-1.5 py-0.5 rounded text-[10px] font-bold shadow-xs border border-slate-200">
                    <span className="text-brand-gold text-xs">★</span>
                    <span>{store.ratingDisplay === "Unrated" ? "0.0" : store.ratingDisplay}</span>
                  </div>
                </div>

                {/* Bottom Title & Category */}
                <div className="p-2.5 space-y-1 bg-white">
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-brand-gold-hover line-clamp-1 transition-colors">
                    {store.name}
                  </h3>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="truncate">{store.category || "General"}</span>
                    <span>({store.totalRatings})</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
