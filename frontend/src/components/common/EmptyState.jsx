import React from "react";

/**
 * Reusable empty state component with icon, description, and optional action.
 */
export default function EmptyState({
  title = "No items found",
  description = "There are no records matching your criteria.",
  icon,
  actionText,
  onAction,
}) {
  return (
    <div className="py-12 px-4 text-center max-w-sm mx-auto">
      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
        {icon || (
          <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        )}
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-5">{description}</p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-900 bg-brand-gold hover:bg-brand-gold-hover rounded-lg shadow-sm transition-colors duration-150"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
