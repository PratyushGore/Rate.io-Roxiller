const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const ownerController = require("../controllers/owner.controller");

// Protect all owner routes with authentication and STORE_OWNER role check
router.use(auth, requireRole("STORE_OWNER"));

// Support /api/owner/stores and /api/owner/stores/:id
router.get("/stores", ownerController.getStores);
router.get("/stores/:id", ownerController.getStoreAnalytics);

// Also support direct / and /:id if mounted at /api/owner/stores
router.get("/", ownerController.getStores);
router.get("/:id", ownerController.getStoreAnalytics);

module.exports = router;
