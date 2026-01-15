import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';
import { auth } from '../firebase';

// Helper function to normalize status formats
const normalizeStatus = (status: string): 'strong_fit' | 'partial_fit' | 'weak_fit' => {
  if (!status) return 'weak_fit';
  
  const statusLower = status.toLowerCase().replace(/\s+/g, '_');
  
  switch (statusLower) {
    case 'strong_fit':
    case 'strong fit':
      return 'strong_fit';
    case 'partial_fit':
    case 'partial fit':
      return 'partial_fit';
    case 'weak_fit':
    case 'weak fit':
    default:
      return 'weak_fit';
  }
};

export interface DashboardStats {
  resumesUploaded: number;
  jobsAdded: number;
  avgMatchScore: number;
}

export interface RecentAnalysis {
  id: string;
  resumeName: string;
  jobTitle: string;
  matchScore: number;
  status: 'strong_fit' | 'partial_fit' | 'weak_fit';
  date: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentAnalyses: RecentAnalysis[];
}

export const getDashboardData = async (): Promise<DashboardData> => {
  try {
    console.log('📊 Dashboard data fetch started');
    
    // Get current Firebase user token
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('❌ No Firebase user found');
      throw new Error('User not authenticated');
    }
    
    const token = await currentUser.getIdToken();
    console.log('🔑 Got Firebase token:', token ? 'success' : 'failed');
    
    // Fetch resumes, jobs, and analyses
    const [resumesResponse, jobsResponse, analysesResponse] = await Promise.all([
      axios.get(`${API_BASE_URL}/api/resumes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }),
      axios.get(`${API_BASE_URL}/api/jobs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }),
      axios.get(`${API_BASE_URL}/api/analysis`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
    ]);

    console.log('📊 API Responses:', {
      resumes: resumesResponse.data.success ? 'success' : 'failed',
      jobs: jobsResponse.data.success ? 'success' : 'failed',
      analyses: analysesResponse.data.success ? 'success' : 'failed'
    });

    const resumes = resumesResponse.data.data || [];
    const jobs = jobsResponse.data.data || [];
    const analyses = analysesResponse.data.data || [];
    
    // Calculate stats from real data with defensive coding
    const validScores = analyses
      .map((a: any) => Number(a.matchScore))
      .filter((s: number) => Number.isFinite(s));

    const avgMatchScore = validScores.length === 0
      ? 0
      : Math.round(
          validScores.reduce((a: number, b: number) => a + b, 0) / validScores.length
        );

    const stats: DashboardStats = {
      resumesUploaded: resumes.length,
      jobsAdded: jobs.length,
      avgMatchScore
    };

    // Use real analyses data, filtering out invalid rows with less strict criteria
    console.log('📊 Raw analyses from API:', analyses.length, analyses);
    
    const recentAnalyses: RecentAnalysis[] = analyses
      .filter((analysis: any) => {
        const hasJobId = analysis.jobId || analysis.id;
        const hasValidScore = Number.isFinite(Number(analysis.matchScore));
        console.log(`Analysis ${analysis.id}: jobId=${analysis.jobId}, matchScore=${analysis.matchScore}, valid=${hasJobId && hasValidScore}`);
        return hasJobId && hasValidScore;
      })
      .map((analysis: any) => ({
        id: analysis.id,
        resumeName: analysis.resumeName || 'Unknown Resume',
        jobTitle: analysis.jobTitle || 'Unknown Job',
        matchScore: Number(analysis.matchScore || 0),
        status: normalizeStatus(analysis.status),
        date: new Date(analysis.date || analysis.createdAt).toLocaleDateString()
      }));

    console.log('📊 Filtered analyses:', recentAnalyses.length);

    return {
      stats,
      recentAnalyses
    };

  } catch (error: any) {
    console.error('Dashboard data fetch error:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to fetch dashboard data');
  }
};
