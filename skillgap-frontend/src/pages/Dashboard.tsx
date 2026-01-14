import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  DocumentTextIcon, 
  BriefcaseIcon, 
  ChartBarIcon,
  PlusIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { getDashboardData, DashboardData, RecentAnalysis } from '../services/dashboardService';
import { deleteAnalysis } from '../services/analysisService';

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
        const data = await getDashboardData();
        setDashboardData(data);
        setError('');
      } catch (err: any) {
        console.error('Dashboard fetch error:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteAnalysis = async (analysisId: string) => {
    if (window.confirm('Are you sure you want to delete this analysis?')) {
      try {
        await deleteAnalysis(analysisId);
        await fetchDashboardData(); // Refresh data after deletion
      } catch (err: any) {
        alert('Failed to delete analysis: ' + err.message);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'strong_fit':
        return 'bg-success-100 text-success-800';
      case 'partial_fit':
        return 'bg-warning-100 text-warning-800';
      case 'weak_fit':
        return 'bg-danger-100 text-danger-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'strong_fit':
        return 'Strong Fit';
      case 'partial_fit':
        return 'Partial Fit';
      case 'weak_fit':
        return 'Weak Fit';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-gray-600">No data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Track your resume-job analyses and match scores</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-full">
                <DocumentTextIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resumes Uploaded</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.resumesUploaded}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-full">
                <BriefcaseIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Jobs Added</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.jobsAdded}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-full">
                <ChartBarIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Match Score</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.avgMatchScore}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <ChartBarIcon className="w-4 h-4 mr-2" />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/resume-upload"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Upload New Resume
            </Link>
            <Link
              to="/job-form"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Job Description
            </Link>
            <Link
              to="/create-analysis"
              className="flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
            >
              <ChartBarIcon className="w-5 h-5 mr-2" />
              Create Analysis
            </Link>
          </div>
        </div>

        {/* Recent Analysis Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Analysis</h2>
          </div>
          <div className="recent-analysis-wrapper">
            <table className="recent-analysis-table divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resume
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Match
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.recentAnalyses.length > 0 ? (
                  dashboardData.recentAnalyses.map((analysis: RecentAnalysis) => (
                    <tr key={analysis.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {analysis.resumeName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {analysis.jobTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">
                            {Number.isFinite(analysis.matchScore) ? `${analysis.matchScore}%` : '0%'}
                          </span>
                          <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                Number.isFinite(analysis.matchScore) && analysis.matchScore >= 75
                                  ? 'bg-success-500'
                                  : Number.isFinite(analysis.matchScore) && analysis.matchScore >= 50
                                  ? 'bg-warning-500'
                                  : 'bg-danger-500'
                              }`}
                              style={{ width: `${Number.isFinite(analysis.matchScore) ? analysis.matchScore : 0}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(analysis.status)}`}>
                          {getStatusText(analysis.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {analysis.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/analysis/${analysis.id}`}
                            className="text-primary-600 hover:text-primary-900 flex items-center"
                          >
                            <EyeIcon className="w-4 h-4 mr-1" />
                            View
                          </Link>
                          <button
                            onClick={() => handleDeleteAnalysis(analysis.id)}
                            className="text-red-600 hover:text-red-900 flex items-center"
                            title="Delete analysis"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center">
                        <DocumentTextIcon className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="font-medium text-gray-900 mb-1">No resumes uploaded yet</p>
                        <p className="text-gray-500 mb-4">Upload your first resume to get started</p>
                        <Link
                          to="/resume-upload"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                        >
                          <PlusIcon className="w-4 h-4 mr-2" />
                          Upload Resume
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
