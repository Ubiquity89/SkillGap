const express = require("express");
const { createJob, getJobs, getJobById, deleteJob } = require("../controllers/jobController");
const auth = require("../middleware/auth");

const router = express.Router();

// POST /api/jobs - Create new job description
router.post("/", auth, createJob);

// GET /api/jobs - Get all jobs for the user
router.get("/", auth, getJobs);

// GET /api/jobs/:id - Get specific job by ID
router.get("/:id", auth, getJobById);

// DELETE /api/jobs/:id - Delete a job
router.delete("/:id", auth, deleteJob);

module.exports = router;
