import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BriefcaseIcon, PlusIcon, CheckCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import SkillTag from '../components/SkillTag';
import { Skill } from '../types';
import { createJob, getJobs, deleteJob } from '../services/jobService';

const JobForm: React.FC = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<Skill[]>([]);
  const [niceToHaveSkills, setNiceToHaveSkills] = useState<Skill[]>([]);
  const [minimumExperience, setMinimumExperience] = useState('');
  const [description, setDescription] = useState('');
  const [newRequiredSkill, setNewRequiredSkill] = useState('');
  const [newNiceToHaveSkill, setNewNiceToHaveSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [useAutoExtraction, setUseAutoExtraction] = useState(false);
  const [extractionResult, setExtractionResult] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const result = await getJobs();
      console.log('Jobs API response:', result);
      if (result.success && result.data) {
        console.log('Jobs data:', result.data);
        setJobs(result.data);
      } else {
        setJobs([]);
      }
    } catch {
      setJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  };

  const addRequiredSkill = () => {
    if (newRequiredSkill.trim()) {
      const skill: Skill = {
        name: newRequiredSkill.trim()
      };
      setRequiredSkills([...requiredSkills, skill]);
      setNewRequiredSkill('');
    }
  };

  const addNiceToHaveSkill = () => {
    if (newNiceToHaveSkill.trim()) {
      const skill: Skill = {
        name: newNiceToHaveSkill.trim()
      };
      setNiceToHaveSkills([...niceToHaveSkills, skill]);
      setNewNiceToHaveSkill('');
    }
  };

  const removeSkill = (skillToRemove: Skill, type: 'required' | 'nice-to-have') => {
    if (type === 'required') {
      setRequiredSkills(requiredSkills.filter(skill => skill !== skillToRemove));
    } else {
      setNiceToHaveSkills(niceToHaveSkills.filter(skill => skill !== skillToRemove));
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Delete this job?')) return;
    
    try {
      await deleteJob(jobId);
      
      // Remove from UI immediately
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      
      // Refresh data to ensure sync
      await fetchJobs();
      
    } catch (error: any) {
      alert('Failed to delete job: ' + error.message);
      console.error('Delete job error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const jobData = {
        jobTitle,
        requiredSkills,
        niceToHaveSkills,
        minimumExperience,
        description,
        useAutoExtraction
      };

      console.log('Submitting job:', jobData);
      const result = await createJob(jobData);

      if (result.success && result.data) {
        setSuccess(true);
        setExtractionResult(result.data.extractionSummary);
        
        // If auto-extraction was used, update the skills with extracted results
        if (result.data.autoExtracted && result.data.requiredSkills) {
          setRequiredSkills(result.data.requiredSkills);
          setNiceToHaveSkills(result.data.niceToHaveSkills || []);
        }
        
        // Refresh jobs list after successful save
        await fetchJobs();
        // Clear form after successful save
        setTimeout(() => {
          setJobTitle('');
          setRequiredSkills([]);
          setNiceToHaveSkills([]);
          setMinimumExperience('');
          setDescription('');
          setNewRequiredSkill('');
          setNewNiceToHaveSkill('');
          setSuccess(false);
        }, 2000);
      } else {
        setError(result.message || 'Failed to create job description');
      }
    } catch (err: any) {
      console.error('Job creation error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add Job Description</h1>
          <p className="mt-2 text-gray-600">Create a job description with required skills and experience</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Success/Error Messages */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-green-800">Job description created successfully! Redirecting to dashboard...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  id="jobTitle"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Senior Frontend Developer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="minimumExperience" className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Experience (years)
                </label>
                <input
                  type="number"
                  id="minimumExperience"
                  value={minimumExperience}
                  onChange={(e) => setMinimumExperience(e.target.value)}
                  placeholder="e.g., 3"
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Job Description
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoExtraction"
                    checked={useAutoExtraction}
                    onChange={(e) => setUseAutoExtraction(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="autoExtraction" className="ml-2 text-sm text-gray-600">
                    Auto-extract skills
                  </label>
                </div>
              </div>
              
              {useAutoExtraction && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Smart Skill Extraction</h3>
                      <p className="mt-1 text-sm text-blue-700">
                        Paste a full job description and we'll automatically extract the required and nice-to-have skills.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={useAutoExtraction ? 8 : 4}
                placeholder={useAutoExtraction ? 
                  "Paste the complete job description here (e.g., from LinkedIn)...\n\nExample:\nWe are looking for a UI Developer with experience in React, JavaScript, CSS, HTML, Figma, REST APIs and Git. Knowledge of TypeScript is a plus." :
                  "Provide a detailed description of the role, responsibilities, and company culture..."
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              
              {extractionResult && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-green-800">Extraction Complete</h4>
                      <p className="text-sm text-green-700">
                        Found {extractionResult.totalSkills} skills ({extractionResult.requiredCount} required, {extractionResult.niceToHaveCount} nice-to-have)
                      </p>
                    </div>
                    <div className="text-sm text-green-600">
                      {extractionResult.confidence}% confidence
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Required Skills */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Required Skills</h2>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newRequiredSkill}
                onChange={(e) => setNewRequiredSkill(e.target.value)}
                placeholder="Add a required skill (e.g., React)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addRequiredSkill();
                  }
                }}
              />
              <button
                type="button"
                onClick={addRequiredSkill}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Required
              </button>
            </div>

            {requiredSkills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {requiredSkills.map((skill, index) => (
                  <SkillTag
                    key={index}
                    skill={skill}
                    onRemove={(skill) => removeSkill(skill, 'required')}
                    variant="default"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Nice-to-Have Skills */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Nice-to-Have Skills (Optional)</h2>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newNiceToHaveSkill}
                onChange={(e) => setNewNiceToHaveSkill(e.target.value)}
                placeholder="Add a nice-to-have skill (e.g., Docker)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addNiceToHaveSkill();
                  }
                }}
              />
              <button
                type="button"
                onClick={addNiceToHaveSkill}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Optional
              </button>
            </div>

            {niceToHaveSkills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {niceToHaveSkills.map((skill, index) => (
                  <SkillTag
                    key={index}
                    skill={skill}
                    onRemove={(skill) => removeSkill(skill, 'nice-to-have')}
                    variant="default"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center disabled:opacity-50"
            >
              <BriefcaseIcon className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Job Description'}
            </button>
          </div>
        </form>

        {/* Job List */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <BriefcaseIcon className="h-5 w-5 mr-2" />
              <h2 className="text-lg font-medium">My Jobs ({jobs.length})</h2>
            </div>
            <button
              onClick={fetchJobs}
              disabled={loadingJobs}
              className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              {loadingJobs ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {loadingJobs ? (
            <p>Loading...</p>
          ) : jobs.length === 0 ? (
            <p className="text-gray-500">No jobs added yet</p>
          ) : (
            <div className="space-y-4">
              {jobs.map(job => {
                console.log('Rendering job:', job);
                console.log('requiredSkills:', job.requiredSkills);
                console.log('Job object:', job);
                return (
                <div key={job.id} className="border p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium truncate max-w-xs">
                        {job.jobTitle}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {(job.requiredSkills && job.requiredSkills.length > 0) 
                          ? job.requiredSkills.map((skill: any) => skill.name).join(", ")
                          : (job.skills && job.skills.length > 0)
                            ? job.skills.map((skill: any) => skill.name).join(", ")
                            : "No required skills"}{' '}
                        • {job.minimumExperience || 0}+ years
                      </p>
                      {job.niceToHaveSkills && job.niceToHaveSkills.length > 0 && (
                        <p className="text-sm text-gray-400 mt-1">
                          Nice-to-Have: {job.niceToHaveSkills.map((skill: any) => skill.name).join(", ")}
                        </p>
                      )}
                    </div>
                    <button onClick={() => handleDeleteJob(job.id)}>
                      <TrashIcon className="h-5 w-5 text-red-600" />
                    </button>
                  </div>

                  {/* Required Skills */}
                  {job.requiredSkills && job.requiredSkills.length > 0 && (
                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Required Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.requiredSkills.map((skill: any, index: number) => (
                          <div
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                          >
                            <span>{skill.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nice-to-Have Skills */}
                  {job.niceToHaveSkills && job.niceToHaveSkills.length > 0 && (
                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Nice-to-Have Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.niceToHaveSkills.map((skill: any, index: number) => (
                          <div
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200"
                          >
                            <span>{skill.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Job Description */}
                  {job.description && (
                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Job Description</h4>
                      <div className="bg-gray-50 rounded-md p-3 max-h-32 overflow-y-auto">
                        <p className="text-sm text-gray-600 line-clamp-4">
                          {job.description.substring(0, 300)}
                          {job.description.length > 300 && '...'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobForm;
