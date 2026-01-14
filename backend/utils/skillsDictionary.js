/**
 * Comprehensive Skills Dictionary for Job Description Parsing
 * Organized by categories with common variations
 */

const SKILLS_DICTIONARY = {
  // Frontend Technologies
  frontend: [
    'react', 'react.js', 'reactjs', 'vue', 'vue.js', 'vuejs', 'angular', 'angular.js', 
    'html', 'html5', 'css', 'css3', 'javascript', 'javascript es6', 'es6', 'es7', 'es8',
    'typescript', 'ts', 'jsx', 'tsx', 'sass', 'scss', 'less', 'tailwind', 'tailwind css',
    'bootstrap', 'material-ui', 'mui', 'ant design', 'chakra ui', 'next.js', 'nextjs',
    'gatsby', 'webpack', 'vite', 'parcel', 'rollup', 'babel', 'postcss'
  ],

  // Backend Technologies
  backend: [
    'node.js', 'nodejs', 'express', 'express.js', 'koa', 'fastify', 'nestjs', 'loopback',
    'python', 'django', 'flask', 'fastapi', 'ruby', 'ruby on rails', 'rails', 'sinatra',
    'java', 'spring boot', 'spring', 'jsp', 'servlet', 'c#', '.net', 'asp.net', 'php',
    'laravel', 'symfony', 'codeigniter', 'wordpress', 'drupal', 'go', 'golang', 'rust',
    'elixir', 'phoenix', 'scala', 'play framework', 'kotlin', 'ktor'
  ],

  // Database Technologies
  database: [
    'mongodb', 'mongoose', 'postgresql', 'postgres', 'mysql', 'mariadb', 'sqlite',
    'redis', 'cassandra', 'couchdb', 'dynamodb', 'firebase', 'supabase', 'neo4j',
    'elasticsearch', 'solr', 'influxdb', 'timescaledb', 'cockroachdb'
  ],

  // API & Integration
  api: [
    'rest', 'rest api', 'restful', 'restful api', 'graphql', 'grpc', 'soap', 'webhook',
    'api design', 'api development', 'microservices', 'serverless', 'lambda', 'azure functions',
    'cloud functions', 'openapi', 'swagger', 'postman', 'insomnia'
  ],

  // Design & UI/UX
  design: [
    'figma', 'sketch', 'adobe xd', 'xd', 'photoshop', 'illustrator', 'invision', 'zeplin',
    'framer', 'principle', 'figjam', 'miro', 'canva', 'ui design', 'ux design', 'wireframing',
    'prototyping', 'user research', 'user testing', 'design systems', 'component libraries'
  ],

  // DevOps & Cloud
  devops: [
    'docker', 'kubernetes', 'k8s', 'jenkins', 'gitlab ci', 'github actions', 'circleci',
    'travis ci', 'aws', 'amazon web services', 'azure', 'google cloud', 'gcp', 'heroku',
    'digitalocean', 'netlify', 'vercel', 'terraform', 'ansible', 'puppet', 'chef',
    'ci/cd', 'continuous integration', 'continuous deployment', 'infrastructure as code'
  ],

  // Testing & Quality
  testing: [
    'jest', 'mocha', 'jasmine', 'karma', 'cypress', 'playwright', 'selenium', 'webdriver',
    'unit testing', 'integration testing', 'e2e testing', 'tdd', 'bdd', 'testing library',
    'enzyme', 'react testing library', 'jest-dom', 'chai', 'sinon'
  ],

  // Version Control & Tools
  tooling: [
    'git', 'github', 'gitlab', 'bitbucket', 'svn', 'mercurial', 'npm', 'yarn', 'pnpm',
    'linux', 'unix', 'bash', 'shell scripting', 'powershell', 'vim', 'vs code', 'intellij',
    'webstorm', 'pycharm', 'android studio', 'xcode'
  ],

  // Mobile Development
  mobile: [
    'react native', 'flutter', 'swift', 'swiftui', 'objective-c', 'kotlin', 'java android',
    'android studio', 'xcode', 'cordova', 'ionic', 'phonegap', 'pwa', 'progressive web apps',
    'expo', 'react navigation', 'flutter navigation'
  ],

  // Data & Analytics
  data: [
    'python', 'r', 'sql', 'pandas', 'numpy', 'scipy', 'matplotlib', 'seaborn', 'plotly',
    'tableau', 'power bi', 'looker', 'google analytics', 'mixpanel', 'segment', 'amplitude',
    'data science', 'machine learning', 'ml', 'deep learning', 'tensorflow', 'pytorch',
    'scikit-learn', 'jupyter', 'spark', 'hadoop', 'airflow'
  ],

  // Process & Methodology
  process: [
    'agile', 'scrum', 'kanban', 'waterfall', 'lean', 'devops', 'ci/cd', 'tdd', 'bdd',
    'pair programming', 'code review', 'sprint planning', 'retrospective', 'standup',
    'user stories', 'epics', 'backlog grooming', 'estimation', 'velocity'
  ]
};

