import React from "react";

/**
 * Placeholder HomePage for Phase 1 scaffolding.
 * Phases 3 and 4 will implement complete Store discovery and rating views.
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      {/* Navigation Header */}
      <header className="border-b border-surface-border bg-surface-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="bg-brand-gold text-slate-900 font-bold px-2.5 py-1 rounded text-sm tracking-wide shadow-sm">
              STORE
            </span>
            <span className="font-bold text-lg text-slate-900 tracking-tight">
              Rate<span className="text-brand-gold">.io</span>
            </span>
          </div>
          <div className="flex items-center space-x-3 text-sm font-medium">
            <span className="text-slate-500">Phase 1 Scaffolding Ready</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold-light border border-brand-gold/30 text-slate-800 text-xs font-semibold mb-6">
          <span className="text-brand-gold text-base">★</span> Store Rating & Discovery Platform
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-4">
          Discover & Rate Local Stores
        </h1>
        <p className="text-base text-slate-600 max-w-2xl mx-auto mb-8">
          The foundation is set with Express, Prisma, MySQL, React, and Tailwind CSS.
          Authentication, Store Listings, and Admin/Owner dashboards will arrive in subsequent phases.
        </p>

        {/* Demo Theme Card */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-6 shadow-sm max-w-md mx-auto text-left">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Craft & Roast Coffeehouse</h3>
              <p className="text-xs text-slate-500 mt-0.5">12 Roast Street, Seattle, WA</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-900 text-white px-2.5 py-1 rounded text-sm font-bold">
              <span className="text-brand-gold">★</span>
              <span>4.5</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>4 Customer Ratings</span>
            <span className="text-emerald-600 font-medium">Approved</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-border py-6 text-center text-xs text-slate-400">
        © 2026 StoreRate Platform. All rights reserved.
      </footer>
    </div>
  );
}
