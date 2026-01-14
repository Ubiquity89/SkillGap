/**
 * Job Description Parser - Extract skills from raw job description text
 * Uses deterministic rule-based approach (no AI/ML needed)
 */

const { SKILLS_DICTIONARY, getSkillCategory, normalizeSkillName } = require('./skillsDictionary');

// Controlled skill whitelist - only extract known technologies
const CONTROLLED_SKILLS = [
  // Frontend Technologies
  'react', 'next.js', 'nextjs', 'vue', 'vue.js', 'vuejs', 'angular', 'angular.js',
  'html', 'html5', 'css', 'css3', 'javascript', 'javascript es6', 'es6', 'es7', 'es8',
  'typescript', 'ts', 'jsx', 'tsx', 'sass', 'scss', 'less', 'tailwind', 'tailwind css',
  'bootstrap', 'material-ui', 'mui', 'ant design', 'chakra ui', 'next.js', 'gatsby',
  'webpack', 'vite', 'parcel', 'rollup', 'babel', 'postcss', 'redux', 'zustand',
  
  // Backend Technologies
  'node.js', 'nodejs', 'express', 'express.js', 'koa', 'fastify', 'nestjs', 'loopback',
  'python', 'django', 'flask', 'fastapi', 'ruby', 'ruby on rails', 'rails', 'sinatra',
  'java', 'spring boot', 'spring', 'jsp', 'servlet', 'c#', '.net', 'asp.net', 'php',
  'laravel', 'symfony', 'codeigniter', 'wordpress', 'drupal', 'go', 'golang', 'rust',
  'elixir', 'phoenix', 'scala', 'play framework', 'kotlin', 'ktor',
  
  // Database Technologies
  'mongodb', 'mongoose', 'postgresql', 'postgres', 'mysql', 'mariadb', 'sqlite',
  'redis', 'cassandra', 'couchdb', 'dynamodb', 'firebase', 'supabase', 'neo4j',
  'elasticsearch', 'solr', 'influxdb', 'timescaledb', 'cockroachdb',
  
  // API & Integration
  'rest', 'rest api', 'restful', 'restful api', 'graphql', 'grpc', 'soap', 'webhook',
  'api design', 'api development', 'microservices', 'serverless', 'lambda', 'azure functions',
  'cloud functions', 'openapi', 'swagger', 'postman', 'insomnia',
  
  // Design & UI/UX
  'figma', 'sketch', 'adobe xd', 'xd', 'photoshop', 'illustrator', 'invision', 'zeplin',
  'framer', 'principle', 'figjam', 'miro', 'canva', 'ui design', 'ux design', 'wireframing',
  'prototyping', 'user research', 'user testing', 'design systems', 'component libraries',
  
  // DevOps & Cloud
  'docker', 'kubernetes', 'k8s', 'jenkins', 'gitlab ci', 'github actions', 'circleci',
  'travis ci', 'aws', 'amazon web services', 'azure', 'google cloud', 'gcp', 'heroku',
  'digitalocean', 'netlify', 'vercel', 'terraform', 'ansible', 'puppet', 'chef',
  'ci/cd', 'continuous integration', 'continuous deployment', 'infrastructure as code',
  
  // Testing & Quality
  'jest', 'mocha', 'jasmine', 'karma', 'cypress', 'playwright', 'selenium', 'webdriver',
  'unit testing', 'integration testing', 'e2e testing', 'tdd', 'bdd', 'testing library',
  'enzyme', 'react testing library', 'jest-dom', 'chai', 'sinon',
  
  // Version Control & Tools
  'git', 'github', 'gitlab', 'bitbucket', 'svn', 'mercurial', 'npm', 'yarn', 'pnpm',
  'linux', 'unix', 'bash', 'shell scripting', 'powershell', 'vim', 'vs code', 'intellij',
  'webstorm', 'pycharm', 'android studio', 'xcode',
  
  // Mobile Development
  'react native', 'flutter', 'swift', 'swiftui', 'objective-c', 'kotlin', 'java android',
  'android studio', 'xcode', 'cordova', 'ionic', 'phonegap', 'pwa', 'progressive web apps',
  'expo', 'react navigation', 'flutter navigation',
  
  // Data & Analytics
  'python', 'r', 'sql', 'pandas', 'numpy', 'scipy', 'matplotlib', 'seaborn', 'plotly',
  'tableau', 'power bi', 'looker', 'google analytics', 'mixpanel', 'segment', 'amplitude',
  'data science', 'machine learning', 'ml', 'deep learning', 'tensorflow', 'pytorch',
  'scikit-learn', 'jupyter', 'spark', 'hadoop', 'airflow',
  
  // Process & Methodology
  'agile', 'scrum', 'kanban', 'waterfall', 'lean', 'devops', 'ci/cd', 'tdd', 'bdd',
  'pair programming', 'code review', 'sprint planning', 'retrospective', 'standup',
  'user stories', 'epics', 'backlog grooming', 'estimation', 'velocity'
];

