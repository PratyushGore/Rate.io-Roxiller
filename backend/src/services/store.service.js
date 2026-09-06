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
 * Get catalog of approved stores with search, sort, and user rating.
 */
const getStores = async ({ search, sortBy = "name", order = "asc", currentUserId = null }) => {
  const whereClause = {
    status: "APPROVED",
  };

  if (search && search.trim().length > 0) {
    const term = search.trim();
    whereClause.OR = [
      { name: { contains: term } },
      { address: { contains: term } },
      { category: { contains: term } },
      { tags: { contains: term } },
    ];
  }

  // Fetch stores matching status and search filter
  const stores = await prisma.store.findMany({
    where: whereClause,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      ratings: currentUserId
        ? {
            where: { userId: currentUserId },
            select: { rating: true },
          }
        : false,
    },
    orderBy: sortBy !== "rating" ? { [sortBy]: order.toLowerCase() === "desc" ? "desc" : "asc" } : undefined,
  });

  if (stores.length === 0) {
    return [];
  }

  const storeIds = stores.map((s) => s.id);

  // Group aggregate ratings for all retrieved stores
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

  // Map stores with rating stats and caller's userRating
  const storeList = stores.map((store) => {
    const stats = aggMap.get(store.id) || { avg: null, count: 0 };
    const { averageRating, totalRatings, ratingDisplay } = formatRatingStats(stats.avg, stats.count);
    const userRating = (store.ratings && store.ratings.length > 0) ? store.ratings[0].rating : null;

    const { ratings, ...storeData } = store;

    return {
      ...storeData,
      averageRating,
      totalRatings,
      ratingDisplay,
      userRating,
    };
  });

  // If sorting by rating, sort in memory
  if (sortBy === "rating") {
    const isDesc = order.toLowerCase() !== "asc";
    storeList.sort((a, b) => {
      if (b.averageRating !== a.averageRating) {
        return isDesc ? b.averageRating - a.averageRating : a.averageRating - b.averageRating;
      }
      return isDesc ? b.totalRatings - a.totalRatings : a.totalRatings - b.totalRatings;
    });
  }

  return storeList;
};

/**
 * Get detailed store info including rating breakdown and user's rating.
 */
