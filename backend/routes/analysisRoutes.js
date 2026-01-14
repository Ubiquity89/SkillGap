const express = require("express");
const { createAnalysis, getAnalyses, getAnalysisById, deleteAnalysis } = require("../controllers/analysisController");
const auth = require("../middleware/auth");

const router = express.Router();

// POST /api/analysis - Create new analysis (resume + job)
router.post("/", auth, createAnalysis);

// GET /api/analysis - Get all analyses for the user
router.get("/", auth, getAnalyses);

// GET /api/analysis/:id - Get specific analysis by ID
router.get("/:id", auth, getAnalysisById);

// DELETE /api/analysis/:id - Delete specific analysis by ID
router.delete("/:id", auth, deleteAnalysis);

module.exports = router;
