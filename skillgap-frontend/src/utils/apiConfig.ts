// API Configuration - Create React App compatible
// Temporarily hardcoded to fix double /api issue
export const API_BASE_URL = 'https://skillgap-ik5x.onrender.com/api';

// For debugging
console.log('🔧 API Base URL:', API_BASE_URL);
console.log('🔧 Env var REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL);
console.log('🔧 Final URLs that will be called:');
console.log('  - Auth:', `${API_BASE_URL}/auth/firebase-login`);
console.log('  - Resumes:', `${API_BASE_URL}/resumes`);
console.log('  - Jobs:', `${API_BASE_URL}/jobs`);
console.log('  - Analysis:', `${API_BASE_URL}/analysis`);
