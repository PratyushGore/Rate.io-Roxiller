import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import storeApi from "../../api/storeApi";
import { getImageUrl } from "../../utils/imageUrl";

/**
 * Full-width edge-to-edge hero carousel highlighting top-rated approved stores.
 * Features:
 * - True horizontal slide animation with cubic-bezier easing.
 * - Auto-advance every ~5s with pause-on-hover.
 * - Touch swipe support for mobile users.
 * - Animated interactive scroll-down indicator smoothly guiding users to categories.
 * - Subtle scroll-reactive parallax depth effect.
 */
export default function HeroSlider() {
  const [stores, setStores] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const sliderRef = useRef(null);
  const timerRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Fetch top 5 approved stores
  useEffect(() => {
    let isMounted = true;
    const fetchTopRated = async () => {
      try {
        setLoading(true);
        const res = await storeApi.getTopRated();
        if (isMounted && res.success && Array.isArray(res.data)) {
          setStores(res.data.slice(0, 5));
        }
      } catch (err) {
        console.error("Failed to load top-rated stores for hero:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTopRated();
    return () => {
      isMounted = false;
    };
  }, []);

  // Track scroll position for subtle parallax effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-advance every 5s unless hovered or fewer than 2 stores
  useEffect(() => {
    if (stores.length <= 1 || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stores.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stores.length, isHovered]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + stores.length) % stores.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % stores.length);
  };

  // Touch swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  if (loading) {
    return (
      <div className="w-full aspect-[21/9] min-h-[360px] sm:min-h-[440px] bg-slate-900 animate-pulse" />
    );
  }

  if (stores.length === 0) {
    return null;
  }

  // Parallax transform calculation clamped for smooth depth
  const parallaxOffset = Math.min(scrollY * 0.25, 90);
  const parallaxOpacity = Math.max(0.3, 1 - scrollY / 600);

  return (
    <div
      ref={sliderRef}
      className="relative w-full overflow-hidden bg-slate-950 group shadow-md select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Horizontal Sliding Track Container */}
      <div className="relative w-full aspect-[21/9] min-h-[360px] sm:min-h-[440px] max-h-[520px] overflow-hidden">
        <div
          className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {stores.map((store, idx) => {
            const isActive = idx === currentIndex;

            return (
              <div
                key={store.id}
                className="relative w-full h-full flex-shrink-0 overflow-hidden"
              >
                {/* Background Image with Cinematic Zoom and Parallax */}
                <div
                  className="absolute inset-0 w-full h-full transition-transform duration-1000 ease-out"
                  style={{
                    transform: `translateY(${parallaxOffset}px)`,
                    opacity: parallaxOpacity,
                  }}
                >
                  <img
                    src={getImageUrl(store.imageUrl)}
                    alt={store.name}
                    className={`w-full h-full object-cover object-center transform transition-transform duration-1000 ease-out opacity-55 ${
                      isActive ? "scale-100" : "scale-105"
                    } group-hover:scale-105`}
                  />
                </div>

                {/* Cinematic Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/45 to-transparent pointer-events-none" />

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end">
                  <div className="w-full px-3 sm:px-5 lg:px-6 pb-12 sm:pb-14">
                    <div
                      className={`max-w-2xl space-y-3 sm:space-y-4 transition-all duration-700 ease-out transform ${
                        isActive
                          ? "translate-y-0 opacity-100 scale-100"
                          : "translate-y-6 opacity-0 scale-95 pointer-events-none"
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-brand-gold text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                          #{idx + 1} Top Rated
                        </span>

                        {store.category && (
                          <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20">
                            {store.category}
                          </span>
                        )}

                        {/* Rating Badge */}
                        <div className="inline-flex items-center gap-1.5 bg-slate-900/90 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/15 backdrop-blur-xs">
                          <span className="text-brand-gold text-sm">★</span>
                          <span>{store.ratingDisplay || "Unrated"}</span>
                          <span className="text-slate-400 font-normal">
                            ({store.totalRatings || 0} reviews)
                          </span>
                        </div>
                      </div>

                      {/* Store Name & Address */}
                      <div>
                        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight line-clamp-1 drop-shadow-sm">
                          {store.name}
                        </h2>
                        <p className="mt-1.5 text-xs sm:text-sm text-slate-300 flex items-center gap-1.5 line-clamp-1">
                          <svg
                            className="w-4 h-4 text-brand-gold shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span>{store.address}</span>
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-1 flex items-center gap-3">
                        <Link
                          to={`/stores/${store.id}`}
                          className="inline-flex items-center gap-2 px-6 py-2.5 sm:py-3 bg-brand-gold hover:bg-brand-gold-hover text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                          <span>Rate Now</span>
                          <span aria-hidden="true">→</span>
                        </Link>
                        <Link
                          to={`/stores/${store.id}`}
                          className="inline-flex items-center gap-1 px-5 py-2.5 sm:py-3 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm rounded-xl backdrop-blur-md transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Prev / Next Navigation Arrows */}
        {stores.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 sm:left-6 lg:left-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-80 hover:opacity-100 shadow-md z-20 cursor-pointer"
              aria-label="Previous slide"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 sm:right-6 lg:right-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-80 hover:opacity-100 shadow-md z-20 cursor-pointer"
              aria-label="Next slide"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Dot Indicators */}
        {stores.length > 1 && (
          <div className="absolute bottom-5 sm:bottom-6 right-5 sm:right-8 lg:right-12 flex items-center gap-1.5 z-20">
            {stores.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex
                    ? "w-7 bg-brand-gold shadow-xs"
                    : "w-2 bg-white/40 hover:bg-white/75"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
