import React from "react";
import { createBrowserRouter, RouterProvider, Outlet, Navigate, Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import ProtectedRoute from "../components/common/ProtectedRoute";

import StoreCatalog from "../pages/StoreCatalog";
import SearchPage from "../pages/SearchPage";
import StoreDetail from "../pages/StoreDetail";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Profile from "../pages/Profile";
import OwnerDashboard from "../pages/OwnerDashboard";
import AdminDashboard from "../pages/AdminDashboard";

/**
 * Root layout rendering the persistent Navbar, main content, and footer.
 */
function RootLayout() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between text-slate-900 font-sans">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-surface-border bg-white py-4 text-center text-xs text-slate-400">
        <div className="w-full px-3 sm:px-5 lg:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} StoreRate.io — Community Store Rating Platform</span>
          <div className="flex items-center gap-4 text-slate-500">
            <Link to="/stores" className="hover:text-slate-900">Stores</Link>
            <Link to="/search" className="hover:text-slate-900">Search</Link>
            <Link to="/profile" className="hover:text-slate-900">Profile</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * Main application router definition.
 */
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/stores" replace />,
      },
      {
        path: "stores",
        element: <StoreCatalog />,
      },
      {
        path: "search",
        element: <SearchPage />,
      },
      {
        path: "category/:category",
        element: <SearchPage />,
      },
      {
        path: "stores/:id",
        element: <StoreDetail />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "signup",
        element: <Signup />,
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/dashboard",
        element: (
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "owner/dashboard",
        element: (
          <ProtectedRoute allowedRoles={["STORE_OWNER"]}>
            <OwnerDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "*",
        element: (
          <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-2">404</h1>
            <p className="text-sm text-slate-600 mb-6">The page you are looking for does not exist.</p>
            <Link
              to="/stores"
              className="px-4 py-2 text-sm font-semibold text-slate-900 bg-brand-gold hover:bg-brand-gold-hover rounded-lg shadow-xs"
            >
              Browse Stores
            </Link>
          </div>
        ),
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
