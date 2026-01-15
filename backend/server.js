require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Initialize Express app
const app = express();

/* =====================================================
   CORS CONFIG (🔥 FIXED – DO NOT MODIFY)
===================================================== */
const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser tools (Postman, curl)
    if (!origin) return callback(null, true);

    // Allow localhost
    if (origin.startsWith("http://localhost")) {
      return callback(null, true);
    }

    // Allow your Vercel domains
    if (
      origin === "https://skill-gap-u6ft.vercel.app" ||
      origin.endsWith(".vercel.app")
    ) {
      return callback(null, true);
    }

    // Otherwise block
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// 🔥 MUST be before routes
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* =====================================================
   BODY PARSERS
===================================================== */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* =====================================================
   ROUTES
===================================================== */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/resumes", require("./routes/resumeRoutes"));
app.use("/api/files", require("./routes/fileRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/analysis", require("./routes/analysisRoutes"));

/* =====================================================
   HEALTH CHECK
===================================================== */
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

/* =====================================================
   ROOT
===================================================== */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SkillGap API is running",
    version: "1.0.0",
  });
});

/* =====================================================
   ERROR HANDLING
===================================================== */
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* =====================================================
   404 HANDLER
===================================================== */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* =====================================================
   START SERVER
===================================================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});
