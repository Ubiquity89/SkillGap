// Skill Gap Priority System
// Based on skill importance, category relevance, and job role

// Master skill metadata with weights, categories, and explanations
const SKILL_META = {
  // Frontend Core (Weight: 3 - Must-have)
  react: { weight: 3, category: "frontend", reason: "Core React library for building modern web applications" },
  javascript: { weight: 3, category: "frontend", reason: "Fundamental programming language for web development" },
  typescript: { weight: 3, category: "frontend", reason: "Type-safe JavaScript that improves code quality and maintainability" },
  html: { weight: 3, category: "frontend", reason: "Essential markup language for web page structure" },
  css: { weight: 3, category: "frontend", reason: "Styling language for visual presentation of web pages" },
  "css3": { weight: 3, category: "frontend", reason: "Modern CSS features for advanced styling and animations" },
  "html5": { weight: 3, category: "frontend", reason: "Modern HTML features for semantic markup and multimedia" },
  vue: { weight: 3, category: "frontend", reason: "Progressive JavaScript framework for building user interfaces" },
  angular: { weight: 3, category: "frontend", reason: "Comprehensive framework for large-scale enterprise applications" },
  "vue.js": { weight: 3, category: "frontend", reason: "Progressive JavaScript framework for building user interfaces" },
  "angular.js": { weight: 3, category: "frontend", reason: "Comprehensive framework for large-scale enterprise applications" },
  "react.js": { weight: 3, category: "frontend", reason: "Core React library for building modern web applications" },

  // Backend Core (Weight: 3 - Must-have)
  "node.js": { weight: 3, category: "backend", reason: "JavaScript runtime for server-side development" },
  node: { weight: 3, category: "backend", reason: "JavaScript runtime for server-side development" },
  express: { weight: 3, category: "backend", reason: "Minimalist web framework for building APIs and web applications" },
  "express.js": { weight: 3, category: "backend", reason: "Minimalist web framework for building APIs and web applications" },
  mongodb: { weight: 3, category: "backend", reason: "NoSQL database for flexible, scalable data storage" },
  mysql: { weight: 3, category: "backend", reason: "Popular relational database for structured data management" },
  postgresql: { weight: 3, category: "backend", reason: "Advanced relational database with robust features and performance" },
  "postgres": { weight: 3, category: "backend", reason: "Advanced relational database with robust features and performance" },
  python: { weight: 3, category: "backend", reason: "Versatile programming language for backend development and data processing" },
  java: { weight: 3, category: "backend", reason: "Enterprise-grade programming language for large-scale applications" },
  "c#": { weight: 3, category: "backend", reason: "Microsoft's language for enterprise applications and .NET development" },
  php: { weight: 3, category: "backend", reason: "Server-side scripting language for web development" },
  go: { weight: 3, category: "backend", reason: "Efficient programming language for concurrent and distributed systems" },
  rust: { weight: 3, category: "backend", reason: "Systems programming language focused on safety and performance" },

  // Database (Weight: 3 - Must-have)
  sql: { weight: 3, category: "database", reason: "Standard language for managing relational databases" },
  nosql: { weight: 3, category: "database", reason: "Database systems for flexible, non-relational data storage" },
  redis: { weight: 3, category: "database", reason: "In-memory data structure store for caching and session management" },
  firebase: { weight: 3, category: "database", reason: "Cloud-based NoSQL database with real-time synchronization" },

  // APIs & Architecture (Weight: 3 - Must-have)
  "rest apis": { weight: 3, category: "api", reason: "Standard architectural style for web service design" },
  "rest api": { weight: 3, category: "api", reason: "Standard architectural style for web service design" },
  graphql: { weight: 3, category: "api", reason: "Query language for APIs that provides efficient data fetching" },
  grpc: { weight: 3, category: "api", reason: "High-performance RPC framework for microservices communication" },
  microservices: { weight: 3, category: "api", reason: "Architectural pattern for building scalable, independent services" },

  // Design & UI (Weight: 2 - Important)
  figma: { weight: 2, category: "design", reason: "Collaborative design tool for UI/UX prototyping and design handoff" },
  sketch: { weight: 2, category: "design", reason: "Digital design platform for UI/UX design and prototyping" },
  "adobe xd": { weight: 2, category: "design", reason: "Adobe's design tool for UX/UI design and prototyping" },
  photoshop: { weight: 2, category: "design", reason: "Image editing software for creating and manipulating visual assets" },
  illustrator: { weight: 2, category: "design", reason: "Vector graphics editor for creating logos, icons, and illustrations" },
  "material design": { weight: 2, category: "design", reason: "Google's design system for creating intuitive user interfaces" },
  "tailwind css": { weight: 2, category: "design", reason: "Utility-first CSS framework for rapid UI development" },
  bootstrap: { weight: 2, category: "design", reason: "Popular CSS framework for responsive web design" },
  "material-ui": { weight: 2, category: "design", reason: "React component library implementing Google's Material Design" },
  "ant design": { weight: 2, category: "design", reason: "Enterprise-class UI design language for React applications" },

  // Testing (Weight: 2 - Important)
  jest: { weight: 2, category: "testing", reason: "JavaScript testing framework for unit and integration testing" },
  mocha: { weight: 2, category: "testing", reason: "Flexible JavaScript testing framework for Node.js and browser" },
  jasmine: { weight: 2, category: "testing", reason: "Behavior-driven development framework for JavaScript testing" },
  karma: { weight: 2, category: "testing", reason: "Test runner for executing JavaScript unit tests in multiple browsers" },
  cypress: { weight: 2, category: "testing", reason: "End-to-end testing framework for modern web applications" },
  "selenium": { weight: 2, category: "testing", reason: "Browser automation tool for web application testing" },
  "unit testing": { weight: 2, category: "testing", reason: "Testing methodology for verifying individual components" },
  "integration testing": { weight: 2, category: "testing", reason: "Testing methodology for verifying component interactions" },

  // DevOps & Tooling (Weight: 1 - Nice-to-have)
  git: { weight: 1, category: "tooling", reason: "Version control system for tracking code changes and collaboration" },
  github: { weight: 1, category: "tooling", reason: "Platform for hosting Git repositories and collaborative development" },
  gitlab: { weight: 1, category: "tooling", reason: "Git repository management platform with DevOps features" },
  docker: { weight: 1, category: "tooling", reason: "Container platform for application deployment and environment consistency" },
  kubernetes: { weight: 1, category: "tooling", reason: "Container orchestration platform for managing containerized applications" },
  "k8s": { weight: 1, category: "tooling", reason: "Container orchestration platform for managing containerized applications" },
  "ci/cd": { weight: 1, category: "tooling", reason: "Automated pipeline for continuous integration and deployment" },
  jenkins: { weight: 1, category: "tooling", reason: "Automation server for continuous integration and delivery" },
  "github actions": { weight: 1, category: "tooling", reason: "CI/CD platform integrated with GitHub for workflow automation" },
  webpack: { weight: 1, category: "tooling", reason: "Module bundler for JavaScript applications and asset optimization" },
  vite: { weight: 1, category: "tooling", reason: "Fast build tool and development server for modern web applications" },
  babel: { weight: 1, category: "tooling", reason: "JavaScript compiler for transforming modern JavaScript to compatible versions" },
  eslint: { weight: 1, category: "tooling", reason: "JavaScript linting tool for code quality and consistency" },
  prettier: { weight: 1, category: "tooling", reason: "Code formatter for maintaining consistent code style" },

  // Cloud & Infrastructure (Weight: 2 - Important)
  aws: { weight: 2, category: "cloud", reason: "Amazon's cloud computing platform for scalable infrastructure" },
  azure: { weight: 2, category: "cloud", reason: "Microsoft's cloud computing platform for enterprise solutions" },
  "google cloud": { weight: 2, category: "cloud", reason: "Google's cloud platform for data analytics and machine learning" },
  gcp: { weight: 2, category: "cloud", reason: "Google's cloud platform for data analytics and machine learning" },
  "firebase": { weight: 2, category: "cloud", reason: "Google's mobile and web application development platform" },
  vercel: { weight: 2, category: "cloud", reason: "Platform for deploying and hosting modern web applications" },
  heroku: { weight: 2, category: "cloud", reason: "Cloud platform for simplified application deployment and management" },
  netlify: { weight: 2, category: "cloud", reason: "Platform for deploying static websites and serverless functions" },

  // Mobile (Weight: 2 - Important)
  "react native": { weight: 2, category: "mobile", reason: "Framework for building native mobile apps using React" },
  flutter: { weight: 2, category: "mobile", reason: "Google's UI toolkit for building native mobile applications" },
  swift: { weight: 2, category: "mobile", reason: "Apple's programming language for iOS application development" },
  kotlin: { weight: 2, category: "mobile", reason: "Modern programming language for Android application development" },
  "ios development": { weight: 2, category: "mobile", reason: "Apple's platform for developing iPhone and iPad applications" },
  "android development": { weight: 2, category: "mobile", reason: "Google's platform for developing Android applications" },

  // Data & Analytics (Weight: 2 - Important)
  "data science": { weight: 2, category: "data", reason: "Field for extracting insights from structured and unstructured data" },
  "machine learning": { weight: 2, category: "data", reason: "Technology for building predictive models and automated systems" },
  "artificial intelligence": { weight: 2, category: "data", reason: "Technology for creating intelligent systems that can learn and adapt" },
  "big data": { weight: 2, category: "data", reason: "Technologies for processing and analyzing large volumes of data" },
  pandas: { weight: 2, category: "data", reason: "Python library for data manipulation and analysis" },
  numpy: { weight: 2, category: "data", reason: "Python library for numerical computing and scientific computing" },
  tensorflow: { weight: 2, category: "data", reason: "Open-source machine learning framework for deep learning applications" },
  pytorch: { weight: 2, category: "data", reason: "Open-source machine learning framework for dynamic neural networks" },

  // Other important skills
  "responsive design": { weight: 2, category: "frontend", reason: "Design approach for creating applications that work on all devices" },
  accessibility: { weight: 2, category: "frontend", reason: "Design practice for making applications usable by people with disabilities" },
  "web performance": { weight: 2, category: "frontend", reason: "Optimization techniques for improving website speed and user experience" },
  seo: { weight: 1, category: "frontend", reason: "Techniques for improving website visibility in search engine results" },
  "agile": { weight: 1, category: "process", reason: "Iterative project management methodology for software development" },
  scrum: { weight: 1, category: "process", reason: "Agile framework for managing complex software development projects" },
  "project management": { weight: 1, category: "process", reason: "Practice of planning, executing, and closing projects effectively" }
};

