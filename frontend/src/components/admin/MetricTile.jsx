import React from "react";

/**
 * Reusable metric tile component for dashboard overview statistics.
 */
export default function MetricTile({
  label,
  value,
  subtitle,
  icon,
  badgeText,
  badgeType = "neutral",
}) {
  const badgeStyles = {
    neutral: "bg-slate-100 text-slate-700",
    warning: "bg-amber-100 text-amber-800",
    success: "bg-emerald-100 text-emerald-800",
    purple: "bg-purple-100 text-purple-800",
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-surface-border shadow-xs flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {label}
          </span>
          <div className="mt-2 text-3xl font-black text-slate-900 tracking-tight">
            {value !== undefined ? value : 0}
          </div>
        </div>

        {icon && (
          <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium truncate">{subtitle}</span>
        {badgeText && (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              badgeStyles[badgeType] || badgeStyles.neutral
            }`}
          >
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}
