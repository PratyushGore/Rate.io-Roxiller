const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const optionalAuth = require("../middleware/optionalAuth");
const { requireRole } = require("../middleware/role");
const { uploadStoreImage } = require("../middleware/upload");
const { validateCreateStore } = require("../validators/store.validator");
const { validateUpsertRating } = require("../validators/rating.validator");
const storeController = require("../controllers/store.controller");
const ratingController = require("../controllers/rating.controller");

// Public catalog and discovery routes (MUST be defined before /:id)
router.get("/", optionalAuth, storeController.getStores);
router.get("/top-rated", optionalAuth, storeController.getTopRatedStores);
router.get("/categories", storeController.getCategories);
router.get("/search", optionalAuth, storeController.searchStores);
router.get("/:id", optionalAuth, storeController.getStoreById);

// Store creation (authenticated users/owners/admins, supports multipart/form-data image upload)
router.post("/", auth, uploadStoreImage, validateCreateStore, storeController.createStore);

// Nested rating route for store: POST /api/stores/:id/rating
router.post("/:id/rating", auth, requireRole("USER"), validateUpsertRating, ratingController.upsertRating);
router.post("/:id/ratings", auth, requireRole("USER"), validateUpsertRating, ratingController.upsertRating);

module.exports = router;