/**
 * Extract skills from job description text
 * @param {string} jobDescription - Raw job description text
 * @returns {Object} - Extracted skills with classification
 */
function extractSkillsFromJobDescription(jobDescription) {
  if (!jobDescription || typeof jobDescription !== 'string') {
    return {
      requiredSkills: [],
      niceToHaveSkills: [],
      allFoundSkills: [],
      summary: {
        totalSkills: 0,
        requiredCount: 0,
        niceToHaveCount: 0,
        categories: {}
      }
    };
  }

  console.log('🔍 === JOB DESCRIPTION EXTRACTION DEBUG ===');
  console.log('Input text:', jobDescription.substring(0, 500));
  console.log('Text length:', jobDescription.length);

  // Normalize text for processing
  const normalizedText = jobDescription.toLowerCase();
  
  // Split into sections for better parsing
  const sections = parseSections(normalizedText);
  console.log('Parsed sections:', sections);
  
  // Find all skills using controlled whitelist
  const foundSkills = new Set();
  const skillContexts = new Map();
  const skillMatches = {}; // Track all matches for debugging
  
  // Check each controlled skill with phrase matching
  CONTROLLED_SKILLS.forEach(skill => {
    const matches = findSkillInText(skill, normalizedText);
    if (matches.length > 0) {
      foundSkills.add(skill);
      skillMatches[skill] = matches;
      
      // Store context for classification
      if (!skillContexts.has(skill)) {
        skillContexts.set(skill, []);
      }
      skillContexts.get(skill).push(...matches);
    }
  });

  console.log('🎯 Skill matching results:');
  console.log('Total skills found:', foundSkills.size);
  console.log('Skill matches:', Object.keys(skillMatches));
  
  // Debug each skill match
  Object.entries(skillMatches).forEach(([skill, matches]) => {
    console.log(`  ${skill}: ${matches.length} matches`);
    matches.forEach((match, i) => {
      console.log(`    Match ${i + 1}: "${match.match}" at index ${match.index}`);
      console.log(`    Context: "${match.context}"`);
    });
  });

  // Detect role from job title
  const detectedRole = detectRole(jobDescription);
  console.log('Detected role:', detectedRole);
  
  // Apply role-aware re-ranking
  const { required: reRankedRequired, niceToHave: reRankedNiceToHave, ambiguous } = reRankSkillsByRole(
    Array.from(foundSkills), 
    detectedRole, 
    sections
  );
  
  console.log('🎯 Role-aware re-ranking:');
  console.log('  Required skills:', reRankedRequired);
  console.log('  Nice-to-have skills:', reRankedNiceToHave);
  console.log('  Ambiguous skills:', ambiguous);
  
  // Generate summary statistics
  const summary = generateSummary(reRankedRequired, reRankedNiceToHave, skillContexts);

  const result = {
    requiredSkills: reRankedRequired.map(skill => ({ name: skill })),
    niceToHaveSkills: reRankedNiceToHave.map(skill => ({ name: skill })),
    allFoundSkills: Array.from(foundSkills).map(skill => ({ name: skill })),
    summary
  };

  console.log('✅ Final extraction result:', {
    requiredCount: result.requiredSkills.length,
    niceToHaveCount: result.niceToHaveSkills.length,
    totalCount: result.requiredSkills.length + result.niceToHaveSkills.length
  });

  // Immediate test to verify parser is working
  console.log('🧪 === IMMEDIATE TEST ===');
  const testResult = extractSkillsFromJobDescription("Frontend Developer with React, JavaScript, CSS, HTML, Figma, REST APIs, Git, TypeScript");
  console.log('Immediate test result:', testResult);

  return result;
}