// Role relevance mapping - how important each category is for different roles
const ROLE_RELEVANCE = {
  "Frontend Developer": {
    frontend: 2,
    design: 2,
    testing: 1,
    tooling: 1,
    backend: 0,
    database: 0,
    api: 1,
    cloud: 1,
    mobile: 0,
    data: 0,
    process: 1
  },
  "Backend Developer": {
    backend: 2,
    database: 2,
    api: 2,
    cloud: 1,
    tooling: 1,
    testing: 1,
    frontend: 0,
    design: 0,
    mobile: 0,
    data: 1,
    process: 1
  },
  "Full Stack Developer": {
    frontend: 2,
    backend: 2,
    database: 1,
    api: 2,
    tooling: 1,
    testing: 1,
    cloud: 1,
    design: 1,
    mobile: 0,
    data: 0,
    process: 1
  },
  "UI Developer": {
    frontend: 2,
    design: 2,
    testing: 1,
    tooling: 1,
    backend: 0,
    database: 0,
    api: 0,
    cloud: 0,
    mobile: 0,
    data: 0,
    process: 1
  },
  "UX Developer": {
    frontend: 2,
    design: 2,
    testing: 1,
    tooling: 1,
    backend: 0,
    database: 0,
    api: 0,
    cloud: 0,
    mobile: 0,
    data: 0,
    process: 1
  },
  "MERN Stack Developer": {
    frontend: 2,
    backend: 2,
    database: 1,
    api: 2,
    tooling: 1,
    testing: 1,
    cloud: 1,
    design: 0,
    mobile: 0,
    data: 0,
    process: 1
  },
  "React Developer": {
    frontend: 2,
    design: 1,
    testing: 1,
    tooling: 1,
    backend: 1,
    database: 0,
    api: 1,
    cloud: 1,
    mobile: 0,
    data: 0,
    process: 1
  },
  "Node.js Developer": {
    backend: 2,
    database: 2,
    api: 2,
    tooling: 1,
    testing: 1,
    cloud: 1,
    frontend: 0,
    design: 0,
    mobile: 0,
    data: 1,
    process: 1
  }
};

