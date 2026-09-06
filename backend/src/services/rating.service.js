const prisma = require("../config/prisma");

/**
 * Upsert a rating for a store by an authenticated user.
 */
const upsertRating = async ({ userId, storeId, rating }) => {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });

  if (!store) {
    const error = new Error("Store not found");
    error.statusCode = 404;
    throw error;
  }

  if (store.status !== "APPROVED") {
    const error = new Error("Cannot rate a store that is not approved");
    error.statusCode = 400;
    throw error;
  }

  // Prevent store owner from rating their own store
  if (store.ownerId === userId) {
    const error = new Error("Store owners cannot rate their own stores");
    error.statusCode = 400;
    throw error;
  }

  const savedRating = await prisma.rating.upsert({
    where: {
      userId_storeId: {
        userId,
        storeId,
      },
    },
    update: {
      rating,
    },
    create: {
      userId,
      storeId,
      rating,
    },
  });

  // Calculate updated store rating metrics
  const agg = await prisma.rating.aggregate({
    where: { storeId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const avg = agg._avg.rating !== null ? Math.round(agg._avg.rating * 10) / 10 : 0.0;
  const count = agg._count.rating;

  return {
    rating: savedRating,
    averageRating: avg,
    totalRatings: count,
    ratingDisplay: avg.toFixed(1),
  };
};

module.exports = {
  upsertRating,
};