/**
 * Parse job description into sections for better context
 * @param {string} text - Job description text
 * @returns {Object} - Parsed sections
 */
function parseSections(text) {
  const sections = {
    required: [],
    niceToHave: [],
    responsibilities: [],
    qualifications: [],
    general: []
  };

  // Split by common section headers
  const lines = text.split('\n');
  let currentSection = 'general';
  
  lines.forEach(line => {
    const trimmedLine = line.trim().toLowerCase();
    
    // Check for section headers
    if (trimmedLine.includes('required skills') || 
        trimmedLine.includes('requirements') ||
        trimmedLine.includes('qualifications') ||
        trimmedLine.includes('must have')) {
      currentSection = 'required';
    } else if (trimmedLine.includes('nice to have') ||
               trimmedLine.includes('nice-to-have') ||
               trimmedLine.includes('plus') ||
               trimmedLine.includes('preferred') ||
               trimmedLine.includes('bonus')) {
      currentSection = 'niceToHave';
    } else if (trimmedLine.includes('responsibilities') ||
               trimmedLine.includes('what you\'ll do') ||
               trimmedLine.includes('your role')) {
      currentSection = 'responsibilities';
    }
    
    // Add line to current section
    if (trimmedLine.length > 0) {
      sections[currentSection].push(trimmedLine);
    }
  });

  return sections;
}

/**
 * Find skill in text using phrase matching (not word matching)
 * @param {string} skill - Skill to find
 * @param {string} text - Text to search in
 * @returns {Array} - Array of matches with context
 */
function findSkillInText(skill, text) {
  const matches = [];
  
  // Create regex patterns for different variations
  const patterns = [
    // Exact word boundary match
    new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'),
    // With common variations
    new RegExp(`\\b${skill.replace(/\./g, '')}\\b`, 'gi'),
    // With common separators
    new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'),
    // More permissive matching for compound skills
    new RegExp(skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      // Get surrounding context (up to 100 characters)
      const start = Math.max(0, match.index - 50);
      const end = Math.min(text.length, match.index + skill.length + 50);
      const context = text.substring(start, end).trim();
      
      matches.push({
        match: match[0],
        context: context,
        index: match.index
      });
    }
  });
  
  return matches;
}

/**
 * Classify skills as required or nice-to-have based on sections and context
 * @param {string[]} skills - Array of found skills
 * @param {Map} skillContexts - Context information for each skill
 * @param {Object} sections - Parsed sections
 * @returns {Object} - Classified skills
 */
function classifySkillsByContext(skills, skillContexts, sections) {
  const requiredSkills = new Set();
  const niceToHaveSkills = new Set();
  
  // Frontend role bias - promote core frontend skills
  const frontendRoles = ['frontend', 'ui', 'ux', 'web', 'front-end'];
  const isFrontendRole = frontendRoles.some(role => 
    sections.general.some(line => line.includes(role))
  );
  
  const coreFrontendSkills = ['react', 'html', 'css', 'javascript', 'typescript'];
  
  skills.forEach(skill => {
    const contexts = skillContexts.get(skill) || [];
    let isRequired = false;
    let isNiceToHave = false;
    
    // Analyze each context
    contexts.forEach(context => {
      const sentence = context.context.toLowerCase();
      
      // Check for required indicators
      if (sentence.includes('required') || sentence.includes('must have') || sentence.includes('must') ||
          sentence.includes('need') || sentence.includes('essential') || sentence.includes('necessary')) {
        isRequired = true;
      }
      
      // Check for nice-to-have indicators
      if (sentence.includes('nice to have') || sentence.includes('nice-to-have') || sentence.includes('plus') ||
          sentence.includes('preferred') || sentence.includes('advantage') || sentence.includes('bonus')) {
        isNiceToHave = true;
      }
      
      // Section-based classification
      if (sections.required.some(line => sentence.includes(line))) {
        isRequired = true;
      }
      
      if (sections.niceToHave.some(line => sentence.includes(line))) {
        isNiceToHave = true;
      }
    });
    
    // Apply classification rules
    if (isRequired && !isNiceToHave) {
      requiredSkills.add(skill);
    } else if (isNiceToHave && !isRequired) {
      niceToHaveSkills.add(skill);
    } else if (isRequired && isNiceToHave) {
      // If both indicators exist, prioritize required
      requiredSkills.add(skill);
    } else {
      // Frontend role bias - promote core frontend skills
      if (isFrontendRole && coreFrontendSkills.includes(skill)) {
        requiredSkills.add(skill);
      } else {
        // Default to required for ambiguous cases
        requiredSkills.add(skill);
      }
    }
  });
  
  return {
    requiredSkills: Array.from(requiredSkills),
    niceToHaveSkills: Array.from(niceToHaveSkills)
  };
}

