import React from "react";

/**
 * Dropdown and switcher component allowing store owners to toggle between multiple stores.
 */
export default function OwnerStoreSelector({
  stores = [],
  selectedStoreId,
  onSelectStore,
  onOpenAddModal,
}) {
  const statusStyles = {
    APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
    PENDING: "bg-amber-100 text-amber-800 border-amber-200",
    REJECTED: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-surface-border shadow-xs">
      <div className="flex items-center gap-3">
        <label htmlFor="storeSelect" className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
          Active Store:
        </label>

        {stores.length > 0 ? (
          <div className="relative flex-1 sm:w-72">
            <select
              id="storeSelect"
              value={selectedStoreId || ""}
              onChange={(e) => onSelectStore(parseInt(e.target.value, 10))}
              className="w-full pl-3.5 pr-8 py-2 text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold shadow-xs cursor-pointer"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">No stores registered yet</span>
        )}

        {/* Selected Store Status Badge */}
        {selectedStoreId && (
          <span
            className={`hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
              statusStyles[stores.find((s) => s.id === selectedStoreId)?.status] ||
              "bg-slate-100 text-slate-700"
            }`}
          >
            {stores.find((s) => s.id === selectedStoreId)?.status}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onOpenAddModal}
        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-900 bg-brand-gold hover:bg-brand-gold-hover rounded-lg shadow-xs transition-colors shrink-0"
      >
        <span className="text-sm font-black">+</span>
        <span>Register New Store</span>
      </button>
    </div>
  );
}
