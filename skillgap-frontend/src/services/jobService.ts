import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';
import { auth } from '../firebase';
import { Skill } from '../types';

export interface JobResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    jobTitle: string;
    requiredSkills: Skill[];
    niceToHaveSkills: Skill[];
    requiredSkillsCount: number;
    niceToHaveSkillsCount: number;
    minimumExperience: number;
    description: string;
    extractionSummary?: {
      totalSkills: number;
      requiredCount: number;
      niceToHaveCount: number;
      categories: Record<string, number>;
      confidence: number;
    };
    autoExtracted: boolean;
    createdAt: string;
  };
}

export interface JobDetailResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    jobTitle: string;
    requiredSkills: Skill[];
    niceToHaveSkills: Skill[];
    minimumExperience: number;
    description: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface JobsListResponse {
  success: boolean;
  data?: Array<{
    id: string;
    jobTitle: string;
    requiredSkillsCount: number;
    minimumExperience: number;
    createdAt: string;
  }>;
}

export interface CreateJobData {
  jobTitle: string;
  requiredSkills: Skill[];
  niceToHaveSkills: Skill[];
  minimumExperience: string;
  description: string;
  useAutoExtraction?: boolean;
}

export const createJob = async (jobData: CreateJobData): Promise<JobResponse> => {
  try {
    // Get current Firebase user token
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const token = await currentUser.getIdToken();

    const response = await axios.post<JobResponse>(`${API_BASE_URL}/jobs`, jobData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Job creation error:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to create job description');
  }
};

export const getJobs = async (): Promise<JobsListResponse> => {
  try {
    // Get current Firebase user token
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const token = await currentUser.getIdToken();

    const response = await axios.get<JobsListResponse>(`${API_BASE_URL}/jobs`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Get jobs error:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to get jobs');
  }
};

export const deleteJob = async (jobId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const token = await currentUser.getIdToken();

    const response = await axios.delete(`${API_BASE_URL}/jobs/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Delete job error:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to delete job');
  }
};

export const getJobById = async (jobId: string): Promise<JobDetailResponse> => {
  try {
    // Get current Firebase user token
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const token = await currentUser.getIdToken();

    const response = await axios.get<JobDetailResponse>(`${API_BASE_URL}/jobs/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Get job error:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to get job');
  }
};