/**
 * Flatten all skills into a single array for easy searching
 */
const ALL_SKILLS = Object.values(SKILLS_DICTIONARY).flat();

/**
 * Get category for a specific skill
 */
function getSkillCategory(skill) {
  const normalizedSkill = skill.toLowerCase().trim();
  for (const [category, skills] of Object.entries(SKILLS_DICTIONARY)) {
    if (skills.includes(normalizedSkill)) {
      return category;
    }
  }
  return 'unknown';
}

/**
 * Normalize skill name to canonical form
 */
function normalizeSkillName(skill) {
  const normalizedSkill = skill.toLowerCase().trim();
  
  // Exact matching only - no substring bugs
  const exactMatches = {
    'react.js': 'react',
    'reactjs': 'react',
    'vue.js': 'vue',
    'vuejs': 'vue',
    'angular.js': 'angular',
    'node.js': 'node.js',
    'nodejs': 'node.js',
    'express.js': 'express',
    'typescript': 'typescript',
    'ts': 'typescript',
    'javascript': 'javascript',
    'js': 'javascript',
    'html5': 'html',
    'css3': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'tailwind css': 'tailwind',
    'tailwindcss': 'tailwind',
    'bootstrap': 'bootstrap',
    'material-ui': 'material-ui',
    'mui': 'material-ui',
    'ant design': 'ant design',
    'chakra ui': 'chakra ui',
    'next.js': 'next.js',
    'nextjs': 'next.js',
    'gatsby': 'gatsby',
    'webpack': 'webpack',
    'vite': 'vite',
    'parcel': 'parcel',
    'rollup': 'rollup',
    'babel': 'babel',
    'postcss': 'postcss',
    'redux': 'redux',
    'zustand': 'zustand',
    'mobx': 'mobx',
    'context api': 'context api',
    'jsx': 'jsx',
    'tsx': 'tsx',
    'mongodb': 'mongodb',
    'mongoose': 'mongodb',
    'postgresql': 'postgresql',
    'postgres': 'postgresql',
    'mysql': 'mysql',
    'mariadb': 'mysql',
    'sqlite': 'sqlite',
    'redis': 'redis',
    'cassandra': 'cassandra',
    'couchdb': 'couchdb',
    'dynamodb': 'dynamodb',
    'firebase': 'firebase',
    'supabase': 'firebase',
    'neo4j': 'neo4j',
    'elasticsearch': 'elasticsearch',
    'solr': 'solr',
    'influxdb': 'influxdb',
    'timescaledb': 'timescaledb',
    'cockroachdb': 'cockroachdb',
    'rest': 'rest api',
    'rest api': 'rest api',
    'restful': 'rest api',
    'restful api': 'rest api',
    'graphql': 'graphql',
    'grpc': 'grpc',
    'soap': 'soap',
    'webhook': 'webhook',
    'api design': 'api design',
    'api development': 'api development',
    'microservices': 'microservices',
    'serverless': 'serverless',
    'lambda': 'serverless',
    'azure functions': 'serverless',
    'cloud functions': 'serverless',
    'openapi': 'api design',
    'swagger': 'api design',
    'postman': 'postman',
    'insomnia': 'postman',
    'figma': 'figma',
    'sketch': 'sketch',
    'adobe xd': 'adobe xd',
    'xd': 'adobe xd',
    'photoshop': 'photoshop',
    'illustrator': 'illustrator',
    'invision': 'invision',
    'zeplin': 'zeplin',
    'framer': 'framer',
    'principle': 'principle',
    'figjam': 'figjam',
    'miro': 'miro',
    'canva': 'canva',
    'ui design': 'ui design',
    'ux design': 'ux design',
    'wireframing': 'wireframing',
    'prototyping': 'prototyping',
    'user research': 'user research',
    'user testing': 'user testing',
    'design systems': 'design systems',
    'component libraries': 'component libraries',
    'docker': 'docker',
    'kubernetes': 'kubernetes',
    'k8s': 'kubernetes',
    'jenkins': 'jenkins',
    'gitlab ci': 'gitlab ci',
    'github actions': 'github actions',
    'circleci': 'circleci',
    'travis ci': 'travis ci',
    'aws': 'aws',
    'amazon web services': 'aws',
    'azure': 'azure',
    'google cloud': 'google cloud',
    'gcp': 'google cloud',
    'heroku': 'heroku',
    'digitalocean': 'digitalocean',
    'netlify': 'netlify',
    'vercel': 'vercel',
    'terraform': 'terraform',
    'ansible': 'ansible',
    'puppet': 'puppet',
    'chef': 'chef',
    'ci/cd': 'ci/cd',
    'continuous integration': 'ci/cd',
    'continuous deployment': 'ci/cd',
    'infrastructure as code': 'infrastructure as code',
    'jest': 'jest',
    'mocha': 'jest',
    'jasmine': 'jest',
    'karma': 'jest',
    'cypress': 'jest',
    'playwright': 'jest',
    'selenium': 'jest',
    'webdriver': 'jest',
    'unit testing': 'jest',
    'integration testing': 'jest',
    'e2e testing': 'jest',
    'tdd': 'jest',
    'bdd': 'jest',
    'testing library': 'jest',
    'enzyme': 'jest',
    'react testing library': 'jest',
    'jest-dom': 'jest',
    'chai': 'jest',
    'sinon': 'jest',
    'git': 'git',
    'github': 'git',
    'gitlab': 'git',
    'bitbucket': 'git',
    'svn': 'git',
    'mercurial': 'git',
    'npm': 'npm',
    'yarn': 'npm',
    'pnpm': 'npm',
    'linux': 'linux',
    'unix': 'linux',
    'bash': 'linux',
    'shell scripting': 'linux',
    'powershell': 'linux',
    'vim': 'linux',
    'vs code': 'linux',
    'intellij': 'linux',
    'webstorm': 'linux',
    'pycharm': 'linux',
    'android studio': 'linux',
    'xcode': 'linux',
    'react native': 'react native',
    'flutter': 'flutter',
    'swift': 'swift',
    'swiftui': 'swift',
    'objective-c': 'swift',
    'kotlin': 'swift',
    'java android': 'swift',
    'android studio': 'linux',
    'xcode': 'linux',
    'cordova': 'react native',
    'ionic': 'react native',
    'phonegap': 'react native',
    'pwa': 'react native',
    'progressive web apps': 'react native',
    'expo': 'react native',
    'react navigation': 'react native',
    'flutter navigation': 'flutter',
    'python': 'python',
    'r': 'r',
    'sql': 'sql',
    'pandas': 'python',
    'numpy': 'python',
    'scipy': 'python',
    'matplotlib': 'python',
    'seaborn': 'python',
    'plotly': 'python',
    'tableau': 'tableau',
    'power bi': 'tableau',
    'looker': 'tableau',
    'google analytics': 'tableau',
    'mixpanel': 'tableau',
    'segment': 'tableau',
    'amplitude': 'tableau',
    'data science': 'python',
    'machine learning': 'python',
    'ml': 'python',
    'deep learning': 'python',
    'tensorflow': 'python',
    'pytorch': 'python',
    'scikit-learn': 'python',
    'jupyter': 'python',
    'spark': 'python',
    'hadoop': 'python',
    'airflow': 'python',
    'agile': 'agile',
    'scrum': 'agile',
    'kanban': 'agile',
    'waterfall': 'agile',
    'lean': 'agile',
    'devops': 'agile',
    'ci/cd': 'agile',
    'tdd': 'agile',
    'bdd': 'agile',
    'pair programming': 'agile',
    'code review': 'agile',
    'sprint planning': 'agile',
    'retrospective': 'agile',
    'standup': 'agile',
    'user stories': 'agile',
    'epics': 'agile',
    'backlog grooming': 'agile',
    'estimation': 'agile',
    'velocity': 'agile'
  };
  
  return exactMatches[normalizedSkill] || normalizedSkill;
}

module.exports = {
  SKILLS_DICTIONARY,
  ALL_SKILLS,
  getSkillCategory,
  normalizeSkillName
};
