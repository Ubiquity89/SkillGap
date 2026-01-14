import React from 'react';
import { Link } from 'react-router-dom';
import { EyeIcon, CalendarIcon, DocumentTextIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { AnalysisHistory } from '../types';

const History: React.FC = () => {
  // Mock data - in real app, this would come from API
  const historyData: AnalysisHistory[] = [
    {
      id: '1',
      resumeName: 'John_Doe_Resume.pdf',
      jobTitle: 'Senior Frontend Developer',
      matchScore: 67,
      status: 'Partial Fit',
      analyzedAt: new Date('2024-01-12')
    },
    {
      id: '2',
      resumeName: 'Jane_Smith_Resume.pdf',
      jobTitle: 'Full Stack Engineer',
      matchScore: 82,
      status: 'Strong Fit',
      analyzedAt: new Date('2024-01-11')
    },
    {
      id: '3',
      resumeName: 'Mike_Johnson_Resume.pdf',
      jobTitle: 'React Developer',
      matchScore: 45,
      status: 'Weak Fit',
      analyzedAt: new Date('2024-01-10')
    },
    {
      id: '4',
      resumeName: 'Sarah_Wilson_Resume.pdf',
      jobTitle: 'Backend Developer',
      matchScore: 78,
      status: 'Strong Fit',
      analyzedAt: new Date('2024-01-09')
    },
    {
      id: '5',
      resumeName: 'Tom_Brown_Resume.pdf',
      jobTitle: 'DevOps Engineer',
      matchScore: 52,
      status: 'Partial Fit',
      analyzedAt: new Date('2024-01-08')
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'strong fit':
        return 'bg-success-100 text-success-800';
      case 'partial fit':
        return 'bg-warning-100 text-warning-800';
      case 'weak fit':
        return 'bg-danger-100 text-danger-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-success-600';
    if (score >= 50) return 'text-warning-600';
    return 'text-danger-600';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analysis History</h1>
          <p className="mt-2 text-gray-600">
            View all your past resume-job analyses and track improvement over time
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-full">
                <DocumentTextIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Analyses</p>
                <p className="text-2xl font-bold text-gray-900">{historyData.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-success-100 rounded-full">
                <EyeIcon className="w-6 h-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Match Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(historyData.reduce((acc, item) => acc + item.matchScore, 0) / historyData.length)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-success-100 rounded-full">
                <BriefcaseIcon className="w-6 h-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Strong Fits</p>
                <p className="text-2xl font-bold text-gray-900">
                  {historyData.filter(item => item.matchScore >= 75).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-warning-100 rounded-full">
                <CalendarIcon className="w-6 h-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">
                  {historyData.filter(item => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return item.analyzedAt >= weekAgo;
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Analysis History</h2>
          </div>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resume
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Match Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historyData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DocumentTextIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">
                          {item.resumeName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <BriefcaseIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-900">{item.jobTitle}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-sm font-bold ${getScoreColor(item.matchScore)}`}>
                          {item.matchScore}%
                        </span>
                        <div className="ml-3 w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              item.matchScore >= 75
                                ? 'bg-success-500'
                                : item.matchScore >= 50
                                ? 'bg-warning-500'
                                : 'bg-danger-500'
                            }`}
                            style={{ width: `${item.matchScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {formatDate(item.analyzedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/analysis/${item.id}`}
                        className="text-primary-600 hover:text-primary-900 flex items-center justify-end"
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State (if no data) */}
        {historyData.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No analyses yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by uploading a resume and adding a job description.
            </p>
            <div className="mt-6">
              <Link
                to="/resume-upload"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Upload Resume
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
