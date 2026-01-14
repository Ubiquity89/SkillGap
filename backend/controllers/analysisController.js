const admin = require("../config/firebase");
const fs = require("fs");
const path = require("path");
const normalizeSkill = require("../utils/normalizeSkill");
const { computeSkillGapPriority } = require("../utils/skillGapPriority");
const { jobs } = require("../controllers/jobController");
const { resumes } = require("../controllers/resumeController");

const ANALYSES_FILE = path.join(__dirname, "../data/analyses.json");

/* -------------------- LOAD / SAVE -------------------- */

let analyses = new Map();

if (fs.existsSync(ANALYSES_FILE)) {
  const raw = JSON.parse(fs.readFileSync(ANALYSES_FILE, "utf8"));
  analyses = new Map(Object.entries(raw));
}

const saveAnalyses = () => {
  const obj = {};
  analyses.forEach((v, k) => (obj[k] = v));
  fs.writeFileSync(ANALYSES_FILE, JSON.stringify(obj, null, 2));
};

exports.analyses = analyses;

/* -------------------- CREATE ANALYSIS -------------------- */

exports.createAnalysis = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const { uid, email } = await admin.auth().verifyIdToken(token);
    const { resumeId, jobId } = req.body;

    const userResumes = resumes.get(uid) || [];
    const userJobs = jobs.get(uid) || [];

    const resume = userResumes.find(r => r.id === resumeId);
    const job = userJobs.find(j => j.id === jobId);

    if (!resume || !job) {
      return res.status(404).json({ message: "Resume or Job not found" });
    }

    const analysisResult = performDetailedAnalysis(resume, job);

    const analysis = {
      id: `analysis_${Date.now()}`,
      userId: uid,
      email,
      resumeId,
      jobId,
      resumeName: resume.fileName,
      jobTitle: job.jobTitle,
      matchScore: analysisResult.matchScore,
      status: analysisResult.status,
      matchedSkills: analysisResult.matchedSkills,
      missingSkills: analysisResult.missingSkills,
      extraSkills: analysisResult.extraSkills,
      skillGapPriority: analysisResult.skillGapPriority,
      experience: analysisResult.experience,
      atsSuggestions: analysisResult.atsSuggestions,
      createdAt: new Date().toISOString()
    };

    if (!analyses.has(uid)) analyses.set(uid, []);
    analyses.get(uid).push(analysis);
    saveAnalyses();

    res.status(201).json({ success: true, data: analysis });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Analysis failed" });
  }
};

/* -------------------- GET ALL ANALYSES -------------------- */

exports.getAnalyses = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const { uid } = await admin.auth().verifyIdToken(token);

    const userAnalyses = analyses.get(uid) || [];

    res.json({
      success: true,
      data: userAnalyses.map(a => ({
        id: a.id,
        resumeName: a.resumeName,
        jobTitle: a.jobTitle,
        matchScore: a.matchScore,
        status: a.status,
        date: a.createdAt
      }))
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch analyses" });
  }
};

/* -------------------- GET ANALYSIS BY ID -------------------- */

