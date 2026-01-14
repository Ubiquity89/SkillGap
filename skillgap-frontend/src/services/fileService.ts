import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';
import { auth } from '../firebase';

export interface FileProcessResponse {
  success: boolean;
  message?: string;
  data?: {
    extractedText: string;
    extractedSkills: Array<{
      name: string;
      yearsOfExperience?: number;
    }>;
    fileName: string;
  };
}

export const processResumeFile = async (file: File): Promise<FileProcessResponse> => {
  try {
    // Get current Firebase user token
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const token = await currentUser.getIdToken();

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post<FileProcessResponse>(`${API_BASE_URL}/files/upload-resume`, 
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
    console.error('File processing error:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to process file');
  }
};
