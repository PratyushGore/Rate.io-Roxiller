const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { sendResponse } = require("../utils/apiResponse");

// Ensure uploads/stores and uploads/profiles directories exist
const uploadDir = path.join(__dirname, "../../uploads/stores");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const profileUploadDir = path.join(__dirname, "../../uploads/profiles");
if (!fs.existsSync(profileUploadDir)) {
  fs.mkdirSync(profileUploadDir, { recursive: true });
}

// MIME whitelist
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Disk storage configuration for stores
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ownerId = req.user?.id || "anonymous";
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const sanitizedExt = [".jpg", ".jpeg", ".png", ".webp"].includes(ext)
      ? ext
      : file.mimetype === "image/png"
      ? ".png"
      : file.mimetype === "image/webp"
      ? ".webp"
      : ".jpg";

    const filename = `store-${ownerId}-${Date.now()}${sanitizedExt}`;
    cb(null, filename);
  },
});

// Disk storage configuration for user profile photos
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profileUploadDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user?.id || "user";
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const sanitizedExt = [".jpg", ".jpeg", ".png", ".webp"].includes(ext)
      ? ext
      : file.mimetype === "image/png"
      ? ".png"
      : file.mimetype === "image/webp"
      ? ".webp"
      : ".jpg";

    const filename = `profile-${userId}-${Date.now()}${sanitizedExt}`;
    cb(null, filename);
  },
});

// File filter for MIME or extension verification
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ];
  const allowedExtensions = /\.(jpg|jpeg|png|webp)$/i;

  const isMimeValid = allowedMimeTypes.includes(file.mimetype);
  const isExtValid = allowedExtensions.test(path.extname(file.originalname).toLowerCase());

  // Accept if either the MIME type or the file extension matches an allowed image format
  if (isMimeValid || isExtValid) {
    return cb(null, true);
  }

  cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
};

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max file size
  },
  fileFilter,
});

const profileUpload = multer({
  storage: profileStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max file size
  },
  fileFilter,
});

/**
 * Middleware handling single "image" file upload for stores.
 * Catches multer errors and returns standard 400 API response.
 */
const uploadStoreImage = (req, res, next) => {
  const uploadSingle = upload.single("image");

  uploadSingle(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return sendResponse(res, 400, false, null, "Image size exceeds 2MB limit.");
      }
      if (err.code === "INVALID_FILE_TYPE") {
        return sendResponse(res, 400, false, null, err.message);
      }
      return sendResponse(res, 400, false, null, err.message || "File upload failed.");
    }
    next();
  });
};

/**
 * Middleware handling single "photo" file upload for user profiles.
 * Catches multer errors and returns standard 400 API response.
 */
const uploadProfilePhoto = (req, res, next) => {
  const uploadSingle = profileUpload.single("photo");

  uploadSingle(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return sendResponse(res, 400, false, null, "Profile photo size exceeds 2MB limit.");
      }
      if (err.code === "INVALID_FILE_TYPE") {
        return sendResponse(res, 400, false, null, err.message);
      }
      return sendResponse(res, 400, false, null, err.message || "Profile photo upload failed.");
    }
    next();
  });
};

module.exports = {
  uploadStoreImage,
  uploadProfilePhoto,
};
