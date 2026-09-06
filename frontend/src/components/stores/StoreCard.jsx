import React, { useState } from "react";
import { Link } from "react-router-dom";
import StarRating from "../common/StarRating";
import ratingApi from "../../api/ratingApi";
import { useAuth } from "../../context/AuthContext";
import { getImageUrl } from "../../utils/imageUrl";

/**
 * Card component representing a store in catalog and search grids.
 * Displays uploaded storefront image, category capsule, ratings, and provides inline rating widget.
 */
export default function StoreCard({ store, onStoreUpdated }) {
  const { user, isAuthenticated } = useAuth();
  const [userRating, setUserRating] = useState(store.userRating || 0);
  const [avgRating, setAvgRating] = useState(store.averageRating || 0);
  const [totalRatings, setTotalRatings] = useState(store.totalRatings || 0);
  const [ratingDisplay, setRatingDisplay] = useState(store.ratingDisplay || "Unrated");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratingNotice, setRatingNotice] = useState("");

  const handleRatingChange = async (newRating) => {
    if (!isAuthenticated || user?.role !== "USER" || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setRatingNotice("");

      const res = await ratingApi.upsertRating({
        storeId: store.id,
        rating: newRating,
      });

      if (res.success && res.data) {
        setUserRating(newRating);
        setAvgRating(res.data.averageRating);
        setTotalRatings(res.data.totalRatings);
        setRatingDisplay(res.data.ratingDisplay);
        setRatingNotice("Rating saved!");

        if (onStoreUpdated) {
          onStoreUpdated(store.id, {
            averageRating: res.data.averageRating,
            totalRatings: res.data.totalRatings,
            ratingDisplay: res.data.ratingDisplay,
            userRating: newRating,
          });
        }

        setTimeout(() => {
          setRatingNotice("");
        }, 3000);
      }
    } catch (err) {
      setRatingNotice(err.message || "Failed to submit rating");
      setTimeout(() => {
        setRatingNotice("");
      }, 3500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-surface-border shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Store Image Thumbnail */}
      <Link to={`/stores/${store.id}`} className="relative block overflow-hidden bg-slate-100 aspect-video">
        <img
          src={getImageUrl(store.imageUrl)}
          alt={store.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Floating Category Capsule */}
        {store.category && (
          <div className="absolute top-2.5 left-2.5">
            <span className="bg-white/90 backdrop-blur-xs text-slate-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-slate-200 shadow-xs uppercase tracking-wider">
              {store.category}
            </span>
          </div>
        )}

        {/* IMDb-Inspired Gold Rating Badge Overlay */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-white/90 backdrop-blur-xs text-slate-900 px-2 py-0.5 rounded-md shadow-xs border border-slate-200">
          <span className="text-brand-gold text-xs font-bold">★</span>
          <span className="text-xs font-bold tracking-tight">
            {ratingDisplay === "Unrated" ? "Unrated" : ratingDisplay}
          </span>
        </div>
      </Link>

      {/* Middle Details Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <Link
            to={`/stores/${store.id}`}
            className="text-base font-bold text-slate-900 group-hover:text-brand-gold-hover hover:underline line-clamp-1"
          >
            {store.name}
          </Link>

          {/* Address */}
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{store.address}</span>
          </div>

          {/* Tags Chips if present */}
          {store.tags && (
            <div className="flex flex-wrap gap-1 mt-2.5">
              {store.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
                .slice(0, 3)
                .map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200"
                  >
                    #{tag}
                  </span>
                ))}
            </div>
          )}
        </div>

        {/* Contact Email & Review Count */}
        <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">
          <span className="truncate max-w-[150px] font-mono text-[11px]">{store.email}</span>
          <span className="font-semibold text-slate-600">
            {totalRatings} {totalRatings === 1 ? "Rating" : "Ratings"}
          </span>
        </div>
      </div>

      {/* Bottom Interactive Rating Section */}
      <div className="px-4 py-3 bg-white border-t border-surface-border flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {isAuthenticated && user?.role === "USER"
              ? userRating > 0
                ? "Your Rating"
                : "Rate store"
              : "Rating"}
          </span>

          <div className="mt-0.5 flex items-center gap-1.5">
            {isAuthenticated && user?.role === "USER" ? (
              <StarRating
                value={userRating}
                readOnly={false}
                onChange={handleRatingChange}
                size="md"
              />
            ) : isAuthenticated ? (
              <span className="text-xs text-slate-400 italic">
                {user?.role === "STORE_OWNER" ? "Owners cannot rate" : "Admin view"}
              </span>
            ) : (
              <Link
                to="/login"
                className="text-xs font-semibold text-brand-gold hover:text-brand-gold-hover transition-colors inline-flex items-center gap-1"
              >
                <span>Log in to rate</span>
                <span aria-hidden="true">→</span>
              </Link>
            )}

            {ratingNotice && (
              <span className="text-[11px] font-semibold text-emerald-600 animate-fade-in">
                {ratingNotice}
              </span>
            )}
          </div>
        </div>

        <Link
          to={`/stores/${store.id}`}
          className="text-xs font-bold text-slate-700 hover:text-slate-900 px-2.5 py-1.5 rounded hover:bg-slate-200 transition-colors"
        >
          Details
        </Link>
      </div>
    </div>
  );
}
