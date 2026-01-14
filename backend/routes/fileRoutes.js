const express = require("express");
const multer = require("multer");
const { processResumeFile } = require("../controllers/fileController");
const auth = require("../middleware/auth");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept PDF and DOCX files
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'), false);
    }
  }
});

// POST /api/files/upload-resume - Process uploaded resume file
router.post("/upload-resume", auth, upload.single('file'), processResumeFile);

module.exports = router;
