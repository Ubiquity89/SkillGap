/**
 * Job Skill Extractor Service
 * Uses Gemini Pro model to extract technical skills from job descriptions
 * Maintains strict JSON output and post-processing safety
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { normalizeSkillName } = require('../utils/skillsDictionary');

// Initialize Gemini Pro
let genAI = null;
let model = null;

// In-memory cache for performance
const cache = new Map();

/**
 * Initialize Gemini Pro model
 */
function initializeGemini() {
  if (genAI) return; // Already initialized
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ GEMINI_API_KEY not found in environment variables');
    return false;
  }
  
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    console.log('✅ Gemini Pro initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Gemini Pro:', error.message);
    return false;
  }
}

/**
 * Extract skills from job description using Gemini Pro
 * @param {string} jobDescription - Raw job description text
 * @returns {Object} - Extracted skills with strict JSON format
 */
async function extractSkills(jobDescription) {
  if (!jobDescription || typeof jobDescription !== 'string') {
    return getEmptyResult();
  }

  // Check cache first
  const cacheKey = generateHash(jobDescription);
  if (cache.has(cacheKey)) {
    console.log('📋 Using cached result for job description');
    return cache.get(cacheKey);
  }

  // Initialize Gemini if not already done
  if (!initializeGemini()) {
    console.error('❌ Cannot extract skills: Gemini Pro not available');
    return fallbackExtraction(jobDescription);
  }

  console.log('🤖 === GEMINI PRO SKILL EXTRACTION ===');
  console.log('Input text length:', jobDescription.length);

  try {
    // Create prompt for skill extraction
    const prompt = `You are an expert ATS parser for technical job descriptions.

Extract ONLY technical skills from the job description below.

STRICT RULES:
1. Extract ONLY skills explicitly mentioned in the text
2. Do NOT invent or hallucinate skills
3. Normalize skill names (React.js → react, REST APIs → rest api)
4. Classify based on EXACT wording in JD:
   - "Required", "Must have", "Essential", "Need", "Experience with" → required_skills
   - "Nice to have", "Preferred", "Plus", "Bonus", "Familiarity with" → nice_to_have_skills
5. If unclear, default to required_skills
6. Output ONLY valid JSON - no explanations, no markdown

Job Description:
"""
${jobDescription}
"""

Output format:
{
  "required_skills": ["skill1", "skill2"],
  "nice_to_have_skills": ["skill3", "skill4"]
}`;
    
    // Get AI response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('📝 Gemini Pro response:', text);
    
    // Parse AI response
    const extractedSkills = parseGeminiResponse(text);
    
    // Post-processing safety (MANDATORY)
    const processedSkills = postProcessSkills(extractedSkills);
    
    // Cache the result
    cache.set(cacheKey, processedSkills);
    
    console.log('✅ Gemini Pro extraction completed:', {
      requiredCount: processedSkills.required_skills.length,
      niceToHaveCount: processedSkills.nice_to_have_skills.length,
      totalCount: processedSkills.required_skills.length + processedSkills.nice_to_have_skills.length
    });

    return processedSkills;
    
  } catch (error) {
    console.error('❌ Gemini Pro extraction failed:', error.message);
    return fallbackExtraction(jobDescription);
  }
}

/**
 * Parse Gemini AI response with strict JSON validation
 * @param {string} response - AI response text
 * @returns {Object} - Parsed skills
 */
function parseGeminiResponse(response) {
  try {
    // Extract JSON from response (remove markdown if present)
    let jsonText = response.trim();
    
    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Find JSON object
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate structure
    if (!parsed.required_skills || !parsed.nice_to_have_skills) {
      throw new Error('Invalid JSON structure');
    }
    
    // Validate that skills are strings and not empty
    const requiredSkills = Array.isArray(parsed.required_skills) 
      ? parsed.required_skills.filter(skill => typeof skill === 'string' && skill.trim().length > 0)
      : [];
    
    const niceToHaveSkills = Array.isArray(parsed.nice_to_have_skills) 
      ? parsed.nice_to_have_skills.filter(skill => typeof skill === 'string' && skill.trim().length > 0)
      : [];
    
    return {
      required_skills: requiredSkills,
      nice_to_have_skills: niceToHaveSkills
    };
  } catch (error) {
    console.error('❌ Failed to parse Gemini response:', error.message);
    return { required_skills: [], nice_to_have_skills: [] };
  }
}

