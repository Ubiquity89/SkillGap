import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BriefcaseIcon, DocumentTextIcon, PlayIcon } from '@heroicons/react/24/outline';
import { getResumes } from '../services/resumeService';
import { getJobs } from '../services/jobService';
import { createAnalysis } from '../services/analysisService';

interface Resume {
  id: string;
  fileName?: string;
  uploadType: string;
  skillsCount: number;
  createdAt: string;
}

interface Job {
  id: string;
  jobTitle: string;
  requiredSkillsCount: number;
  minimumExperience: number;
  createdAt: string;
}

const CreateAnalysis: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [selectedJob, setSelectedJob] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resumesResponse, jobsResponse] = await Promise.all([
        getResumes(),
        getJobs()
      ]);
      
      setResumes(resumesResponse.data || []);
      setJobs(jobsResponse.data || []);
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load resumes and jobs');
    }
  };

  const handleCreateAnalysis = async () => {
    if (!selectedResume || !selectedJob) {
      setError('Please select both a resume and a job');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const result = await createAnalysis({
        resumeId: selectedResume,
        jobId: selectedJob
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(result.message || 'Failed to create analysis');
      }
    } catch (err: any) {
      console.error('Analysis creation error:', err);
      setError(err.message || 'Failed to create analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Analysis</h1>
          <p className="mt-2 text-gray-600">Analyze how well a resume matches a job description</p>
        </div>

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md mb-6">
            <div className="flex items-center">
              <PlayIcon className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-green-800">Analysis created successfully! Redirecting to dashboard...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Select Resume */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              Select Resume
            </h2>
            
            {resumes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p>No resumes uploaded yet</p>
                <button
                  onClick={() => navigate('/resume-upload')}
                  className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Upload Resume
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                      selectedResume === resume.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedResume(resume.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 truncate max-w-[200px]">
                        {resume.fileName || `Resume-${resume.id.slice(-5)}`}
                      </span>
                      <span className="text-sm text-gray-500">
                        {resume.skillsCount} skills
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Select Job */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <BriefcaseIcon className="w-5 h-5 mr-2" />
              Select Job
            </h2>
            
            {jobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BriefcaseIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p>No job descriptions added yet</p>
                <button
                  onClick={() => navigate('/job-form')}
                  className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Add Job Description
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                      selectedJob === job.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedJob(job.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{job.jobTitle}</span>
                      <span className="text-sm text-gray-500">
                        {job.minimumExperience}+ years
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateAnalysis}
            disabled={!selectedResume || !selectedJob || loading}
            className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center disabled:opacity-50"
          >
            <PlayIcon className="w-4 h-4 mr-2" />
            {loading ? 'Creating Analysis...' : 'Create Analysis'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAnalysis;