/**
 * Generate summary statistics for the extracted skills
 * @param {string[]} requiredSkills - Required skills array
 * @param {string[]} niceToHaveSkills - Nice-to-have skills array
 * @param {Map} skillContexts - Context information for each skill
 * @returns {Object} - Summary statistics
 */
function generateSummary(requiredSkills, niceToHaveSkills, skillContexts) {
  const allSkills = [...requiredSkills, ...niceToHaveSkills];
  const categories = {};
  
  // Count skills by category
  allSkills.forEach(skill => {
    const category = getSkillCategory(skill);
    categories[category] = (categories[category] || 0) + 1;
  });
  
  return {
    totalSkills: allSkills.length,
    requiredCount: requiredSkills.length,
    niceToHaveCount: niceToHaveSkills.length,
    categories,
    confidence: calculateConfidence(allSkills.length, skillContexts)
  };
}

/**
 * Calculate confidence score for the extraction
 * @param {number} skillCount - Number of skills found
 * @param {Map} skillContexts - Context information
 * @returns {number} - Confidence score (0-100)
 */
function calculateConfidence(skillCount, skillContexts) {
  if (skillCount === 0) return 0;
  
  // Higher confidence if we found more skills and have good context
  const contextQuality = Array.from(skillContexts.values()).reduce((sum, contexts) => {
    return sum + contexts.length;
  }, 0);
  
  const avgContextsPerSkill = contextQuality / skillCount;
  const skillScore = Math.min(skillCount / 10, 1); // Cap at 10 skills
  const contextScore = Math.min(avgContextsPerSkill / 2, 1); // Cap at 2 contexts per skill
  
  return Math.round((skillScore * 0.6 + contextScore * 0.4) * 100);
}

/**
 * Validate and clean extracted skills
 * @param {Object} extractionResult - Result from extractSkillsFromJobDescription
 * @returns {Object} - Validated and cleaned result
 */
function validateExtraction(extractionResult) {
  const { requiredSkills, niceToHaveSkills, allFoundSkills, summary } = extractionResult;
  
  // Remove duplicates between required and nice-to-have
  const requiredNames = new Set(requiredSkills.map(s => s.name.toLowerCase()));
  const cleanNiceToHave = niceToHaveSkills.filter(s => !requiredNames.has(s.name.toLowerCase()));
  
  // Ensure we have at least some required skills
  const finalRequired = requiredSkills.length > 0 ? requiredSkills : allFoundSkills.slice(0, 5);
  const finalNiceToHave = cleanNiceToHave;
  
  return {
    requiredSkills: finalRequired,
    niceToHaveSkills: finalNiceToHave,
    allFoundSkills: allFoundSkills,
    summary: {
      ...summary,
      totalSkills: finalRequired.length + finalNiceToHave.length,
      requiredCount: finalRequired.length,
      niceToHaveCount: finalNiceToHave.length
    }
  };
}

module.exports = {
  extractSkillsFromJobDescription,
  validateExtraction,
  classifySkillsByContext,
  generateSummary,
  // Test function for debugging
  testParser: (jobDescription) => {
    console.log('🧪 === PARSER TEST ===');
    const result = extractSkillsFromJobDescription(jobDescription);
    console.log('Test result:', {
      requiredCount: result.requiredSkills.length,
      niceToHaveCount: result.niceToHaveSkills.length,
      totalCount: result.requiredSkills.length + result.niceToHaveSkills.length
    });
    return result;
  }
};