/**
 * Post-processing safety (MANDATORY)
 * @param {Object} skills - Raw extracted skills
 * @returns {Object} - Processed and validated skills
 */
function postProcessSkills(skills) {
  try {
    // Strict skill validation - no hallucinations
    const allowedSkills = [
      'react', 'vue', 'angular', 'javascript', 'typescript', 'html', 'css', 'scss', 'sass',
      'node.js', 'python', 'java', 'c#', 'php', 'ruby', 'go', 'rust',
      'mongodb', 'postgresql', 'mysql', 'sqlite', 'redis', 'elasticsearch',
      'aws', 'azure', 'google cloud', 'gcp', 'heroku', 'vercel', 'netlify',
      'docker', 'kubernetes', 'jenkins', 'github actions', 'gitlab ci',
      'rest api', 'graphql', 'grpc', 'soap', 'webhook',
      'next.js', 'gatsby', 'nuxt.js', 'express', 'fastify', 'koa',
      'redux', 'zustand', 'mobx', 'context api',
      'tailwind', 'bootstrap', 'material-ui', 'ant design', 'chakra ui',
      'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator',
      'jest', 'mocha', 'cypress', 'playwright', 'selenium',
      'git', 'github', 'gitlab', 'bitbucket', 'svn',
      'react native', 'flutter', 'swift', 'kotlin', 'dart',
      'pandas', 'numpy', 'tensorflow', 'pytorch', 'scikit-learn'
    ];
    
    // Validate and normalize required skills
    const normalizedRequired = [];
    skills.required_skills.forEach(skill => {
      const normalized = normalizeSkillName(skill);
      if (normalized && 
          allowedSkills.includes(normalized) && 
          !normalizedRequired.includes(normalized)) {
        normalizedRequired.push(normalized);
      }
    });
    
    // Validate and normalize nice-to-have skills
    const normalizedNiceToHave = [];
    skills.nice_to_have_skills.forEach(skill => {
      const normalized = normalizeSkillName(skill);
      if (normalized && 
          allowedSkills.includes(normalized) && 
          !normalizedNiceToHave.includes(normalized)) {
        normalizedNiceToHave.push(normalized);
      }
    });
    
    // Remove duplicates
    const uniqueRequired = [...new Set(normalizedRequired)];
    const uniqueNiceToHave = [...new Set(normalizedNiceToHave)];
    
    // Additional validation - remove impossible skills for frontend roles
    const validRequired = uniqueRequired.filter(skill => {
      // Remove clearly wrong skills for frontend roles
      if (skill === 'java' || skill === 'c#' || skill === 'python') {
        console.warn(`⚠️ Filtering out unlikely frontend skill: ${skill}`);
        return false;
      }
      return skill && skill.length > 1 && skill.length < 50;
    });
    
    const validNiceToHave = uniqueNiceToHave.filter(skill => 
      skill && skill.length > 1 && skill.length < 50
    );
    
    console.log('🔍 Post-processing validation:', {
      originalRequired: skills.required_skills.length,
      originalNiceToHave: skills.nice_to_have_skills.length,
      filteredRequired: validRequired.length,
      filteredNiceToHave: validNiceToHave.length
    });
    
    return {
      required_skills: validRequired,
      nice_to_have_skills: validNiceToHave
    };
  } catch (error) {
    console.error('❌ Post-processing failed:', error.message);
    return { required_skills: [], nice_to_have_skills: [] };
  }
}

/**
 * Fallback extraction when Gemini fails
 * @param {string} jobDescription - Job description text
 * @returns {Object} - Basic extracted skills
 */
