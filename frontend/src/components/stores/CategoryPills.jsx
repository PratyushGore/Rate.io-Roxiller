import React, { useState, useEffect } from "react";
import storeApi from "../../api/storeApi";

/**
 * Horizontally scrollable category pill filter chips.
 * Supports "All Categories" plus dynamically fetched categories.
 */
export default function CategoryPills({
  selectedCategory = "All",
  onSelectCategory,
  className = "",
}) {
  const [categories, setCategories] = useState(["All"]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchCats = async () => {
      try {
        setLoading(true);
        const res = await storeApi.getCategories();
        if (isMounted && res.success && Array.isArray(res.data)) {
          const list = ["All", ...res.data.filter((c) => c !== "All")];
          setCategories(list);
        }
      } catch (err) {
        console.error("Failed to load store categories:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCats();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className={`flex items-center gap-2 overflow-x-auto py-2 ${className}`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 w-20 bg-slate-200 rounded-full animate-pulse shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 overflow-x-auto py-1 scrollbar-none ${className}`}>
      {categories.map((cat) => {
        const isSelected =
          selectedCategory === cat ||
          (cat === "All" && (!selectedCategory || selectedCategory === "All Categories"));

        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory && onSelectCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 shadow-2xs ${
              isSelected
                ? "bg-brand-gold text-slate-950 shadow-xs"
                : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {cat === "All" ? "All Categories" : cat}
          </button>
        );
      })}
    </div>
  );
}
