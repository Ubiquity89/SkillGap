export interface Skill {
  name: string;
  yearsOfExperience?: number;
}

export interface Resume {
  id: string;
  userId: string;
  email: string;
  uploadType: 'file' | 'manual';
  skills: Skill[];
  extractedText?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  userId: string;
  firebaseUid: string;
  email: string;
  role: string;
  name?: string;
  isNewUser?: boolean;
}

export interface AnalysisResult {
  id: string;
  resumeId: string;
  jobId: string;
  matchScore: number;
  status: 'partial_fit' | 'strong_fit' | 'weak_fit';
  matchedSkills: Skill[];
  missingSkills: Skill[];
  extraSkills: Skill[];
  skillGapPriority: {
    high: Skill[];
    medium: Skill[];
    low: Skill[];
  };
  experienceAlignment: {
    required: number;
    found: number;
    status: 'aligned' | 'partially_aligned' | 'not_aligned';
  };
  atsKeywordSuggestions: string[];
  recommendations: string[];
  createdAt: Date;
  analyzedAt: Date;
}

export interface AnalysisHistory {
  id: string;
  resumeName: string;
  jobTitle: string;
  matchScore: number;
  status: 'Strong Fit' | 'Partial Fit' | 'Weak Fit' | 'completed' | 'processing' | 'failed';
  analyzedAt: Date;
}
