import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import storeApi from "../api/storeApi";
import ratingApi from "../api/ratingApi";
import StarRating from "../components/common/StarRating";
import RatingDistributionBar from "../components/stores/RatingDistributionBar";
import { useAuth } from "../context/AuthContext";
import { getImageUrl } from "../utils/imageUrl";

/**
 * Individual store detail view.
 * Layout:
 * - Left column: Store image and community rating below it.
 * - Right column: Store details, Your Rating section, and Rating Breakdown.
 */
export default function StoreDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();

  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [isRatingSubmitting, setIsRatingSubmitting] = useState(false);
  const [ratingMessage, setRatingMessage] = useState("");

  const loadStore = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await storeApi.getStoreById(id);
      if (res.success && res.data) {
        setStore(res.data);
        setUserRating(res.data.userRating || 0);
      }
    } catch (err) {
      setError(err.message || "Failed to load store details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStore();
  }, [id]);

  const handleRatingSubmit = async (newRating) => {
    if (!isAuthenticated || user?.role !== "USER" || isRatingSubmitting) {
      return;
    }

    try {
      setIsRatingSubmitting(true);
      setRatingMessage("");

      const res = await ratingApi.upsertRating({
        storeId: parseInt(id, 10),
        rating: newRating,
      });

      if (res.success && res.data) {
        setUserRating(newRating);
        setRatingMessage("Your rating was submitted successfully!");

        // Refresh store details to reflect new distribution and average
        await loadStore();

        setTimeout(() => {
          setRatingMessage("");
        }, 3500);
      }
    } catch (err) {
      setRatingMessage(err.message || "Failed to submit rating");
      setTimeout(() => {
        setRatingMessage("");
      }, 3500);
    } finally {
      setIsRatingSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[calc(100vh-4rem)] bg-white px-3 sm:px-5 lg:px-6 py-4">
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-slate-200 rounded w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-5 space-y-6">
              <div className="aspect-[4/3] bg-slate-200 rounded-2xl" />
              <div className="h-32 bg-slate-100 rounded-xl" />
            </div>
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-4">
                <div className="h-8 bg-slate-200 rounded-lg w-3/4" />
                <div className="h-20 bg-slate-100 rounded-lg" />
              </div>
              <div className="h-24 bg-slate-100 rounded-lg" />
              <div className="h-32 bg-slate-100 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Store Not Found</h2>
        <p className="text-sm text-slate-600 mb-6">
          {error || "The requested store does not exist or has not been approved."}
        </p>
        <Link
          to="/stores"
          className="inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-900 bg-brand-gold hover:bg-brand-gold-hover rounded-lg shadow-xs"
        >
          Back to Stores
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-white px-3 sm:px-5 lg:px-6 py-4 space-y-5">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/stores" className="hover:text-slate-900 transition-colors">
          Stores
        </Link>
        <span>/</span>
        {store.category && (
          <>
            <Link
              to={`/search?category=${encodeURIComponent(store.category)}`}
              className="hover:text-slate-900 transition-colors"
            >
              {store.category}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-slate-800 truncate max-w-xs">{store.name}</span>
      </nav>

      {/* Two-Column Grid: Left (Image + Rating) & Right (Details + User Rating + Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* LEFT COLUMN: Store Image & Community Rating below it */}
        <div className="lg:col-span-5 space-y-6">
          {/* Store Image */}
          <div className="relative aspect-[4/3] w-full bg-slate-100 rounded-2xl overflow-hidden shadow-xs group">
            <img
              src={getImageUrl(store.imageUrl)}
              alt={store.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />

            {/* Category Badge on Image */}
            {store.category && (
              <div className="absolute top-3 left-3">
                <span className="bg-white/90 backdrop-blur-xs text-slate-900 text-xs font-bold px-3 py-1 rounded-full border border-slate-200 shadow-xs uppercase tracking-wider">
                  {store.category}
                </span>
              </div>
            )}

            {/* ID Badge on Image */}
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-slate-800 text-[11px] font-mono px-2 py-0.5 rounded-md border border-slate-200 shadow-xs">
              #{store.id}
            </div>
          </div>

          {/* Rating Summary Below Image (No box) */}
          <div className="text-center flex flex-col items-center justify-center space-y-2 py-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Overall Community Rating
            </span>

            {/* Large Score Display */}
            <div className="text-5xl font-black text-slate-900 flex items-center justify-center gap-1 my-1">
              <span className="text-brand-gold text-4xl font-bold">★</span>
              <span>{store.ratingDisplay === "Unrated" ? "0.0" : store.ratingDisplay}</span>
              <span className="text-slate-400 text-xs font-semibold self-end mb-1.5">/ 5.0</span>
            </div>

            {/* Read-Only Gold Stars */}
            <div className="py-0.5">
              <StarRating
                value={store.averageRating || 0}
                readOnly={true}
                size="md"
              />
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Based on {store.totalRatings} {store.totalRatings === 1 ? "customer review" : "customer reviews"}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Store Detail, Your Rating, and Rating Breakdown (No boxes) */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Store Detail Information */}
          <div className="space-y-5">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {store.name}
              </h1>

              {/* Tags if present */}
              {store.tags && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {store.tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md border border-slate-200"
                      >
                        #{tag}
                      </span>
                    ))}
                </div>
              )}
            </div>

            {/* Store Information Grid */}
            <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <span className="block font-bold text-slate-700">Address</span>
                  <span className="text-slate-600">{store.address}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <span className="block font-bold text-slate-700">Inquiries</span>
                  <span className="text-slate-600 font-mono text-[11px]">{store.email}</span>
                </div>
              </div>

              {store.owner && (
                <div className="flex items-start gap-2.5">
                  <span className="text-sm shrink-0">🏪</span>
                  <div>
                    <span className="block font-bold text-slate-700">Store Owner</span>
                    <span className="text-slate-600">{store.owner.name}</span>
                  </div>
                </div>
              )}

              {store.createdAt && (
                <div className="flex items-start gap-2.5">
                  <span className="text-sm shrink-0">📅</span>
                  <div>
                    <span className="block font-bold text-slate-700">Listed Since</span>
                    <span className="text-slate-600">
                      {new Date(store.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. Your Rating Section (No box) */}
          <div className="pt-6 border-t border-slate-200 space-y-3">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Your Rating
            </h2>

            {isAuthenticated && user?.role === "USER" ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">
                  {userRating > 0
                    ? "Click a star to modify your rating for this store:"
                    : "Have you visited this store? Click a star to rate it:"}
                </p>

                <div className="pt-1 flex items-center gap-3">
                  <StarRating
                    value={userRating}
                    readOnly={false}
                    onChange={handleRatingSubmit}
                    size="lg"
                  />
                  {userRating > 0 && (
                    <span className="text-xs font-bold text-slate-700 bg-brand-gold-light border border-brand-gold/40 px-2.5 py-1 rounded-md">
                      {userRating} / 5 Stars
                    </span>
                  )}
                </div>

                {ratingMessage && (
                  <p className="text-xs font-semibold text-emerald-600 mt-2 animate-fade-in">
                    {ratingMessage}
                  </p>
                )}
              </div>
            ) : isAuthenticated ? (
              <p className="text-xs text-slate-500 italic">
                You are currently signed in as a {user?.role === "STORE_OWNER" ? "Store Owner" : "System Administrator"}. Customer accounts can submit reviews and ratings.
              </p>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <p className="text-xs text-slate-600">
                  Have you visited this store? Sign in to share your customer rating.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-slate-900 bg-brand-gold hover:bg-brand-gold-hover rounded-lg shadow-xs transition-colors shrink-0"
                >
                  Log in to rate
                </Link>
              </div>
            )}
          </div>

          {/* 3. Rating Breakdown Section (No box) */}
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Rating Breakdown
              </h2>
              <span className="text-xs text-slate-500">
                {store.totalRatings} total reviews
              </span>
            </div>

            <RatingDistributionBar
              distribution={store.ratingDistribution || {}}
              total={store.totalRatings || 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
