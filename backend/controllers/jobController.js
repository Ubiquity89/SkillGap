const admin = require("../config/firebase");
const fs = require('fs');
const path = require('path');
const { extractSkills } = require('../services/jobSkillExtractor');

// Simple file-based persistence for jobs
const JOBS_FILE = path.join(__dirname, '../data/jobs.json');

// Load jobs from file on startup
let jobs = new Map();
try {
  if (fs.existsSync(JOBS_FILE)) {
    const jobsData = JSON.parse(fs.readFileSync(JOBS_FILE, 'utf8'));
    jobs = new Map(Object.entries(jobsData));
    console.log(' Loaded jobs from file:', Object.keys(jobsData).length, 'users with jobs');
  }
} catch (error) {
  console.log(' No jobs file found, starting fresh');
}

// Save jobs to file
const saveJobs = () => {
  try {
    const jobsDir = path.dirname(JOBS_FILE);
    if (!fs.existsSync(jobsDir)) {
      fs.mkdirSync(jobsDir, { recursive: true });
    }
    const jobsData = {};
    jobs.forEach((userJobs, userId) => {
      jobsData[userId] = userJobs;
    });
    fs.writeFileSync(JOBS_FILE, JSON.stringify(jobsData, null, 2));
    console.log(' Saved jobs to file');
  } catch (error) {
    console.error(' Failed to save jobs:', error);
  }
};

// Export jobs map and save function
exports.jobs = jobs;
exports.saveJobs = saveJobs;

exports.createJob = async (req, res) => {
  try {
    console.log('=== JOB CREATION START ===');
    console.log('Request body:', req.body);

    const { jobTitle, requiredSkills, niceToHaveSkills, minimumExperience, description, useAutoExtraction } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      console.log('ERROR: No authorization token provided');
      return res.status(401).json({
        success: false,
        message: "Authorization token is required"
      });
    }

    // Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(token);
    console.log('Token decoded successfully:', { uid: decoded.uid, email: decoded.email });

    const { uid, email } = decoded;

    // Validate required fields
    if (!jobTitle || !minimumExperience) {
      return res.status(400).json({
        success: false,
        message: "Job title and minimum experience are required"
      });
    }

    let finalRequiredSkills = requiredSkills || [];
    let finalNiceToHaveSkills = niceToHaveSkills || [];
    let extractionSummary = null;

    // Auto-extract skills if requested and description is provided
    if (useAutoExtraction && description && description.trim().length > 50) {
      console.log('🤖 Auto-extracting skills from job description...');
      
      try {
        const extractionResult = await extractSkills(description);
        
        // Convert to expected format for existing logic
        finalRequiredSkills = extractionResult.required_skills.map(skill => ({ name: skill }));
        finalNiceToHaveSkills = extractionResult.nice_to_have_skills.map(skill => ({ name: skill }));
        
        extractionSummary = {
          totalSkills: extractionResult.required_skills.length + extractionResult.nice_to_have_skills.length,
          requiredCount: extractionResult.required_skills.length,
          niceToHaveCount: extractionResult.nice_to_have_skills.length,
          categories: {},
          confidence: 85
        };
        
        console.log('✅ Skills extracted successfully:', {
          required: finalRequiredSkills.length,
          niceToHave: finalNiceToHaveSkills.length,
          confidence: extractionSummary.confidence
        });
      } catch (error) {
        console.error('❌ Skill extraction failed:', error.message);
        // Fall back to manual skills if extraction fails
      }
    }

    // Create job object
    const job = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: uid,
      email: email,
      jobTitle,
      requiredSkills: finalRequiredSkills,
      niceToHaveSkills: finalNiceToHaveSkills,
      minimumExperience: parseFloat(minimumExperience),
      description: description || '',
      extractionSummary, // Store extraction summary for reference
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store in memory and save to file
    if (!jobs.has(uid)) {
      jobs.set(uid, []);
    }
    jobs.get(uid).push(job);
    saveJobs(); // Save to file

    console.log('Job created successfully:', { 
      jobId: job.id, 
      userId: uid, 
      jobTitle: job.jobTitle,
      requiredSkillsCount: job.requiredSkills.length,
      autoExtracted: !!extractionSummary
    });

    res.status(201).json({
      success: true,
      message: "Job description created successfully",
      data: {
        id: job.id,
        jobTitle: job.jobTitle,
        requiredSkills: job.requiredSkills,
        niceToHaveSkills: job.niceToHaveSkills,
        requiredSkillsCount: job.requiredSkills.length,
        niceToHaveSkillsCount: job.niceToHaveSkills.length,
        minimumExperience: job.minimumExperience,
        description: job.description,
        extractionSummary,
        autoExtracted: !!extractionSummary,
        createdAt: job.createdAt
      }
    });

  } catch (err) {
    console.error('Job creation error:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    res.status(500).json({ 
      success: false, 
      message: "Failed to create job description",
      error: err.message 
    });
  }
};

exports.getJobs = async (req, res) => {
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

    // Get user's jobs
    const userJobs = jobs.get(uid) || [];

    res.status(200).json({
      success: true,
      data: userJobs.map(job =>({
        id: job.id,
        jobTitle: job.jobTitle,
        requiredSkills: job.requiredSkills,
        niceToHaveSkills: job.niceToHaveSkills,
        requiredSkillsCount: job.requiredSkills.length,
        minimumExperience: job.minimumExperience,
        createdAt: job.createdAt
      }))
    });

  } catch (err) {
    console.error('Get jobs error:', err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get jobs",
      error: err.message 
    });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    
    // Get user's jobs from the Map
    const userJobs = jobs.get(userId) || [];
    
    // Find the job index in user's jobs array
    const jobIndex = userJobs.findIndex(job => job.id === id);
    
    if (jobIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Job not found or you don't have permission to delete it"
      });
    }
    
    // Remove the job from user's jobs array
    userJobs.splice(jobIndex, 1);
    
    // Update the Map with the modified user jobs
    jobs.set(userId, userJobs);
    
    // Convert Map back to object format for file storage
    const jobsObject = Object.fromEntries(jobs);
    
    // Save updated jobs to file
    fs.writeFileSync(JOBS_FILE, JSON.stringify(jobsObject, null, 2));
    
    res.json({
      success: true,
      message: "Job deleted successfully"
    });
    
  } catch (err) {
    console.error('Delete job error:', err);
    res.status(500).json({
      success: false,
      message: "Failed to delete job",
      error: err.message
    });
  }
};

exports.getJobById = async (req, res) => {
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

    // Get user's jobs
    const userJobs = jobs.get(uid) || [];
    const job = userJobs.find(j => j.id === id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    res.status(200).json({
      success: true,
      data: job
    });

  } catch (err) {
    console.error('Get job error:', err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get job",
      error: err.message 
    });
  }
};
