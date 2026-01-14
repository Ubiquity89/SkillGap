export interface User {
  id: string;
  email: string;
  role: 'candidate' | 'recruiter';
  name?: string;
}

export interface Resume {
  id: string;
  userId: string;
  fileName: string;
  extractedText?: string;
  skills: Skill[];
  uploadedAt: Date;
}

export interface Skill {
  name: string;
  yearsOfExperience?: number;
  level?: 'beginner' | 'intermediate' | 'advanced';
}

export interface JobDescription {
  id: string;
  title: string;
  requiredSkills: Skill[];
  minimumExperience: number;
  niceToHaveSkills?: Skill[];
  description?: string;
  createdAt: Date;
}

export interface SkillGapPriorityItem {
  name: string;
  reason: string;
  impact: string;
}

export interface RoleMismatch {
  detected: boolean;
  resumeProfile: string;
  targetRole: string;
  message: string;
}

export interface AnalysisResult {
  matchScore: number;
  status: 'Strong Fit' | 'Partial Fit' | 'Weak Fit';
  matchedSkills: string[];
  missingSkills: string[];
  extraSkills: string[];
  skillGapPriority: {
    high: SkillGapPriorityItem[];
    medium: SkillGapPriorityItem[];
    low: SkillGapPriorityItem[];
  };
  experience: {
    required: number;
    found: number;
    status: 'Aligned' | 'Partially Aligned' | 'Not Aligned';
  };
  atsSuggestions: string[];
  resumeName: string;
  jobTitle: string;
  roleMismatch?: RoleMismatch;
  nextBestAction?: string;
}

export interface AnalysisHistory {
  id: string;
  resumeName: string;
  jobTitle: string;
  matchScore: number;
  status: string;
  analyzedAt: Date;
}