exports.getAnalysisById = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const { uid } = await admin.auth().verifyIdToken(token);

    const analysis = (analyses.get(uid) || []).find(
      a => a.id === req.params.id
    );

    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    // Transform analysis data to match frontend expectations
    const transformedAnalysis = {
      id: analysis.id,
      resumeId: analysis.resumeId,
      jobId: analysis.jobId,
      resumeName: analysis.resumeName,
      jobTitle: analysis.jobTitle,
      overallScore: analysis.matchScore,
      status: analysis.status.toLowerCase().replace(' ', '_'),
      skillsMatch: {
        matched: analysis.matchedSkills.map(skill => ({ name: skill })),
        missing: analysis.missingSkills.map(skill => ({ name: skill })),
        extra: analysis.extraSkills.map(skill => ({ name: skill }))
      },
      experienceAlignment: {
        required: analysis.experience.required,
        found: analysis.experience.found,
        status: analysis.experience.found >= analysis.experience.required ? 'aligned' : 'not_aligned'
      },
      skillGapPriority: {
        high: Array.isArray(analysis.skillGapPriority?.high) && analysis.skillGapPriority.high.length > 0 && typeof analysis.skillGapPriority.high[0] === 'object' 
          ? analysis.skillGapPriority.high 
          : (analysis.skillGapPriority?.high || []).map(skill => ({ name: skill, reason: "Important skill for this role", impact: "+10% match score" })),
        medium: Array.isArray(analysis.skillGapPriority?.medium) && analysis.skillGapPriority.medium.length > 0 && typeof analysis.skillGapPriority.medium[0] === 'object'
          ? analysis.skillGapPriority.medium
          : (analysis.skillGapPriority?.medium || []).map(skill => ({ name: skill, reason: "Important skill for this role", impact: "+7% match score" })),
        low: Array.isArray(analysis.skillGapPriority?.low) && analysis.skillGapPriority.low.length > 0 && typeof analysis.skillGapPriority.low[0] === 'object'
          ? analysis.skillGapPriority.low
          : (analysis.skillGapPriority?.low || []).map(skill => ({ name: skill, reason: "Nice-to-have skill", impact: "+3% match score" }))
      },
      roleMismatch: analysis.roleMismatch,
      nextBestAction: analysis.nextBestAction,
      atsKeywordSuggestions: analysis.atsSuggestions,
      recommendations: analysis.atsSuggestions || [],
      createdAt: analysis.createdAt,
      updatedAt: analysis.createdAt
    };

    res.json({ success: true, data: transformedAnalysis });

  } catch (err) {
    res.status(500).json({ message: "Failed to load analysis" });
  }
};

/* -------------------- DELETE ANALYSIS -------------------- */

exports.deleteAnalysis = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { uid } = await admin.auth().verifyIdToken(token);

  const list = analyses.get(uid) || [];
  const index = list.findIndex(a => a.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Analysis not found" });
  }

  list.splice(index, 1);
  analyses.set(uid, list);
  saveAnalyses();

  res.json({ success: true });
};

/* -------------------- CORE ANALYSIS LOGIC -------------------- */

function performDetailedAnalysis(resume, job) {
  const resumeSkills = resume.skills.map(s =>
    normalizeSkill(typeof s === "string" ? s : s.name)
  );

  const requiredSkills = job.requiredSkills.map(s =>
    normalizeSkill(typeof s === "string" ? s : s.name)
  );

  const matchedSkills = [];
  const missingSkills = [];
  const extraSkills = [];

  requiredSkills.forEach(skill =>
    resumeSkills.includes(skill)
      ? matchedSkills.push(skill)
      : missingSkills.push(skill)
  );

  resumeSkills.forEach(skill => {
    if (!requiredSkills.includes(skill)) extraSkills.push(skill);
  });

  // Remove duplicates from extraSkills
  const uniqueExtraSkills = [...new Set(extraSkills)];

  const skillScore =
    requiredSkills.length === 0
      ? 0
      : (matchedSkills.length / requiredSkills.length) * 100;

  const resumeExp = resume.totalExperience || 0;
  const requiredExp = job.minExperience || 0;

  const expScore =
    requiredExp === 0 ? 100 : Math.min(100, (resumeExp / requiredExp) * 100);

  const finalScore = Math.round(skillScore * 0.8 + expScore * 0.2);

  // Compute skill gap priority using the new system
  const skillGapPriorityResult = computeSkillGapPriority(missingSkills, job.jobTitle, resumeSkills);
  
  // Generate ATS keyword suggestions based on missing high-priority skills
  const atsSuggestions = skillGapPriorityResult.detailed
    .filter(item => item.score >= 3)
    .slice(0, 5)
    .map(item => item.skill.charAt(0).toUpperCase() + item.skill.slice(1));

  let status =
    finalScore >= 70 ? "Strong Fit" :
    finalScore >= 50 ? "Partial Fit" :
    "Weak Fit";

  return {
    matchScore: finalScore,
    status,
    matchedSkills,
    missingSkills,
    extraSkills: uniqueExtraSkills,
    skillGapPriority: skillGapPriorityResult.priority,
    experience: {
      required: requiredExp,
      found: resumeExp
    },
    atsSuggestions,
    roleDetected: skillGapPriorityResult.role,
    roleMismatch: skillGapPriorityResult.roleMismatch,
    nextBestAction: skillGapPriorityResult.nextBestAction
  };
}
