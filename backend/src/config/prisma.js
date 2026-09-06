const { PrismaClient } = require("@prisma/client");

// Instantiate PrismaClient as a singleton across the application
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

module.exports = prisma;
