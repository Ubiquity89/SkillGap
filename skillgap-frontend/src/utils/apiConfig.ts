// API Configuration - Updated for production deployment
declare global {
  interface ImportMetaEnv {
    VITE_API_BASE_URL?: string;
  }
}

declare const importMeta: {
  env: ImportMetaEnv;
};

export const API_BASE_URL = importMeta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

// For debugging
console.log('🔧 API Base URL:', API_BASE_URL);
