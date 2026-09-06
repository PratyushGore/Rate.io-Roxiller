import React, { useState, useEffect } from "react";
import adminApi from "../../api/adminApi";
import ConfirmDialog from "../common/ConfirmDialog";
import AddUserModal from "./AddUserModal";
import EmptyState from "../common/EmptyState";
import SortDropdown from "./SortDropdown";
import { useAuth } from "../../context/AuthContext";
import { getImageUrl } from "../../utils/imageUrl";

const USER_SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "name_asc", label: "Name (A–Z)" },
  { value: "name_desc", label: "Name (Z–A)" },
];

/**
 * Filterable and sortable user management table with promote and delete safety.
 */
export default function UserTable({ onDataChanged }) {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [sortOption, setSortOption] = useState("newest");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Confirmation dialog states
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    isDestructive: false,
    onConfirm: null,
  });

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUsers({
        search: debouncedSearch,
        role: roleFilter,
        sort: sortOption,
      });
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch, roleFilter, sortOption]);

  const handleRoleChangePrompt = (targetUser, newRole) => {
    setConfirmState({
      isOpen: true,
      title: "Update User Role",
      message: `Are you sure you want to change ${targetUser.name}'s role to ${newRole}?`,
      confirmText: "Update Role",
      isDestructive: false,
      onConfirm: async () => {
        try {
          const res = await adminApi.updateUserRole(targetUser.id, newRole);
          if (res.success) {
            setUsers((prev) =>
              prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
            );
            if (onDataChanged) onDataChanged();
          }
        } catch (err) {
          alert(err.message || "Failed to update user role");
        } finally {
          setConfirmState((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleDeleteUserPrompt = (targetUser) => {
    if (targetUser.id === currentAdmin?.id) {
      alert("You cannot delete your own admin account.");
      return;
    }

    setConfirmState({
      isOpen: true,
      title: "Delete User Account",
      message: `Are you sure you want to permanently delete user "${targetUser.name}" (${targetUser.email})? This action cannot be undone.`,
      confirmText: "Delete User",
      isDestructive: true,
      onConfirm: async () => {
        try {
          const res = await adminApi.deleteUser(targetUser.id);
          if (res.success) {
            setUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
            if (onDataChanged) onDataChanged();
          }
        } catch (err) {
          alert(err.message || "Failed to delete user");
        } finally {
          setConfirmState((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleUserAdded = (newUser) => {
    setUsers((prev) => [newUser, ...prev]);
    if (onDataChanged) onDataChanged();
  };

  const roleStyles = {
    ADMIN: "bg-purple-100 text-purple-800 border-purple-200",
    STORE_OWNER: "bg-blue-100 text-blue-800 border-blue-200",
    USER: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-surface-border shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-xs">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or address..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Role Filter Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="userRoleFilter" className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              Role:
            </label>
            <select
              id="userRoleFilter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="py-2 pl-3 pr-8 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="USER">Customer (USER)</option>
              <option value="STORE_OWNER">Store Owner (STORE_OWNER)</option>
              <option value="ADMIN">Administrator (ADMIN)</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <SortDropdown
            id="userSortFilter"
            value={sortOption}
            onChange={setSortOption}
            options={USER_SORT_OPTIONS}
            label="Sort:"
          />
        </div>

        {/* Add User Action */}
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-900 bg-brand-gold hover:bg-brand-gold-hover rounded-lg shadow-xs transition-colors shrink-0"
        >
          <span>+</span>
          <span>Add User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-surface-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
            <thead className="bg-slate-50 font-bold text-slate-600 uppercase tracking-wider text-[11px]">
              <tr>
                <th scope="col" className="py-3.5 px-5">User</th>
                <th scope="col" className="py-3.5 px-5">Role</th>
                <th scope="col" className="py-3.5 px-5">Address</th>
                <th scope="col" className="py-3.5 px-5">Activity</th>
                <th scope="col" className="py-3.5 px-5">Registered</th>
                <th scope="col" className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                [1, 2, 3, 4].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-5">
                      <div className="h-4 bg-slate-200 rounded w-32 mb-1"></div>
                      <div className="h-3 bg-slate-100 rounded w-24"></div>
                    </td>
                    <td className="py-4 px-5"><div className="h-5 bg-slate-200 rounded-full w-16"></div></td>
                    <td className="py-4 px-5"><div className="h-4 bg-slate-100 rounded w-28"></div></td>
                    <td className="py-4 px-5"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                    <td className="py-4 px-5"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                    <td className="py-4 px-5 text-right"><div className="h-6 bg-slate-200 rounded w-14 ml-auto"></div></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12">
                    <EmptyState
                      title="No users match your criteria"
                      description="Try searching with a different term or role filter."
                    />
                  </td>
                </tr>
              ) : (
                users.map((targetUser) => {
                  const isSelf = targetUser.id === currentAdmin?.id;

                  return (
                    <tr key={targetUser.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-slate-200">
                            {targetUser.profilePhoto ? (
                              <img
                                src={getImageUrl(targetUser.profilePhoto)}
                                alt={targetUser.name || "User"}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <span>{targetUser.name ? targetUser.name.charAt(0).toUpperCase() : "U"}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{targetUser.name}</span>
                              {isSelf && (
                                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-normal">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">{targetUser.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              roleStyles[targetUser.role] || "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {targetUser.role}
                          </span>

                          {/* Quick Role Change Selector */}
                          <select
                            value={targetUser.role}
                            disabled={isSelf}
                            onChange={(e) => handleRoleChangePrompt(targetUser, e.target.value)}
                            className="text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 cursor-pointer hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
                            title={isSelf ? "Cannot change your own admin role" : "Change user role"}
                          >
                            <option value="USER">USER</option>
                            <option value="STORE_OWNER">OWNER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </div>
                      </td>

                      <td className="py-4 px-5 max-w-xs truncate text-slate-600">
                        {targetUser.address || <span className="text-slate-300 italic">None</span>}
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap text-slate-600">
                        {targetUser.role === "STORE_OWNER" && (
                          <span>{targetUser._count?.stores || 0} stores</span>
                        )}
                        {targetUser.role === "USER" && (
                          <span>{targetUser._count?.ratings || 0} reviews</span>
                        )}
                        {targetUser.role === "ADMIN" && (
                          <span className="text-slate-400 italic">System</span>
                        )}
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {targetUser.createdAt ? new Date(targetUser.createdAt).toLocaleDateString() : "-"}
                      </td>

                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          disabled={isSelf}
                          onClick={() => handleDeleteUserPrompt(targetUser)}
                          className="text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 px-2.5 py-1 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                          title={isSelf ? "You cannot delete your own account" : "Delete user"}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reusable Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        isDestructive={confirmState.isDestructive}
        onConfirm={confirmState.onConfirm}
        onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onUserAdded={handleUserAdded}
      />
    </div>
  );
}