// Default role relevance for unknown roles
const DEFAULT_ROLE_RELEVANCE = {
  frontend: 1,
  backend: 1,
  database: 1,
  api: 1,
  tooling: 1,
  testing: 1,
  design: 1,
  cloud: 1,
  mobile: 1,
  data: 1,
  process: 1
};

/**
 * Compute skill gap priority for missing skills
 * @param {string[]} missingSkills - Array of missing skill names
 * @param {string} jobTitle - Job title to determine role relevance
 * @param {string[]} resumeSkills - Array of resume skills for profile analysis
 * @returns {Object} - Skill gap priority with high, medium, low categories
 */
function computeSkillGapPriority(missingSkills, jobTitle, resumeSkills = []) {
  // Determine role from job title
  const role = determineRole(jobTitle);
  const relevance = ROLE_RELEVANCE[role] || DEFAULT_ROLE_RELEVANCE;

  // Calculate priority scores for missing skills
  const skillScores = missingSkills
    .map(skill => {
      const normalizedSkill = skill.toLowerCase().trim();
      const meta = SKILL_META[normalizedSkill];
      
      if (!meta) {
        // Unknown skill - give it low priority
        return {
          skill: skill,
          score: 1,
          category: "unknown",
          reason: "Additional skill that may complement your profile",
          impact: 1
        };
      }

      const categoryRelevance = relevance[meta.category] || 0;
      const totalScore = meta.weight + categoryRelevance;
      
      // Calculate impact on match score (higher weight = higher impact)
      const impact = Math.round((meta.weight / 3) * 20); // Max 20% impact per skill

      return {
        skill: skill,
        score: totalScore,
        category: meta.category,
        weight: meta.weight,
        relevance: categoryRelevance,
        reason: meta.reason,
        impact: impact
      };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  // Categorize by priority
  const priority = {
    high: [],
    medium: [],
    low: []
  };

  skillScores.forEach(item => {
    const priorityItem = {
      name: item.skill,
      reason: item.reason,
      impact: `+${item.impact}% match score`
    };
    
    if (item.score >= 4) {
      priority.high.push(priorityItem);
    } else if (item.score >= 3) {
      priority.medium.push(priorityItem);
    } else {
      priority.low.push(priorityItem);
    }
  });

  // Detect role mismatch
  const resumeProfile = analyzeResumeProfile(resumeSkills);
  const roleMismatch = detectRoleMismatch(resumeProfile, role);

  return {
    priority,
    detailed: skillScores,
    role: role,
    roleMismatch: roleMismatch,
    nextBestAction: generateNextBestAction(priority.high, roleMismatch)
  };
}

/**
 * Determine role from job title
 * @param {string} jobTitle - Job title
 * @returns {string} - Determined role
 */
function determineRole(jobTitle) {
  const title = jobTitle.toLowerCase();
  
  if (title.includes('mern')) return 'MERN Stack Developer';
  if (title.includes('react')) return 'React Developer';
  if (title.includes('node') || title.includes('node.js')) return 'Node.js Developer';
  if (title.includes('frontend')) return 'Frontend Developer';
  if (title.includes('backend')) return 'Backend Developer';
  if (title.includes('full stack') || title.includes('fullstack')) return 'Full Stack Developer';
  if (title.includes('ui')) return 'UI Developer';
  if (title.includes('ux')) return 'UX Developer';
  
  // Default to Full Stack for generic titles
  return 'Full Stack Developer';
}

/**
 * Analyze resume profile based on skills
 * @param {string[]} resumeSkills - Array of resume skills
 * @returns {Object} - Resume profile analysis
 */
function analyzeResumeProfile(resumeSkills) {
  const skillCounts = {
    frontend: 0,
    backend: 0,
    design: 0,
    database: 0,
    api: 0,
    testing: 0,
    tooling: 0,
    cloud: 0,
    mobile: 0,
    data: 0,
    process: 0
  };

  resumeSkills.forEach(skill => {
    const normalizedSkill = skill.toLowerCase().trim();
    const meta = SKILL_META[normalizedSkill];
    if (meta) {
      skillCounts[meta.category]++;
    }
  });

  // Determine primary profile
  const totalSkills = Object.values(skillCounts).reduce((a, b) => a + b, 0);
  const profilePercentages = {};
  
  Object.keys(skillCounts).forEach(category => {
    profilePercentages[category] = totalSkills > 0 ? Math.round((skillCounts[category] / totalSkills) * 100) : 0;
  });

  // Determine dominant profile
  let dominantProfile = "Generalist";
  let maxPercentage = 0;
  
  Object.entries(profilePercentages).forEach(([category, percentage]) => {
    if (percentage > maxPercentage && percentage >= 30) {
      maxPercentage = percentage;
      dominantProfile = category.charAt(0).toUpperCase() + category.slice(1);
    }
  });

  return {
    skillCounts,
    profilePercentages,
    dominantProfile,
    totalSkills
  };
}

/**
 * Detect role mismatch between resume profile and job role
 * @param {Object} resumeProfile - Resume profile analysis
 * @param {string} jobRole - Target job role
 * @returns {Object|null} - Role mismatch information or null
 */
function detectRoleMismatch(resumeProfile, jobRole) {
  const roleRequirements = ROLE_RELEVANCE[jobRole];
  if (!roleRequirements) return null;

  // Check if dominant profile matches job requirements
  const dominantCategory = resumeProfile.dominantProfile.toLowerCase();
  const roleRelevance = roleRequirements[dominantCategory] || 0;

  // If resume profile is not relevant to job role
  if (roleRelevance === 0 && resumeProfile.totalSkills > 0) {
    return {
      detected: true,
      resumeProfile: resumeProfile.dominantProfile,
      targetRole: jobRole,
      message: `Your resume is ${resumeProfile.dominantProfile}-focused, but the job is ${jobRole.replace(' Developer', '')}-centric. Consider tailoring your resume.`
    };
  }

  // Check if there's a significant mismatch in skill distribution
  const relevantCategories = Object.keys(roleRequirements).filter(cat => roleRequirements[cat] > 0);
  const relevantSkills = relevantCategories.reduce((sum, cat) => sum + resumeProfile.skillCounts[cat], 0);
  const relevantPercentage = resumeProfile.totalSkills > 0 ? (relevantSkills / resumeProfile.totalSkills) * 100 : 0;

  if (relevantPercentage < 40 && resumeProfile.totalSkills > 5) {
    return {
      detected: true,
      resumeProfile: resumeProfile.dominantProfile,
      targetRole: jobRole,
      message: `Only ${Math.round(relevantPercentage)}% of your skills align with ${jobRole} requirements. Consider highlighting relevant experience.`
    };
  }

  return null;
}

/**
 * Generate next best action based on priorities and role mismatch
 * @param {Array} highPrioritySkills - High priority missing skills
 * @param {Object|null} roleMismatch - Role mismatch information
 * @returns {string} - Next best action recommendation
 */
function generateNextBestAction(highPrioritySkills, roleMismatch) {
  if (roleMismatch && roleMismatch.detected) {
    if (roleMismatch.resumeProfile === "Backend" && roleMismatch.targetRole.includes("UI")) {
      return "Move backend skills lower and highlight any UI/UX projects or design experience";
    } else if (roleMismatch.resumeProfile === "Frontend" && roleMismatch.targetRole.includes("Backend")) {
      return "Emphasize any full-stack projects and backend-related experience";
    } else {
      return "Tailor your resume to highlight relevant experience for this role";
    }
  }

  if (highPrioritySkills.length > 0) {
    const topSkill = highPrioritySkills[0];
    if (topSkill.name.toLowerCase().includes('figma') || topSkill.name.toLowerCase().includes('adobe')) {
      return `Add ${topSkill.name} to skills section and mention any design projects`;
    } else if (topSkill.name.toLowerCase().includes('react') || topSkill.name.toLowerCase().includes('vue')) {
      return `Highlight ${topSkill.name} projects prominently in experience section`;
    } else {
      return `Add ${topSkill.name} to skills section and relevant project experience`;
    }
  }

  return "Focus on quantifying your achievements and project impact";
}

module.exports = {
  computeSkillGapPriority,
  determineRole,
  SKILL_META,
  ROLE_RELEVANCE
};
