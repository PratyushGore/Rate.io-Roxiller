const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

/**
 * Generate a standard JWT payload containing { id, role }.
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || "default_jwt_secret_roxiller",
    { expiresIn: "7d" }
  );
};

/**
 * Register a new user (USER or STORE_OWNER).
 */
const signup = async ({ name, email, password, address, role }) => {
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
      role: role || "USER",
    },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      profilePhoto: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const token = generateToken(newUser);

  return { user: newUser, token };
};

/**
 * Authenticate user with email and password.
 */
const login = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);

  const userPublic = {
    id: user.id,
    name: user.name,
    email: user.email,
    address: user.address,
    profilePhoto: user.profilePhoto,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return { user: userPublic, token };
};

/**
 * Change authenticated user's password.
 */
const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordValid) {
    const error = new Error("Current password does not match");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { message: "Password updated successfully" };
};

/**
 * Get profile details for the authenticated user.
 */
const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      profilePhoto: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

/**
 * Update profile photo for an authenticated user.
 */
const updateProfilePhoto = async (userId, photoPath) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  // Remove old photo file from disk if it was previously uploaded locally
  if (existingUser.profilePhoto && existingUser.profilePhoto.startsWith("/uploads/profiles/")) {
    try {
      const fs = require("fs");
      const path = require("path");
      const oldFilePath = path.join(__dirname, "../..", existingUser.profilePhoto);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    } catch (err) {
      console.warn("Failed to delete previous profile photo:", err.message);
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { profilePhoto: photoPath },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      profilePhoto: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

/**
 * Remove profile photo for an authenticated user (reverting to default avatar).
 */
const removeProfilePhoto = async (userId) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (existingUser.profilePhoto && existingUser.profilePhoto.startsWith("/uploads/profiles/")) {
    try {
      const fs = require("fs");
      const path = require("path");
      const oldFilePath = path.join(__dirname, "../..", existingUser.profilePhoto);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    } catch (err) {
      console.warn("Failed to delete profile photo file:", err.message);
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { profilePhoto: null },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      profilePhoto: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

module.exports = {
  signup,
  login,
  changePassword,
  getCurrentUser,
  updateProfilePhoto,
  removeProfilePhoto,
};
