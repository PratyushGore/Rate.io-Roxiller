import React from "react";
import EmptyState from "../common/EmptyState";

/**
 * Renders a 5-tier horizontal breakdown of rating counts and percentages.
 *
 * @param {Object} props
 * @param {Object} props.distribution - Star distribution map, e.g. { 5: 10, 4: 2, 3: 1, 2: 0, 1: 0 }
 * @param {number} props.total - Total ratings count
 */
export default function RatingDistributionBar({ distribution = {}, total = 0 }) {
  if (total === 0) {
    return (
      <EmptyState
        title="No ratings yet"
        description="This store has not received any ratings. Be the first customer to leave a review!"
      />
    );
  }

  const tiers = [5, 4, 3, 2, 1];

  return (
    <div className="space-y-2.5 w-full">
      {tiers.map((star) => {
        const count = distribution[star] || 0;
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

        return (
          <div key={star} className="flex items-center gap-3 text-xs font-medium text-slate-600">
            {/* Star label */}
            <div className="flex items-center gap-1 w-10 shrink-0 justify-end">
              <span className="font-bold text-slate-800">{star}</span>
              <span className="text-brand-gold text-xs">★</span>
            </div>

            {/* Progress Bar Track */}
            <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 relative">
              <div
                className="h-full bg-brand-gold rounded-full transition-all duration-500 ease-out"
                style={{ width: `${percentage}%` }}
                role="progressbar"
                aria-valuenow={percentage}
                aria-valuemin="0"
                aria-valuemax="100"
                title={`${count} ratings (${percentage}%)`}
              />
            </div>

            {/* Count & Percentage */}
            <div className="w-14 text-right shrink-0 text-slate-500 font-mono">
              <span>{count}</span>
              <span className="text-[10px] text-slate-400 ml-1">({percentage}%)</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
