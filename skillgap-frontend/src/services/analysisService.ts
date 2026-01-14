import axios from 'axios';
import { auth } from '../firebase';
import { API_BASE_URL } from '../utils/apiConfig';

export interface AnalysisResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    overallScore: number;
    status: 'strong_fit' | 'partial_fit' | 'weak_fit';
    createdAt: string;
  };
}

export interface AnalysisDetailResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    resumeId: string;
    jobId: string;
    resumeName: string;
    jobTitle: string;
    overallScore: number;
    status: 'strong_fit' | 'partial_fit' | 'weak_fit';
    skillsMatch: {
      matched: Array<{ name: string; yearsOfExperience?: number }>;
      missing: Array<{ name: string }>;
      extra: Array<{ name: string; yearsOfExperience?: number }>;
    };
    experienceAlignment: {
      required: number;
      found: number;
      status: 'aligned' | 'not_aligned';
    };
    atsKeywordSuggestions: string[];
    recommendations: string[];
    createdAt: string;
    updatedAt: string;
  };
}

export interface AnalysesListResponse {
  success: boolean;
  data?: Array<{
    id: string;
    resumeName: string;
    jobTitle: string;
    matchScore: number;
    status: 'strong_fit' | 'partial_fit' | 'weak_fit';
    date: string;
  }>;
}

export interface CreateAnalysisData {
  resumeId: string;
  jobId: string;
}

export const createAnalysis = async (analysisData: CreateAnalysisData): Promise<AnalysisResponse> => {
  try {
    // Get current Firebase user token
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const token = await currentUser.getIdToken();

    const response = await axios.post<AnalysisResponse>(`${API_BASE_URL}/analysis`, analysisData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Analysis creation error:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to create analysis');
  }
};

export const getAnalyses = async (): Promise<AnalysesListResponse> => {
  try {
    // Get current Firebase user token
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const token = await currentUser.getIdToken();

    const response = await axios.get<AnalysesListResponse>(`${API_BASE_URL}/analysis`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Get analyses error:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to get analyses');
  }
};

export const getAnalysisById = async (analysisId: string): Promise<AnalysisDetailResponse> => {
  try {
    // Get current Firebase user token
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const token = await currentUser.getIdToken();

    const response = await axios.get<AnalysisDetailResponse>(`${API_BASE_URL}/analysis/${analysisId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Get analysis error:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to get analysis');
  }
};

export const deleteAnalysis = async (analysisId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/analysis/${analysisId}`, {
      headers: {
        'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      // Refresh dashboard data after successful deletion
      // Note: This would need to be called from the Dashboard component
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to delete analysis');
    }
  } catch (error: any) {
    console.error('Delete analysis error:', error);
    throw new Error(error.message || 'Failed to delete analysis');
  }
};