function fallbackExtraction(jobDescription) {
  console.log('🔄 Using fallback keyword extraction');
  
  // More precise skill mapping with exact matches
  const skillPatterns = [
    { name: 'react', patterns: ['react', 'react.js', 'reactjs'] },
    { name: 'javascript', patterns: ['javascript', 'js', 'es6', 'es6+', 'es7', 'es8'] },
    { name: 'typescript', patterns: ['typescript', 'ts'] },
    { name: 'html', patterns: ['html', 'html5'] },
    { name: 'css', patterns: ['css', 'css3', 'scss', 'sass'] },
    { name: 'next.js', patterns: ['next.js', 'nextjs'] },
    { name: 'vue', patterns: ['vue', 'vue.js', 'vuejs'] },
    { name: 'angular', patterns: ['angular', 'angular.js'] },
    { name: 'node.js', patterns: ['node.js', 'nodejs'] },
    { name: 'python', patterns: ['python'] },
    { name: 'java', patterns: ['java'] },
    { name: 'mongodb', patterns: ['mongodb', 'mongoose'] },
    { name: 'postgresql', patterns: ['postgresql', 'postgres'] },
    { name: 'mysql', patterns: ['mysql'] },
    { name: 'aws', patterns: ['aws', 'amazon web services'] },
    { name: 'docker', patterns: ['docker'] },
    { name: 'kubernetes', patterns: ['kubernetes', 'k8s'] },
    { name: 'git', patterns: ['git', 'github', 'gitlab'] },
    { name: 'rest api', patterns: ['rest api', 'restful', 'rest'] },
    { name: 'graphql', patterns: ['graphql'] },
    { name: 'redux', patterns: ['redux'] },
    { name: 'zustand', patterns: ['zustand'] },
    { name: 'tailwind', patterns: ['tailwind', 'tailwindcss'] },
    { name: 'bootstrap', patterns: ['bootstrap'] },
    { name: 'material-ui', patterns: ['material-ui', 'mui'] },
    { name: 'figma', patterns: ['figma'] },
    { name: 'react native', patterns: ['react native'] }
  ];
  
  const text = jobDescription.toLowerCase();
  const foundSkills = [];
  const foundWithContext = [];
  
  // Extract skills with context
  skillPatterns.forEach(skillObj => {
    skillObj.patterns.forEach(pattern => {
      // Use word boundaries to prevent substring matching
      const regex = new RegExp(`\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        // Get context around the match
        const start = Math.max(0, match.index - 30);
        const end = Math.min(text.length, match.index + match[0].length + 30);
        const context = text.substring(start, end);
        
        foundWithContext.push({
          skill: skillObj.name,
          match: match[0],
          context: context,
          index: match.index
        });
      }
    });
  });
  
  // Remove duplicates and extract unique skills
  const uniqueSkills = [...new Set(foundWithContext.map(item => item.skill))];
  
  // Classify based on section headers and context clues
  const required = [];
  const niceToHave = [];
  
  uniqueSkills.forEach(skill => {
    const skillContexts = foundWithContext.filter(item => item.skill === skill);
    let isRequired = false;
    let isNiceToHave = false;
    
    skillContexts.forEach(contextObj => {
      const context = contextObj.context.toLowerCase();
      
      // Check for section headers first (most reliable)
      if (context.includes('required skills & experience') || 
          context.includes('required skills') ||
          context.includes('requirements:')) {
        isRequired = true;
      }
      
      // Check for nice-to-have section headers
      if (context.includes('nice-to-have skills') ||
          context.includes('nice to have skills') ||
          context.includes('nice-to-have') ||
          context.includes('nice to have') ||
          context.includes('nice-to-have skills:')) {
        isNiceToHave = true;
      }
      
      // Check for required indicators in context
      if (context.includes('strong proficiency in') ||
          context.includes('good knowledge of') ||
          context.includes('experience with') && !context.includes('basic understanding of')) {
        isRequired = true;
      }
      
      // Check for nice-to-have indicators in context
      if (context.includes('familiarity with') ||
          context.includes('basic understanding of') ||
          context.includes('big plus')) {
        isNiceToHave = true;
      }
    });
    
    // Classification logic with priority to section headers
    if (isRequired && !isNiceToHave) {
      required.push(skill);
    } else if (isNiceToHave && !isRequired) {
      niceToHave.push(skill);
    } else {
      // Default to required for ambiguous cases
      required.push(skill);
    }
  });
  
  console.log('🔍 Fallback extraction results:', {
    found: uniqueSkills.length,
    required: required.length,
    niceToHave: niceToHave.length
  });
  
  return {
    required_skills: required,
    nice_to_have_skills: niceToHave
  };
}

/**
 * Generate hash for caching
 * @param {string} text - Text to hash
 * @returns {string} - Hash key
 */
function generateHash(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
}

/**
 * Get empty result structure
 * @returns {Object} - Empty result
 */
function getEmptyResult() {
  return {
    required_skills: [],
    nice_to_have_skills: []
  };
}

/**
 * Clear cache (for testing or memory management)
 */
function clearCache() {
  cache.clear();
  console.log('🗑️ Skill extraction cache cleared');
}

module.exports = {
  extractSkills,
  clearCache,
  initializeGemini
};
