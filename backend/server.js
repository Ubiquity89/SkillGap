require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

/* =====================================================
   CORS CONFIG (Node 22 + Express 5 SAFE)
===================================================== */
const allowedOrigins = [
  "https://skill-gap-u6ft.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// THIS IS IMPORTANT FOR PREFLIGHT
app.options("*", cors());

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
   HEALTH
===================================================== */
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

/* =====================================================
   ROOT
===================================================== */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SkillGap API is running",
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
   404
===================================================== */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* =====================================================
   START
===================================================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
