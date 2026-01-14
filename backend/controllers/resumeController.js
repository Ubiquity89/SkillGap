const admin = require("../config/firebase");
const fs = require('fs');
const path = require('path');
const { parseResume } = require("../utils/resumeParser");

// Simple file-based persistence for resumes
const RESUMES_FILE = path.join(__dirname, '../data/resumes.json');

// Load resumes from file on startup
let resumes = new Map();
try {
  if (fs.existsSync(RESUMES_FILE)) {
    const resumesData = JSON.parse(fs.readFileSync(RESUMES_FILE, 'utf8'));
    resumes = new Map(Object.entries(resumesData));
    console.log(' Loaded resumes from file:', Object.keys(resumesData).length, 'users with resumes');
  }
} catch (error) {
  console.log(' No resumes file found, starting fresh');
}

// Save resumes to file
const saveResumes = () => {
  try {
    const resumesDir = path.dirname(RESUMES_FILE);
    if (!fs.existsSync(resumesDir)) {
      fs.mkdirSync(resumesDir, { recursive: true });
    }
    const resumesData = {};
    resumes.forEach((userResumes, userId) => {
      resumesData[userId] = userResumes;
    });
    fs.writeFileSync(RESUMES_FILE, JSON.stringify(resumesData, null, 2));
    console.log(' Saved resumes to file');
  } catch (error) {
    console.error(' Failed to save resumes:', error);
  }
};

// Export resumes map and save function
exports.resumes = resumes;
exports.saveResumes = saveResumes;

// Upload resume with PDF parsing and skill extraction
exports.uploadResume = async (req, res) => {
  try {
    console.log('=== PDF RESUME UPLOAD START ===');

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required"
      });
    }

    // Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(token);
    const { uid, email } = decoded;

    console.log('Processing PDF:', req.file.originalname);

    try {
      // 1️⃣ Parse resume using new robust parser
      const pdfBuffer = req.file.buffer;
      
      console.log('📄 Parsing PDF with new robust parser...');
      const parsedResume = await parseResume(pdfBuffer);
      
      console.log('=== RESUME PARSING RESULTS ===');
      console.log('Skills extracted:', parsedResume.skills.length, 'skills found');
      console.log('Found skills:', parsedResume.skills.map(s => s.name));
      console.log('Experience found:', parsedResume.totalExperience, 'years');
      console.log('Confidence:', parsedResume.confidence, '%');
      
      // 2️⃣ Use parsed data directly
      const parsedSkills = parsedResume.skills;
      const totalExperience = parsedResume.totalExperience;

      // 4️⃣ Check for duplicate resumes
      const userResumes = resumes.get(uid) || [];
      const isDuplicate = userResumes.some(existingResume => {
        // Check if file name is the same
        if (existingResume.fileName === req.file.originalname) {
          return true;
        }
        
        // Check if skills are the same
        const existingSkills = existingResume.skills || [];
        if (existingSkills.length === parsedSkills.length) {
          const skillsMatch = existingSkills.every(skill => 
            parsedSkills.some(newSkill => skill.name === newSkill.name)
          );
          if (skillsMatch) {
            return true;
          }
        }
        
        return false;
      });

      if (isDuplicate) {
        return res.status(409).json({
          success: false,
          message: "A resume with the same file name or skills already exists"
        });
      }

      // 5️⃣ Create resume object
      const resume = {
        id: `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: uid,
        email: email,
        fileName: req.file.originalname,
        uploadType: 'file',
        skills: parsedSkills,
        normalizedSkills: parsedResume.normalizedSkills,
        totalExperience: totalExperience,
        extractedText: parsedResume.extractedText,
        categories: parsedResume.categories,
        summary: parsedResume.summary,
        confidence: parsedResume.confidence,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // 6️⃣ Save resume
      if (!resumes.has(uid)) {
        resumes.set(uid, []);
      }
      resumes.get(uid).push(resume);
      saveResumes();

      console.log('Resume saved successfully:', { 
        resumeId: resume.id, 
        userId: uid, 
        fileName: resume.fileName,
        skillsCount: resume.skills.length
      });

      res.status(201).json({
        success: true,
        message: "Resume uploaded and parsed successfully",
        data: {
          id: resume.id,
          fileName: resume.fileName,
          uploadType: resume.uploadType,
          skillsCount: resume.skills.length,
          totalExperience: resume.totalExperience,
          createdAt: resume.createdAt
        }
      });

    } catch (parseError) {
      console.error('PDF parsing error:', parseError);
      res.status(500).json({
        success: false,
        message: "Failed to parse PDF file"
      });
    }

  } catch (err) {
    console.error('Upload resume error:', err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to upload resume",
      error: err.message 
    });
  }
};

exports.getUserResumes = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required"
      });
    }

    // Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(token);
    const { uid } = decoded;

    // Get user's resumes
    const userResumes = resumes.get(uid) || [];
    console.log('DEBUG: User resumes from storage:', userResumes);

    res.status(200).json({
      success: true,
      data: userResumes.map(resume => {
        console.log('DEBUG: Individual resume:', resume);
        return {
        id: resume.id,
        fileName: resume.fileName,
        uploadType: resume.uploadType,
        skills: resume.skills,
        normalizedSkills: resume.normalizedSkills,
        skillsCount: resume.skills.length,
        totalExperience: resume.totalExperience,
        extractedText: resume.extractedText,
        createdAt: resume.createdAt
      }})
    });

  } catch (err) {
    console.error('Get resumes error:', err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get resumes",
      error: err.message 
    });
  }
};

// Delete resume
exports.deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required"
      });
    }

    // Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(token);
    const { uid } = decoded;

    // Get user's resumes
    const userResumes = resumes.get(uid) || [];
    const resumeIndex = userResumes.findIndex(resume => resume.id === id);

    if (resumeIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Resume not found"
      });
    }

    // Remove the resume
    userResumes.splice(resumeIndex, 1);
    resumes.set(uid, userResumes);
    saveResumes();

    console.log('Resume deleted successfully:', { resumeId: id, userId: uid });

    res.status(200).json({
      success: true,
      message: "Resume deleted successfully"
    });

  } catch (err) {
    console.error('Delete resume error:', err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete resume",
      error: err.message 
    });
  }
};
