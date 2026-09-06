import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import storeApi from "../../api/storeApi";

/**
 * Metadata and style definitions for distinct store categories.
 */
const CATEGORY_META = {
  "Books & Stationery": {
    icon: "📚",
    desc: "Books, novels, academic titles & stationery essentials",
    gradient: "from-amber-50 to-orange-50",
    badgeBg: "bg-amber-100 text-amber-800",
    borderHover: "hover:border-amber-400",
    accentText: "text-amber-700",
  },
  "Cafe": {
    icon: "☕",
    desc: "Artisanal espresso, cold brews, teas & cozy bakery spaces",
    gradient: "from-amber-50 to-stone-50",
    badgeBg: "bg-stone-100 text-stone-800",
    borderHover: "hover:border-amber-400",
    accentText: "text-amber-800",
  },
  "Electronics": {
    icon: "⚡",
    desc: "Smart gadgets, computers, electronics & accessories",
    gradient: "from-amber-50 to-orange-50",
    badgeBg: "bg-amber-100 text-amber-900",
    borderHover: "hover:border-brand-gold",
    accentText: "text-brand-gold-hover",
  },
  "Food & Beverage": {
    icon: "🍽️",
    desc: "Artisan bakeries, gourmet dining & craft beverages",
    gradient: "from-orange-50 to-rose-50",
    badgeBg: "bg-orange-100 text-orange-800",
    borderHover: "hover:border-orange-400",
    accentText: "text-orange-700",
  },
  "Gaming & Esports": {
    icon: "🎮",
    desc: "Arcades, VR gaming arenas & competitive gaming rigs",
    gradient: "from-purple-50 to-violet-50",
    badgeBg: "bg-purple-100 text-purple-800",
    borderHover: "hover:border-purple-400",
    accentText: "text-purple-700",
  },
  "Grocery": {
    icon: "🥗",
    desc: "Farm fresh organic produce, pantry goods & daily staples",
    gradient: "from-emerald-50 to-teal-50",
    badgeBg: "bg-emerald-100 text-emerald-800",
    borderHover: "hover:border-emerald-400",
    accentText: "text-emerald-700",
  },
  "Health & Fitness": {
    icon: "💪",
    desc: "Modern gyms, fitness equipment & wellness studios",
    gradient: "from-rose-50 to-red-50",
    badgeBg: "bg-rose-100 text-rose-800",
    borderHover: "hover:border-rose-400",
    accentText: "text-rose-700",
  },
  "Music & Entertainment": {
    icon: "🎵",
    desc: "Vinyl records, musical instruments & live venue merchandise",
    gradient: "from-fuchsia-50 to-pink-50",
    badgeBg: "bg-fuchsia-100 text-fuchsia-800",
    borderHover: "hover:border-fuchsia-400",
    accentText: "text-fuchsia-700",
  },
  "Sports & Outdoors": {
    icon: "🏔️",
    desc: "Hiking, outdoor gear, camping apparel & athletic equipment",
    gradient: "from-teal-50 to-emerald-50",
    badgeBg: "bg-teal-100 text-teal-800",
    borderHover: "hover:border-teal-400",
    accentText: "text-teal-700",
  },
  "General": {
    icon: "🏬",
    desc: "Multi-department retail, general lifestyle & boutique gifts",
    gradient: "from-slate-50 to-gray-50",
    badgeBg: "bg-slate-100 text-slate-800",
    borderHover: "hover:border-slate-400",
    accentText: "text-slate-700",
  },
};

const DEFAULT_META = {
  icon: "🏪",
  desc: "Discover verified community stores and submit your ratings",
  gradient: "from-slate-50 to-slate-100",
  badgeBg: "bg-slate-100 text-slate-800",
  borderHover: "hover:border-brand-gold",
  accentText: "text-slate-700",
};

/**
 * Categories section with interactive cards.
 * Each card navigates to the dedicated category search page with filtered stores.
 */
export default function CategoryCardsSection({ stores = [] }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchCats = async () => {
      try {
        setLoading(true);
        const res = await storeApi.getCategories();
        if (isMounted && res.success && Array.isArray(res.data)) {
          // Exclude generic "All" if present in raw response
          const filtered = res.data.filter((c) => c && c !== "All");
          setCategories(filtered);
        }
      } catch (err) {
        console.error("Failed to load categories for cards section:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCats();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute store count per category from approved stores list
  const storeCounts = useMemo(() => {
    const counts = {};
    if (Array.isArray(stores)) {
      stores.forEach((s) => {
        if (s.category) {
          counts[s.category] = (counts[s.category] || 0) + 1;
        }
      });
    }
    return counts;
  }, [stores]);

  return (
    <section aria-label="Store Categories Cards" className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold mb-1">
            <span>🏷️</span> Department Directory
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Categories
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Explore curated stores organized by department and category.
          </p>
        </div>
        <Link
          to="/search"
          className="text-xs font-bold text-slate-600 hover:text-brand-gold-hover hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
        >
          View all in Search →
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div
              key={i}
              className="h-36 bg-slate-100 rounded-xl animate-pulse border border-slate-200"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const meta = CATEGORY_META[cat] || DEFAULT_META;
            const count = storeCounts[cat] || 0;
            const targetUrl = `/category/${encodeURIComponent(cat)}`;

            return (
              <Link
                key={cat}
                to={targetUrl}
                className={`group relative flex flex-col justify-between p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 overflow-hidden ${meta.borderHover}`}
              >
                {/* Subtle gradient hover highlight */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${meta.gradient} opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none`}
                />

                <div className="relative z-10">
                  {/* Top row: Icon and count badge */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-lg sm:text-xl ${meta.badgeBg} shadow-2xs group-hover:scale-110 transition-transform`}
                    >
                      {meta.icon}
                    </div>
                    {count > 0 ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-white group-hover:text-slate-900 shadow-2xs transition-colors">
                        {count} {count === 1 ? "store" : "stores"}
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-500">
                        Explore
                      </span>
                    )}
                  </div>

                  {/* Category Title */}
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-slate-950 transition-colors line-clamp-1">
                    {cat}
                  </h3>

                  {/* Category description */}
                  <p className="text-slate-500 text-[11px] sm:text-xs line-clamp-2 mt-1 leading-snug">
                    {meta.desc}
                  </p>
                </div>

                {/* Bottom link prompt */}
                <div className="relative z-10 pt-3 mt-2 border-t border-slate-100/80 flex items-center justify-between text-xs font-bold text-slate-600 group-hover:text-slate-900">
                  <span>View stores</span>
                  <span className="transition-transform group-hover:translate-x-1 text-brand-gold-hover">
                    →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