const getStoreById = async (storeId, currentUserId = null) => {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      ratings: currentUserId
        ? {
            where: { userId: currentUserId },
            select: { rating: true },
          }
        : false,
    },
  });

  if (!store || store.status !== "APPROVED") {
    const error = new Error("Store not found or not approved");
    error.statusCode = 404;
    throw error;
  }

  // Aggregate average and total ratings
  const agg = await prisma.rating.aggregate({
    where: { storeId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const { averageRating, totalRatings, ratingDisplay } = formatRatingStats(
    agg._avg.rating,
    agg._count.rating
  );

  // Group distribution of 1 to 5 stars
  const distributionGroups = await prisma.rating.groupBy({
    by: ["rating"],
    where: { storeId },
    _count: { rating: true },
  });

  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  distributionGroups.forEach((group) => {
    if (ratingDistribution[group.rating] !== undefined) {
      ratingDistribution[group.rating] = group._count.rating;
    }
  });

  const userRating = (store.ratings && store.ratings.length > 0) ? store.ratings[0].rating : null;
  const { ratings, ...storeData } = store;

  return {
    ...storeData,
    averageRating,
    totalRatings,
    ratingDisplay,
    ratingDistribution,
    userRating,
  };
};

/**
 * Create a new store.
 * Stores submitted by STORE_OWNER / USER default to PENDING.
 * Stores created by ADMIN default to APPROVED.
 * Maps P2002 error to "A store with this name and address already exists under your account."
 */
const createStore = async ({
  name,
  email,
  address,
  category,
  tags,
  imageUrl,
  userRole,
  userId,
  ownerId,
}) => {
  const status = userRole === "ADMIN" ? "APPROVED" : "PENDING";
  const targetOwnerId = (userRole === "ADMIN" && ownerId) ? parseInt(ownerId, 10) : userId;

  // If ownerId was provided, verify target owner exists
  if (targetOwnerId !== userId) {
    const ownerExists = await prisma.user.findUnique({
      where: { id: targetOwnerId },
    });
    if (!ownerExists) {
      const error = new Error("Specified store owner does not exist");
      error.statusCode = 404;
      throw error;
    }
  }

  const categoryVal = (category && category.trim()) ? category.trim() : "General";
  const tagsVal = (tags && tags.trim()) ? tags.trim() : null;

  try {
    const newStore = await prisma.store.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        category: categoryVal,
        tags: tagsVal,
        imageUrl: imageUrl || null,
        status,
        ownerId: targetOwnerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return newStore;
  } catch (error) {
    if (error.code === "P2002") {
      const customError = new Error("A store with this name and address already exists under your account.");
      customError.statusCode = 400;
      throw customError;
    }
    throw error;
  }
};

/**
 * Get top 10 rated approved stores, sorted by averageRating desc, totalRatings as tiebreaker.
 */
const getTopRatedStores = async (currentUserId = null) => {
  const stores = await getStores({
    sortBy: "rating",
    order: "desc",
    currentUserId,
  });

  return stores.slice(0, 10);
};

/**
 * Get distinct category list from all stores.
 */
const getCategories = async () => {
  const categoriesRaw = await prisma.store.findMany({
    select: { category: true },
    distinct: ["category"],
  });

  const categories = categoriesRaw
    .map((c) => c.category)
    .filter((c) => Boolean(c) && c.trim().length > 0);

  if (!categories.includes("General")) {
    categories.push("General");
  }

  categories.sort();
  return categories;
};

/**
 * Search stores with boosting tag and category matches over address matches, with pagination.
 */
const searchStores = async ({
  query = "",
  category = "",
  page = 1,
  limit = 10,
  currentUserId = null,
}) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);

  const whereClause = {
    status: "APPROVED",
  };

  if (category && category.trim()) {
    whereClause.category = category.trim();
  }

  if (query && query.trim()) {
    const term = query.trim();
    whereClause.OR = [
      { name: { contains: term } },
      { address: { contains: term } },
      { category: { contains: term } },
      { tags: { contains: term } },
    ];
  }

  // Fetch candidate stores
  const stores = await prisma.store.findMany({
    where: whereClause,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      ratings: currentUserId
        ? {
            where: { userId: currentUserId },
            select: { rating: true },
          }
        : false,
    },
  });

  if (stores.length === 0) {
    return {
      stores: [],
      pagination: {
        total: 0,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: 1,
      },
      total: 0,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: 1,
    };
  }

  const storeIds = stores.map((s) => s.id);

  // Group aggregates
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

  const qLower = query ? query.trim().toLowerCase() : "";

  // Compute stats and relevance score for boosting
  const rankedStores = stores.map((store) => {
    const stats = aggMap.get(store.id) || { avg: null, count: 0 };
    const { averageRating, totalRatings, ratingDisplay } = formatRatingStats(stats.avg, stats.count);
    const userRating = (store.ratings && store.ratings.length > 0) ? store.ratings[0].rating : null;

    let relevanceScore = 0;
    if (qLower) {
      // Boosting: tag match (+3), category match (+2), name match (+1.5), address match (+1)
      if (store.tags && store.tags.toLowerCase().includes(qLower)) relevanceScore += 3;
      if (store.category && store.category.toLowerCase().includes(qLower)) relevanceScore += 2;
      if (store.name && store.name.toLowerCase().includes(qLower)) relevanceScore += 1.5;
      if (store.address && store.address.toLowerCase().includes(qLower)) relevanceScore += 1;
    }

    const { ratings, ...storeData } = store;

    return {
      ...storeData,
      averageRating,
      totalRatings,
      ratingDisplay,
      userRating,
      relevanceScore,
    };
  });

  // Sort by relevanceScore desc, then averageRating desc, then totalRatings desc
  rankedStores.sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    if (b.averageRating !== a.averageRating) {
      return b.averageRating - a.averageRating;
    }
    return b.totalRatings - a.totalRatings;
  });

  const total = rankedStores.length;
  const totalPages = Math.ceil(total / parsedLimit) || 1;
  const startIndex = (parsedPage - 1) * parsedLimit;
  const paginated = rankedStores.slice(startIndex, startIndex + parsedLimit);

  return {
    stores: paginated,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages,
    },
    total,
    page: parsedPage,
    limit: parsedLimit,
    totalPages,
  };
};

module.exports = {
  getStores,
  getStoreById,
  createStore,
  getTopRatedStores,
  getCategories,
  searchStores,
};
