const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const errorHandler = require("./middleware/errorHandler");
const { sendResponse } = require("./utils/apiResponse");

const app = express();

// Security headers (Helmet) with cross-origin allowed for static uploads
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Cross-Origin Resource Sharing
app.use(cors());

// Request logging (Morgan)
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const path = require("path");

// Serve uploaded files statically
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "../uploads"))
);

// Health check endpoint
app.get("/health", (req, res) => {
  return sendResponse(res, 200, true, { status: "UP", timestamp: new Date().toISOString() }, "Service is healthy");
});

// API Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/stores", require("./routes/store.routes"));
app.use("/api/ratings", require("./routes/rating.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/owner", require("./routes/owner.routes"));

// Catch-all 404 handler for undefined routes
app.use((req, res) => {
  return sendResponse(res, 404, false, null, `Route ${req.originalUrl} not found`);
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
