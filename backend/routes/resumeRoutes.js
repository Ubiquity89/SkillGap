const express = require("express");
const { uploadResume, getUserResumes, deleteResume } = require("../controllers/resumeController");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

// POST /api/resumes - Upload/save resume
router.post("/", auth, upload.single("resume"), uploadResume);

// GET /api/resumes - Get user's resumes
router.get("/", auth, getUserResumes);

// DELETE /api/resumes/:id - Delete resume
router.delete("/:id", auth, deleteResume);

module.exports = router;
