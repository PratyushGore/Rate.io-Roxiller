const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { uploadProfilePhoto } = require("../middleware/upload");
const {
  validateSignup,
  validateLogin,
  validateChangePassword,
} = require("../validators/auth.validator");
const authController = require("../controllers/auth.controller");

// Public authentication routes
router.post("/signup", validateSignup, authController.signup);
router.post("/login", validateLogin, authController.login);

// Protected routes (require valid JWT)
router.get("/me", auth, authController.getMe);
router.patch("/password", auth, validateChangePassword, authController.changePassword);
router.patch("/change-password", auth, validateChangePassword, authController.changePassword);
router.post("/profile-photo", auth, uploadProfilePhoto, authController.uploadProfilePhoto);
router.delete("/profile-photo", auth, authController.removeProfilePhoto);

module.exports = router;
