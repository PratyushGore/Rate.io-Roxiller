const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const {
  validateAdminCreateUser,
  validateUserRoleUpdate,
  validateStoreStatusUpdate,
} = require("../validators/admin.validator");
const adminController = require("../controllers/admin.controller");

// Protect all admin routes with authentication and ADMIN role requirement
router.use(auth, requireRole("ADMIN"));

// Dashboard metrics
router.get("/metrics", adminController.getMetrics);
router.get("/dashboard", adminController.getMetrics);

// User management
router.get("/users", adminController.listUsers);
router.post("/users", validateAdminCreateUser, adminController.createUser);
router.patch("/users/:id/role", validateUserRoleUpdate, adminController.updateUserRole);
router.patch("/users/:id", validateUserRoleUpdate, adminController.updateUserRole);
router.delete("/users/:id", adminController.deleteUser);

// Store moderation
router.get("/stores", adminController.listStores);
router.patch("/stores/:id/status", validateStoreStatusUpdate, adminController.updateStoreStatus);
router.delete("/stores/:id", adminController.deleteStore);

module.exports = router;
