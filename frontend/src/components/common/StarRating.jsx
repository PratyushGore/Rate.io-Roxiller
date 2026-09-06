import React, { useState } from "react";

/**
 * Reusable 5-star rating component.
 * Supports both read-only display mode and interactive selection mode.
 *
 * @param {Object} props
 * @param {number} props.value - Numeric rating (0 to 5)
 * @param {boolean} [props.readOnly=false] - Whether rating is display-only or interactive
 * @param {Function} [props.onChange] - Callback fired when a star is clicked: (rating) => void
 * @param {string} [props.size="md"] - Size of stars: "sm", "md", "lg"
 * @param {boolean} [props.showScore=false] - Whether to show numeric score next to stars
 */
export default function StarRating({
  value = 0,
  readOnly = false,
  onChange,
  size = "md",
  showScore = false,
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };

  const starSize = sizeClasses[size] || sizeClasses.md;
  const activeRating = hoverRating > 0 ? hoverRating : Math.round(value);

  const handleStarClick = (starIndex) => {
    if (!readOnly && onChange) {
      onChange(starIndex);
    }
  };

  return (
    <div className="inline-flex items-center gap-1.5" role={readOnly ? "img" : "radiogroup"} aria-label={`Rating: ${value} out of 5 stars`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = activeRating >= starIndex;

          return (
            <button
              key={starIndex}
              type="button"
              disabled={readOnly}
              tabIndex={readOnly ? -1 : 0}
              onClick={() => handleStarClick(starIndex)}
              onMouseEnter={() => !readOnly && setHoverRating(starIndex)}
              onMouseLeave={() => !readOnly && setHoverRating(0)}
              className={`${
                readOnly
                  ? "cursor-default pointer-events-none"
                  : "cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold rounded"
              } p-0.5 text-slate-300 transition-colors`}
              aria-label={readOnly ? undefined : `Rate ${starIndex} out of 5 stars`}
              title={readOnly ? `${value} / 5` : `Rate ${starIndex} stars`}
            >
              <svg
                className={`${starSize} ${
                  isFilled ? "text-brand-gold fill-brand-gold" : "text-slate-200 fill-slate-100"
                } transition-colors duration-150`}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                />
              </svg>
            </button>
          );
        })}
      </div>

      {showScore && (
        <span className="text-xs font-bold text-slate-700 ml-1">
          {value > 0 ? (Math.round(value * 10) / 10).toFixed(1) : "Unrated"}
        </span>
      )}
    </div>
  );
}
