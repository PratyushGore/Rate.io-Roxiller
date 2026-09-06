const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");

/**
 * Get dashboard overview metrics.
 */
const getDashboardMetrics = async () => {
  const [
    totalUsers,
    usersCount,
    ownersCount,
    adminsCount,
    totalStores,
    approvedStores,
    pendingStores,
    rejectedStores,
    totalRatings,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.user.count({ where: { role: "STORE_OWNER" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.store.count(),
    prisma.store.count({ where: { status: "APPROVED" } }),
    prisma.store.count({ where: { status: "PENDING" } }),
    prisma.store.count({ where: { status: "REJECTED" } }),
    prisma.rating.count(),
  ]);

  return {
    totalUsers,
    roleBreakdown: {
      users: usersCount,
      storeOwners: ownersCount,
      admins: adminsCount,
    },
    totalStores,
    storeBreakdown: {
      approved: approvedStores,
      pending: pendingStores,
      rejected: rejectedStores,
    },
    totalRatings,
  };
};

/**
 * List all users with optional search, role filter, and sorting.
 */
const listUsers = async ({ search, role, sortBy = "createdAt", order = "desc", sort }) => {
  const where = {};

  if (role) {
    where.role = role;
  }

  if (search && search.trim().length > 0) {
    const term = search.trim();
    where.OR = [
      { name: { contains: term } },
      { email: { contains: term } },
      { address: { contains: term } },
    ];
  }

  let finalSortBy = sortBy;
  let finalOrder = order;

  if (sort) {
    switch (sort) {
      case "name_asc":
        finalSortBy = "name";
        finalOrder = "asc";
        break;
      case "name_desc":
        finalSortBy = "name";
        finalOrder = "desc";
        break;
      case "newest":
        finalSortBy = "createdAt";
        finalOrder = "desc";
        break;
      case "oldest":
        finalSortBy = "createdAt";
        finalOrder = "asc";
        break;
      default:
        break;
    }
  }

  const validSortFields = ["id", "name", "email", "role", "createdAt"];
  const sortField = validSortFields.includes(finalSortBy) ? finalSortBy : "createdAt";
  const sortOrder = finalOrder.toLowerCase() === "asc" ? "asc" : "desc";

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      profilePhoto: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          stores: true,
          ratings: true,
        },
      },
    },
    orderBy: {
      [sortField]: sortOrder,
    },
  });

  return users;
};

/**
 * Create a new user with any designated role (ADMIN, STORE_OWNER, USER).
 */
const createUser = async ({ name, email, password, address, role }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    const error = new Error("An account with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      address: address ? address.trim() : null,
      role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return newUser;
};

/**
 * Update user role.
 */
const updateUserRole = async (userId, newRole) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

/**
 * Delete a user by ID.
 * Disallows deleting the executing admin's own account.
 */
const deleteUser = async (userId, currentAdminId) => {
  if (userId === currentAdminId) {
    const error = new Error("Cannot delete your own admin account");
    error.statusCode = 400;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  return { message: "User deleted successfully" };
};

/**
 * List all stores (all statuses: PENDING, APPROVED, REJECTED) with owner details and rating stats.
 */
const listStores = async ({ status, search, sortBy = "createdAt", order = "desc", sort }) => {
  const where = {};

  if (status) {
    where.status = status;
  }

  if (search && search.trim().length > 0) {
    const term = search.trim();
    where.OR = [
      { name: { contains: term } },
      { address: { contains: term } },
      { email: { contains: term } },
    ];
  }

  let finalSortBy = sortBy;
  let finalOrder = order;

  if (sort) {
    switch (sort) {
      case "name_asc":
        finalSortBy = "name";
        finalOrder = "asc";
        break;
      case "name_desc":
        finalSortBy = "name";
        finalOrder = "desc";
        break;
      case "rating_desc":
        finalSortBy = "rating";
        finalOrder = "desc";
        break;
      case "newest":
        finalSortBy = "createdAt";
        finalOrder = "desc";
        break;
      case "oldest":
        finalSortBy = "createdAt";
        finalOrder = "asc";
        break;
      default:
        break;
    }
  }

  const validSortFields = ["id", "name", "email", "status", "createdAt"];
  const sortField = validSortFields.includes(finalSortBy) ? finalSortBy : "createdAt";
  const sortOrder = finalOrder.toLowerCase() === "asc" ? "asc" : "desc";

  const stores = await prisma.store.findMany({
    where,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: finalSortBy !== "rating" ? {
      [sortField]: sortOrder,
    } : undefined,
  });

  if (stores.length === 0) {
    return [];
  }

  const storeIds = stores.map((s) => s.id);

  // Group aggregates for rating calculations
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

  const storeList = stores.map((store) => {
    const stats = aggMap.get(store.id) || { avg: null, count: 0 };
    const roundedAvg = stats.avg !== null ? Math.round(stats.avg * 10) / 10 : 0.0;
    return {
      ...store,
      averageRating: roundedAvg,
      totalRatings: stats.count,
      ratingDisplay: stats.avg !== null ? roundedAvg.toFixed(1) : "Unrated",
    };
  });

  if (finalSortBy === "rating") {
    const isDesc = finalOrder.toLowerCase() !== "asc";
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
 * Update store status (APPROVED or REJECTED).
 */
const updateStoreStatus = async (storeId, status) => {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });

  if (!store) {
    const error = new Error("Store not found");
    error.statusCode = 404;
    throw error;
  }

  const updatedStore = await prisma.store.update({
    where: { id: storeId },
    data: { status },
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

  return updatedStore;
};

/**
 * Delete a store by ID.
 */
const deleteStore = async (storeId) => {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });

  if (!store) {
    const error = new Error("Store not found");
    error.statusCode = 404;
    throw error;
  }

  await prisma.store.delete({
    where: { id: storeId },
  });

  return { message: "Store deleted successfully" };
};

module.exports = {
  getDashboardMetrics,
  listUsers,
  createUser,
  updateUserRole,
  deleteUser,
  listStores,
  updateStoreStatus,
  deleteStore,
};
