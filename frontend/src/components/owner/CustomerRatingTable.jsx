import React from "react";
import StarRating from "../common/StarRating";
import EmptyState from "../common/EmptyState";

/**
 * Sortable customer reviews table for store owners.
 */
export default function CustomerRatingTable({
  ratingsLog = [],
  sortBy = "date",
  order = "desc",
  onSortChange,
  loading = false,
}) {
  const handleSort = (field) => {
    if (sortBy === field) {
      onSortChange(field, order === "asc" ? "desc" : "asc");
    } else {
      onSortChange(field, field === "customerName" ? "asc" : "desc");
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const renderSortIndicator = (field) => {
    if (sortBy !== field) {
      return <span className="text-slate-300 ml-1 text-[10px]">↕</span>;
    }
    return (
      <span className="text-slate-900 ml-1 text-[10px] font-bold">
        {order === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  if (!loading && ratingsLog.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-surface-border p-8">
        <EmptyState
          title="No customer ratings yet"
          description="This store has not received any ratings from customers yet. Reviews will automatically show up here as customers rate your store."
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-surface-border shadow-xs overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Customer Ratings Log</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed log of all individual customer ratings for this store.
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
          {ratingsLog.length} {ratingsLog.length === 1 ? "Review" : "Reviews"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
          <thead className="bg-slate-50 font-bold text-slate-600 uppercase tracking-wider text-[11px]">
            <tr>
              <th
                scope="col"
                onClick={() => handleSort("customerName")}
                className="py-3.5 px-5 cursor-pointer hover:bg-slate-100 transition-colors select-none"
              >
                <div className="flex items-center">
                  <span>Customer Name</span>
                  {renderSortIndicator("customerName")}
                </div>
              </th>
              <th
                scope="col"
                onClick={() => handleSort("value")}
                className="py-3.5 px-5 cursor-pointer hover:bg-slate-100 transition-colors select-none"
              >
                <div className="flex items-center">
                  <span>Rating</span>
                  {renderSortIndicator("value")}
                </div>
              </th>
              <th
                scope="col"
                onClick={() => handleSort("date")}
                className="py-3.5 px-5 cursor-pointer hover:bg-slate-100 transition-colors select-none"
              >
                <div className="flex items-center">
                  <span>Review Date</span>
                  {renderSortIndicator("date")}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-5">
                    <div className="h-4 bg-slate-200 rounded w-32"></div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="h-4 bg-slate-200 rounded w-24"></div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="h-4 bg-slate-200 rounded w-28"></div>
                  </td>
                </tr>
              ))
            ) : (
              ratingsLog.map((rating, index) => (
                <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-5 font-semibold text-slate-900 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                      {rating.customerName ? rating.customerName.charAt(0).toUpperCase() : "C"}
                    </div>
                    <span>{rating.customerName}</span>
                  </td>
                  <td className="py-4 px-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <StarRating value={rating.value} readOnly={true} size="sm" />
                      <span className="font-bold text-slate-800 text-xs">
                        {rating.value} / 5
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                    {formatDate(rating.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
