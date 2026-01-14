import React from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface ScoreCardProps {
  score: number;
  status: 'strong_fit' | 'partial_fit' | 'weak_fit';
}

const ScoreCard: React.FC<ScoreCardProps> = ({ score, status }) => {
  const getScoreColor = () => {
    if (score >= 75) return 'text-success-600';
    if (score >= 50) return 'text-warning-600';
    return 'text-danger-600';
  };

  const getScoreBgColor = () => {
    if (score >= 75) return 'bg-success-100';
    if (score >= 50) return 'bg-warning-100';
    return 'bg-danger-100';
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'strong_fit':
        return <CheckCircleIcon className="w-6 h-6 text-success-600" />;
      case 'partial_fit':
        return <ExclamationTriangleIcon className="w-6 h-6 text-warning-600" />;
      case 'weak_fit':
        return <XCircleIcon className="w-6 h-6 text-danger-600" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">Match Score</p>
          <div className="flex items-baseline mt-2">
            <p className={`text-3xl font-bold ${getScoreColor()}`}>
              {score}%
            </p>
            <p className="ml-2 text-sm text-gray-500">match</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end mb-2">
            {getStatusIcon()}
          </div>
          <p className="text-sm font-medium text-gray-900">{getStatusText()}</p>
        </div>
      </div>
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${getScoreBgColor()}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;
