const prisma = require("../config/prisma");

/**
 * Helper to compute rounded average rating.
 */
const formatRatingStats = (avg, count) => {
  if (avg === null || count === 0) {
    return {
      averageRating: 0.0,
      totalRatings: 0,
      ratingDisplay: "Unrated",
    };
  }
  const rounded = Math.round(avg * 10) / 10;
  return {
    averageRating: rounded,
    totalRatings: count,
    ratingDisplay: rounded.toFixed(1),
  };
};

/**
 * Get all stores belonging to the authenticated store owner.
 */
const getOwnerStores = async (ownerId) => {
  const stores = await prisma.store.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
  });

  if (stores.length === 0) {
    return [];
  }

  const storeIds = stores.map((s) => s.id);

  const aggregates = await prisma.rating.groupBy({
    by: ["storeId"],
    where: { storeId: { in: storeIds } },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const aggMap = new Map();
  aggregates.forEach((item) => {
    aggMap.set(item.storeId, {
      avg: item._avg.rating,
      count: item._count.rating,
    });
  });

  return stores.map((store) => {
    const stats = aggMap.get(store.id) || { avg: null, count: 0 };
    const { averageRating, totalRatings, ratingDisplay } = formatRatingStats(stats.avg, stats.count);
    return {
      ...store,
      averageRating,
      totalRatings,
      ratingDisplay,
    };
  });
};

/**
 * Get store analytics and ratings log for a store owned by ownerId.
 * Enforces ownership check (returns 403 if store.ownerId !== ownerId).
 */
const getOwnerStoreAnalytics = async (storeId, ownerId, { sortBy = "date", order = "desc" } = {}) => {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      ratings: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!store) {
    const error = new Error("Store not found");
    error.statusCode = 404;
    throw error;
  }

  // Strict ownership check
  if (store.ownerId !== ownerId) {
    const error = new Error("You do not have permission to view analytics for this store");
    error.statusCode = 403;
    throw error;
  }

  // Aggregate ratings
  const agg = await prisma.rating.aggregate({
    where: { storeId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const { averageRating, totalRatings, ratingDisplay } = formatRatingStats(
    agg._avg.rating,
    agg._count.rating
  );

  // Map ratings log: [{ customerName, value, createdAt }]
  let ratingsLog = store.ratings.map((r) => ({
    customerName: r.user ? r.user.name : "Anonymous",
    value: r.rating,
    createdAt: r.createdAt,
  }));

  // Sort ratingsLog by customerName | value | date
  const isAsc = order.toLowerCase() === "asc";
  ratingsLog.sort((a, b) => {
    if (sortBy === "customerName") {
      const cmp = a.customerName.localeCompare(b.customerName);
      return isAsc ? cmp : -cmp;
    }
    if (sortBy === "value" || sortBy === "rating") {
      return isAsc ? a.value - b.value : b.value - a.value;
    }
    // Default: date / createdAt
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return isAsc ? dateA - dateB : dateB - dateA;
  });

  const { ratings, ...storeData } = store;

  return {
    ...storeData,
    averageRating,
    totalRatings,
    ratingDisplay,
    ratingsLog,
  };
};

module.exports = {
  getOwnerStores,
  getOwnerStoreAnalytics,
};
