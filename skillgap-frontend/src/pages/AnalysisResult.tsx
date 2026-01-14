import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  PlusCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import ScoreCard from '../components/ScoreCard';
import SkillTag from '../components/SkillTag';
import type { AnalysisResult, Skill } from '../types/index';
import { getAnalysisById } from '../services/analysisService';

const AnalysisResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!id) {
        setError('Analysis ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getAnalysisById(id);
        if (response.success && response.data) {
          // Transform API response to match AnalysisResult interface
          const statusMap: Record<string, 'Strong Fit' | 'Partial Fit' | 'Weak Fit'> = {
            'strong_fit': 'Strong Fit',
            'partial_fit': 'Partial Fit', 
            'weak_fit': 'Weak Fit'
          };
          
          const experienceStatusMap: Record<string, 'Aligned' | 'Partially Aligned' | 'Not Aligned'> = {
            'aligned': 'Aligned',
            'partially_aligned': 'Partially Aligned',
            'not_aligned': 'Not Aligned'
          };

          const transformedAnalysis: AnalysisResult = {
            matchScore: response.data.overallScore,
            status: (statusMap[response.data.status] ?? 'Partial Fit') as 'Strong Fit' | 'Partial Fit' | 'Weak Fit',
            matchedSkills: response.data.skillsMatch.matched.map(skill => skill.name),
            missingSkills: response.data.skillsMatch.missing.map(skill => skill.name),
            extraSkills: response.data.skillsMatch.extra.map(skill => skill.name),
            skillGapPriority: {
              high: (response.data as any).skillGapPriority?.high || [],
              medium: (response.data as any).skillGapPriority?.medium || [],
              low: (response.data as any).skillGapPriority?.low || []
            },
            roleMismatch: (response.data as any).roleMismatch,
            nextBestAction: (response.data as any).nextBestAction,
            experience: {
              required: response.data.experienceAlignment.required,
              found: response.data.experienceAlignment.found,
              status: (experienceStatusMap[response.data.experienceAlignment.status] ?? 'Partially Aligned') as 'Aligned' | 'Partially Aligned' | 'Not Aligned'
            },
            atsSuggestions: response.data.atsKeywordSuggestions,
            resumeName: response.data.resumeName,
            jobTitle: response.data.jobTitle
          };
          setAnalysis(transformedAnalysis);
          setError('');
        } else {
          setError(response.message || 'Failed to load analysis');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load analysis');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  const getExperienceColor = (status: string) => {
    switch (status) {
      case 'Aligned':
        return 'text-green-600 bg-green-100';
      case 'Partially Aligned':
        return 'text-yellow-600 bg-yellow-100';
      case 'Not Aligned':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Analysis Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The analysis you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Convert string arrays to Skill objects for SkillTag component
  const matchedSkillObjects: Skill[] = analysis.matchedSkills.map((skill: string) => ({ name: skill }));
  const missingSkillObjects: Skill[] = analysis.missingSkills.map((skill: string) => ({ name: skill }));
  const extraSkillObjects: Skill[] = analysis.extraSkills.map((skill: string) => ({ name: skill }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-primary-600 hover:text-primary-700"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Analysis Result</h1>
          <p className="mt-2 text-gray-600">
            Detailed breakdown of resume-job fit analysis
          </p>
          <div className="mt-4 flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              <strong>Resume:</strong> {analysis.resumeName}
            </span>
            <span className="text-sm text-gray-600">
              <strong>Job:</strong> {analysis.jobTitle}
            </span>
          </div>
        </div>

        {/* Match Score Card */}
        <div className="mb-8">
          <ScoreCard score={analysis.matchScore} status={analysis.status.toLowerCase().replace(' ', '_') as 'strong_fit' | 'partial_fit' | 'weak_fit'} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Skill Match Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Skill Match Breakdown</h2>
            
            {/* Matched Skills */}
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                <h3 className="font-medium text-gray-900">Matched Skills ({analysis.matchedSkills.length})</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {matchedSkillObjects.map((skill, index) => (
                  <SkillTag key={index} skill={skill} variant="matched" />
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                <h3 className="font-medium text-gray-900">Missing Skills ({analysis.missingSkills.length})</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {missingSkillObjects.map((skill, index) => (
                  <SkillTag key={index} skill={skill} variant="missing" />
                ))}
              </div>
            </div>

            {/* Extra Skills */}
            <div>
              <div className="flex items-center mb-3">
                <PlusCircleIcon className="w-5 h-5 text-blue-500 mr-2" />
                <h3 className="font-medium text-gray-900">Extra Skills ({analysis.extraSkills.length})</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {extraSkillObjects.map((skill, index) => (
                  <SkillTag key={index} skill={skill} variant="extra" />
                ))}
              </div>
            </div>
          </div>

          {/* Skill Gap Priority */}
          {analysis.skillGapPriority && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Skill Gap Priority</h2>
              <p className="text-sm text-gray-600 mb-4">
                Skills prioritized by importance for closing the gap:
              </p>
              
              <div className="space-y-4">
                {/* High Priority */}
                {analysis.skillGapPriority.high && analysis.skillGapPriority.high.length > 0 && (
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <h3 className="font-medium text-gray-900">High Priority</h3>
                      <span className="ml-2 text-sm text-gray-500">({analysis.skillGapPriority.high.length})</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">Critical skills that significantly impact match score</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.skillGapPriority.high.map((skillItem: any, index: number) => {
                        const skillObj: Skill = { name: skillItem.name };
                        return (
                          <div key={index} className="border border-red-200 bg-red-50 rounded-lg p-3 max-w-xs">
                            <div className="flex items-center justify-between mb-2">
                              <SkillTag skill={skillObj} variant="missing" />
                              <span className="text-xs font-medium text-red-600 ml-2">{skillItem.impact}</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{skillItem.reason}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Medium Priority */}
                {analysis.skillGapPriority.medium && analysis.skillGapPriority.medium.length > 0 && (
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                      <h3 className="font-medium text-gray-900">Medium Priority</h3>
                      <span className="ml-2 text-sm text-gray-500">({analysis.skillGapPriority.medium.length})</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">Important skills that would improve candidacy</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.skillGapPriority.medium.map((skillItem: any, index: number) => {
                        const skillObj: Skill = { name: skillItem.name };
                        return (
                          <div key={index} className="border border-yellow-200 bg-yellow-50 rounded-lg p-3 max-w-xs">
                            <div className="flex items-center justify-between mb-2">
                              <SkillTag skill={skillObj} variant="missing" />
                              <span className="text-xs font-medium text-yellow-600 ml-2">{skillItem.impact}</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{skillItem.reason}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Low Priority */}
                {analysis.skillGapPriority.low && analysis.skillGapPriority.low.length > 0 && (
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <h3 className="font-medium text-gray-900">Low Priority</h3>
                      <span className="ml-2 text-sm text-gray-500">({analysis.skillGapPriority.low.length})</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">Nice-to-have skills for competitive advantage</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.skillGapPriority.low.map((skillItem: any, index: number) => {
                        const skillObj: Skill = { name: skillItem.name };
                        return (
                          <div key={index} className="border border-blue-200 bg-blue-50 rounded-lg p-3 max-w-xs">
                            <div className="flex items-center justify-between mb-2">
                              <SkillTag skill={skillObj} variant="extra" />
                              <span className="text-xs font-medium text-blue-600 ml-2">{skillItem.impact}</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{skillItem.reason}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Show message if no skill gap data available */}
                {(!analysis.skillGapPriority.high || analysis.skillGapPriority.high.length === 0) &&
                 (!analysis.skillGapPriority.medium || analysis.skillGapPriority.medium.length === 0) &&
                 (!analysis.skillGapPriority.low || analysis.skillGapPriority.low.length === 0) && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No skill gap priority data available</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Role Mismatch Warning */}
          {analysis.roleMismatch && analysis.roleMismatch.detected && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Role Mismatch Detected</h3>
                  <p className="mt-1 text-sm text-yellow-700">{analysis.roleMismatch.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Next Best Action */}
          {analysis.nextBestAction && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Next Best Action</h3>
                  <p className="mt-1 text-sm text-blue-700">{analysis.nextBestAction}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Experience Alignment */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Experience Alignment</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Required Experience</span>
                <span className="text-sm font-bold text-gray-900">{analysis.experience.required} years</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full" 
                  style={{ width: `${Math.min((analysis.experience.found / analysis.experience.required) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="mt-4">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getExperienceColor(analysis.experience.status)}`}>
                {analysis.experience.status}
              </span>
            </div>
          </div>

          {/* Skill Coverage */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Skill Coverage Analysis</h2>
            <p className="text-sm text-gray-600 mb-4">
              Breakdown of your skills vs job requirements by category:
            </p>
            
            <div className="space-y-3">
              {/* Calculate skill coverage percentages */}
              {(() => {
                const totalSkills = analysis.matchedSkills.length + analysis.missingSkills.length;
                const coveragePercentage = totalSkills > 0 ? Math.round((analysis.matchedSkills.length / totalSkills) * 100) : 0;
                
                // Calculate category breakdowns
                const frontendSkills = ['react', 'javascript', 'typescript', 'html', 'css', 'vue', 'angular'];
                const backendSkills = ['node.js', 'express', 'mongodb', 'python', 'java', 'php'];
                const designSkills = ['figma', 'sketch', 'adobe xd', 'photoshop', 'tailwind css', 'bootstrap'];
                const toolingSkills = ['git', 'github', 'docker', 'jest', 'webpack'];
                
                const matchedFrontend = analysis.matchedSkills.filter(s => frontendSkills.includes(s.toLowerCase())).length;
                const matchedBackend = analysis.matchedSkills.filter(s => backendSkills.includes(s.toLowerCase())).length;
                const matchedDesign = analysis.matchedSkills.filter(s => designSkills.includes(s.toLowerCase())).length;
                const matchedTooling = analysis.matchedSkills.filter(s => toolingSkills.includes(s.toLowerCase())).length;
                
                const totalFrontend = frontendSkills.filter(s => analysis.missingSkills.includes(s.toLowerCase()) || analysis.matchedSkills.includes(s.toLowerCase())).length;
                const totalBackend = backendSkills.filter(s => analysis.missingSkills.includes(s.toLowerCase()) || analysis.matchedSkills.includes(s.toLowerCase())).length;
                const totalDesign = designSkills.filter(s => analysis.missingSkills.includes(s.toLowerCase()) || analysis.matchedSkills.includes(s.toLowerCase())).length;
                const totalTooling = toolingSkills.filter(s => analysis.missingSkills.includes(s.toLowerCase()) || analysis.matchedSkills.includes(s.toLowerCase())).length;
                
                return (
                  <>
                    {/* Overall Coverage */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Overall Skill Match</span>
                        <span className={`text-sm font-bold ${coveragePercentage >= 70 ? 'text-green-600' : coveragePercentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {coveragePercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${
                            coveragePercentage >= 70 ? 'bg-green-600' : 
                            coveragePercentage >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${coveragePercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Category Breakdown */}
                    <div className="grid grid-cols-2 gap-4">
                      {totalFrontend > 0 && (
                        <div className="border border-gray-200 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Frontend Skills</h4>
                          <div className="text-xs text-gray-600 mb-1">
                            {matchedFrontend}/{totalFrontend} covered
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${totalFrontend > 0 ? (matchedFrontend / totalFrontend) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {totalBackend > 0 && (
                        <div className="border border-gray-200 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Backend Skills</h4>
                          <div className="text-xs text-gray-600 mb-1">
                            {matchedBackend}/{totalBackend} covered
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${totalBackend > 0 ? (matchedBackend / totalBackend) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {totalDesign > 0 && (
                        <div className="border border-gray-200 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Design Skills</h4>
                          <div className="text-xs text-gray-600 mb-1">
                            {matchedDesign}/{totalDesign} covered
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full"
                              style={{ width: `${totalDesign > 0 ? (matchedDesign / totalDesign) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {totalTooling > 0 && (
                        <div className="border border-gray-200 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Tooling & DevOps</h4>
                          <div className="text-xs text-gray-600 mb-1">
                            {matchedTooling}/{totalTooling} covered
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full"
                              style={{ width: `${totalTooling > 0 ? (matchedTooling / totalTooling) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Summary */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600">
                        {coveragePercentage >= 70 ? 
                          "Excellent skill coverage! Your profile aligns well with job requirements." :
                          coveragePercentage >= 50 ?
                          "Good skill coverage with room for improvement in key areas." :
                          "Low skill coverage. Focus on highlighted missing skills to improve your match."
                        }
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* ATS Keyword Suggestions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">ATS Keyword Suggestions</h2>
            <p className="text-sm text-gray-600 mb-4">
              Recommended keywords to add to your resume for better ATS optimization:
            </p>
            <div className="flex flex-wrap gap-2">
              {analysis.atsSuggestions.map((suggestion: string, index: number) => {
                const skillObj: Skill = { name: suggestion };
                return (
                  <SkillTag key={index} skill={skillObj} variant="extra" />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResultPage;
