const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const { validateUpsertRating } = require("../validators/rating.validator");
const ratingController = require("../controllers/rating.controller");

// Dedicated rating route: POST /api/ratings
router.post("/", auth, requireRole("USER"), validateUpsertRating, ratingController.upsertRating);

module.exports = router;
