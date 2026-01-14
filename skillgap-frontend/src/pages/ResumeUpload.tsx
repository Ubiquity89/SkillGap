import React, { useState, useEffect } from 'react';
import {
  CloudArrowUpIcon,
  XMarkIcon,
  CheckCircleIcon,
  TrashIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import { uploadResume, getUserResumes, deleteResume } from '../services/resumeService';
import { useNavigate } from 'react-router-dom';

const ResumeUpload: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [userResumes, setUserResumes] = useState<any[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserResumes();
  }, []);

  const fetchUserResumes = async () => {
    setLoadingResumes(true);
    try {
      const result = await getUserResumes();
      if (result.success && result.data) {
        setUserResumes(result.data);
      } else {
        setUserResumes([]);
      }
    } catch {
      setUserResumes([]);
    } finally {
      setLoadingResumes(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setError('');
    }
  };

  const handleSaveResume = async () => {
    if (!uploadedFile) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    try {
      const result = await uploadResume(uploadedFile);
      if (result.success) {
        setSuccess(true);
        await fetchUserResumes();
        setUploadedFile(null);
        setTimeout(() => setSuccess(false), 2500);
      } else {
        setError(result.message || 'Upload failed');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResume = async (id: string) => {
    if (!window.confirm('Delete this resume?')) return;
    await deleteResume(id);
    setUserResumes(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Upload Resume</h1>

      {/* Upload Box */}
      <div className="bg-white p-6 rounded-lg border mb-8">
        <label className="block text-sm font-medium mb-2">Upload Resume (PDF)</label>

        <div className="border-2 border-dashed rounded-md p-6 text-center">
          <CloudArrowUpIcon className="h-10 w-10 mx-auto text-gray-400" />
          <label className="cursor-pointer text-primary-600">
            Upload a file
            <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>

        {uploadedFile && (
          <div className="mt-4 flex justify-between bg-gray-100 p-3 rounded">
            <span>{uploadedFile.name}</span>
            <button onClick={() => setUploadedFile(null)}>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        {error && <p className="text-red-600 mt-3">{error}</p>}

        {success && (
          <div className="mt-4 flex items-center text-green-600">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            Resume uploaded successfully
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => navigate('/dashboard')} className="border px-4 py-2 rounded">
            Cancel
          </button>
          <button
            onClick={handleSaveResume}
            disabled={!uploadedFile || loading}
            className="bg-primary-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>

      {/* Resume List */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center mb-4">
          <FolderIcon className="h-5 w-5 mr-2" />
          <h2 className="text-lg font-medium">My Resumes ({userResumes.length})</h2>
        </div>

        {loadingResumes ? (
          <p>Loading...</p>
        ) : userResumes.length === 0 ? (
          <p className="text-gray-500">No resumes uploaded</p>
        ) : (
          <div className="space-y-4">
            {userResumes.map(resume => (
              <div key={resume.id} className="border p-4 rounded">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium truncate max-w-xs">
                      {resume.fileName || `Resume-${resume.id.slice(-5)}`}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {resume.skillsCount} skills • {new Date(resume.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button onClick={() => handleDeleteResume(resume.id)}>
                    <TrashIcon className="h-5 w-5 text-red-600" />
                  </button>
                </div>

                {/* Skills Section */}
                {resume.skills && resume.skills.length > 0 && (
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {resume.skills.map((skill: any, index: number) => (
                        <div
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                        >
                          <span>{skill.name}</span>
                          {skill.yearsOfExperience && (
                            <span className="ml-1 text-blue-600 text-xs">
                              ({skill.yearsOfExperience}y)
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extracted Text Preview */}
                {resume.extractedText && resume.extractedText.length > 0 && (
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Resume Content Preview</h4>
                    <div className="bg-gray-50 rounded-md p-3 max-h-32 overflow-y-auto">
                      <p className="text-sm text-gray-600 line-clamp-4">
                        {resume.extractedText.substring(0, 300)}
                        {resume.extractedText.length > 300 && '...'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;
