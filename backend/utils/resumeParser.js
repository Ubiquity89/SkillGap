/**
 * Robust Resume Parser using pdfjs-dist
 * Extracts skills from resume text with dictionary-based approach
 */

const { SKILLS_DICTIONARY, ALL_SKILLS, normalizeSkillName } = require('./skillsDictionary');

let pdfjs = null;

// Dynamic import for ES module
async function getPdfjs() {
  if (!pdfjs) {
    const module = await import("pdfjs-dist/legacy/build/pdf.mjs");
    pdfjs = module;
  }
  return pdfjs;
}

/**
 * Extract text from PDF buffer using pdfjs-dist
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromPDF(buffer) {
  try {
    console.log('📄 Starting PDF extraction with pdfjs-dist...');
    
    // Get pdfjs dynamically
    const pdfjsLib = await getPdfjs();
    
    // Load PDF document
    const pdf = await pdfjsLib.getDocument({ 
      data: buffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      disableFontFace: true
    }).promise;

    let fullText = '';
    const numPages = pdf.numPages;
    console.log(`📄 PDF has ${numPages} pages`);

    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Combine text items from the page
        const pageText = textContent.items
          .map(item => item.str || '')
          .join(' ')
          .trim();
        
        if (pageText) {
          fullText += pageText + '\n';
        }
      } catch (pageError) {
        console.warn(`⚠️ Warning extracting page ${pageNum}:`, pageError.message);
      }
    }

    console.log(`✅ PDF extraction complete. Extracted ${fullText.length} characters`);
    return fullText.toLowerCase();
    
  } catch (error) {
    console.error('❌ PDF extraction failed:', error.message);
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
}

/**
 * Extract skills from resume text using dictionary approach
 * @param {string} resumeText - Resume text content
 * @returns {Object} - Extracted skills and metadata
 */
function extractSkillsFromResume(resumeText) {
  if (!resumeText || typeof resumeText !== 'string') {
    return {
      skills: [],
      categories: {},
      summary: {
        totalSkills: 0,
        frontend: 0,
        backend: 0,
        database: 0,
        api: 0,
        design: 0,
        devops: 0,
        testing: 0,
        tooling: 0,
        mobile: 0,
        data: 0,
        process: 0
      }
    };
  }

  console.log('🔍 Starting skill extraction from resume...');
  
  const foundSkills = new Set();
  const skillCategories = {};
  const skillContexts = new Map();

  // Normalize text for processing
  const normalizedText = resumeText.toLowerCase();
  
  // Extract skills using dictionary approach
  Object.entries(SKILLS_DICTIONARY).forEach(([category, skills]) => {
    skills.forEach(skill => {
      // Check for exact skill name first
      if (normalizedText.includes(skill)) {
        const normalizedSkill = normalizeSkillName(skill);
        foundSkills.add(normalizedSkill);
        
        // Store category information
        if (!skillCategories[normalizedSkill]) {
          skillCategories[normalizedSkill] = [];
        }
        skillCategories[normalizedSkill].push(category);
        
        // Store context for debugging
        if (!skillContexts.has(normalizedSkill)) {
          skillContexts.set(normalizedSkill, []);
        }
        
        // Find surrounding context (up to 100 characters before and after)
        const skillIndex = normalizedText.indexOf(skill);
        const start = Math.max(0, skillIndex - 50);
        const end = Math.min(normalizedText.length, skillIndex + skill.length + 50);
        const context = normalizedText.substring(start, end).trim();
        skillContexts.get(normalizedSkill).push(context);
      }
    });
  });

  // Generate summary statistics
  const summary = {};
  Object.keys(SKILLS_DICTIONARY).forEach(category => {
    summary[category] = 0;
  });

  // Count skills by category
  foundSkills.forEach(skill => {
    const categories = skillCategories[skill] || [];
    categories.forEach(category => {
      summary[category] = (summary[category] || 0) + 1;
    });
  });

  const result = {
    skills: Array.from(foundSkills).map(skill => ({ name: skill })),
    categories: skillCategories,
    summary: {
      totalSkills: foundSkills.size,
      ...summary
    },
    context: Object.fromEntries(skillContexts)
  };

  console.log(`✅ Skill extraction complete. Found ${result.skills.length} skills:`, result.skills.map(s => s.name));
  console.log('📊 Category breakdown:', result.summary);

  return result;
}

