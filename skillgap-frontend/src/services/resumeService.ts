import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';
import { auth } from '../firebase';

export interface ResumeResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    uploadType: string;
    skillsCount: number;
    createdAt: string;
  };
}

export interface UserResumesResponse {
  success: boolean;
  data?: Array<{
    id: string;
    fileName: string;
    uploadType: string;
    skills: Array<{
      name: string;
      yearsOfExperience?: number;
    }>;
    normalizedSkills: string[];
    skillsCount: number;
    totalExperience: number;
    extractedText: string;
    createdAt: string;
  }>;
}

export const uploadResume = async (
  file: File
): Promise<ResumeResponse> => {
  try {
    // Get current Firebase user token
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const token = await currentUser.getIdToken();

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('resume', file);

    const response = await axios.post<ResumeResponse>(`${API_BASE_URL}/resumes`, 
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Resume upload error:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to upload resume');
  }
};

export const getUserResumes = async (): Promise<UserResumesResponse> => {
  try {
    // Get current Firebase user token
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const token = await currentUser.getIdToken();

    const response = await axios.get<UserResumesResponse>(`${API_BASE_URL}/resumes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Get resumes error:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to get resumes');
  }
};

export const getResumes = getUserResumes;

export const deleteResume = async (resumeId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const token = await currentUser.getIdToken();

    const response = await axios.delete(`${API_BASE_URL}/resumes/${resumeId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Delete resume error:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to delete resume');
  }
};
