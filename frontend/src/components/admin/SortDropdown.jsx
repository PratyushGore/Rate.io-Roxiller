import React from "react";

/**
 * Reusable sort dropdown component for admin tables.
 * Emits the selected sort key on change.
 */
export default function SortDropdown({
  value = "newest",
  onChange,
  options = [],
  label = "Sort by:",
  id = "adminSortDropdown",
}) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-500 whitespace-nowrap">
          {label}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="py-2 pl-3 pr-8 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-brand-gold cursor-pointer shadow-2xs"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