/**
 * Extract experience from resume text
 * @param {string} resumeText - Resume text content
 * @returns {number} - Total years of experience
 */
function extractExperience(resumeText) {
  if (!resumeText) return 0;

  const text = resumeText.toLowerCase();
  
  // Look for experience patterns
  const experiencePatterns = [
    /(\d+)\+?\s*years?\s*(?:of\s*)?experience/i,
    /experience[:\s]*(\d+)/i,
    /(\d+)\s*years?\s*(?:of\s*)?(?:professional\s*)?experience/i,
    /total\s*experience[:\s]*(\d+)/i,
    /work\s*experience[:\s]*(\d+)/i
  ];

  let totalExperience = 0;
  
  experiencePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches && matches[1]) {
      const years = parseInt(matches[1]);
      if (!isNaN(years) && years > totalExperience) {
        totalExperience = years;
      }
    }
  });

  // Look for individual job durations and sum them up
  const jobDurationPatterns = [
    /(\d{4})\s*-\s*(\d{4}|\d{2})/g,  // 2020-2024 or 2020-24
    /(\d+)\s*years?\s*(?:at|from)\s*([a-z]+\s*\d{4})/gi,  // 3 years at Company 2020
    /(\d+)\s*years?\s*(?:since|from)\s*(\d{4})/gi  // 3 years since 2020
  ];

  const jobDurations = [];
  jobDurationPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const startYear = parseInt(match[1]);
      const endYear = match[2].length === 2 ? 
        2000 + parseInt(match[2]) : // Convert "24" to 2024
        parseInt(match[2]);
      
      if (!isNaN(startYear) && !isNaN(endYear) && endYear > startYear) {
        jobDurations.push(endYear - startYear);
      }
    }
  });

  // Sum up job durations
  const summedExperience = jobDurations.reduce((sum, duration) => sum + duration, 0);
  
  // Use the higher of explicit experience or summed durations
  const finalExperience = Math.max(totalExperience, summedExperience);
  
  console.log(`📅 Experience extraction: ${finalExperience} years (explicit: ${totalExperience}, summed: ${summedExperience})`);
  
  return finalExperience;
}

/**
 * Main resume parsing function
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<Object>} - Parsed resume data
 */
async function parseResume(buffer) {
  try {
    console.log('🚀 Starting resume parsing...');
    
    // Step 1: Extract text from PDF
    const resumeText = await extractTextFromPDF(buffer);
    
    if (!resumeText || resumeText.trim().length < 100) {
      throw new Error('Resume text too short or empty');
    }

    // Step 2: Extract skills
    const skillExtraction = extractSkillsFromResume(resumeText);
    
    // Step 3: Extract experience
    const totalExperience = extractExperience(resumeText);

    // Step 4: Generate normalized skills array
    const normalizedSkills = skillExtraction.skills.map(skill => skill.name);

    const result = {
      skills: skillExtraction.skills,
      normalizedSkills,
      categories: skillExtraction.categories,
      summary: skillExtraction.summary,
      totalExperience,
      extractedText: resumeText,
      confidence: calculateConfidence(skillExtraction.skills.length, resumeText.length)
    };

    console.log('✅ Resume parsing complete:', {
      skillsFound: result.skills.length,
      experience: result.totalExperience,
      confidence: result.confidence
    });

    return result;
    
  } catch (error) {
    console.error('❌ Resume parsing failed:', error.message);
    throw error;
  }
}

/**
 * Calculate confidence score for parsing
 * @param {number} skillCount - Number of skills found
 * @param {number} textLength - Length of extracted text
 * @returns {number} - Confidence score (0-100)
 */
function calculateConfidence(skillCount, textLength) {
  if (skillCount === 0) return 0;
  
  // Higher confidence with more skills and longer text
  const skillScore = Math.min(skillCount / 15, 1); // Cap at 15 skills
  const textScore = Math.min(textLength / 1000, 1); // Cap at 1000 chars
  
  return Math.round((skillScore * 0.7 + textScore * 0.3) * 100);
}

module.exports = {
  parseResume,
  extractTextFromPDF,
  extractSkillsFromResume,
  extractExperience
};
