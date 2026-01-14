import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  DocumentArrowUpIcon, 
  BriefcaseIcon, 
  ChartBarIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';
import HomeNavbar from '../components/HomeNavbar';
import { isAuthenticated } from '../services/authService';

const Landing: React.FC = () => {
  const [isUserAuthenticated] = useState(isAuthenticated());
  const [isVisible, setIsVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => setStatsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <HomeNavbar />
      
      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className={`transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                Analyze Resume–Job Fit with
                <span className="text-primary-600 dark:text-primary-400"> Explainable Skill Matching</span>
              </h1>
              <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-3xl">
                Get ATS-style scoring with detailed skill gap analysis. No black-box AI - just clear, actionable insights for candidates and recruiters.
              </p>
              <div className="mt-8 flex justify-center sm:justify-start">
                <Link
                  to={isUserAuthenticated ? "/dashboard" : "/login"}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transform hover:scale-105 transition-all duration-300"
                >
                  Get Started
                  <ArrowRightIcon className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
            
            {/* Right Side - Sample Analysis Card */}
            <div className={`hidden lg:block transition-all duration-1000 ease-out delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sample Analysis</h3>
                  <span className="px-3 py-1 bg-success-100 text-success-800 text-sm font-medium rounded-full animate-pulse">
                    Strong Fit
                  </span>
                </div>
                
                {/* Match Score */}
                <div className="text-center mb-6">
                  <div className={`text-5xl font-bold text-primary-600 dark:text-primary-400 transition-all duration-1000 delay-500 ${statsVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>72%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Match Score</div>
                </div>
                
                {/* Skills Breakdown */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Matched Skills</span>
                      <span className="text-sm text-success-600 dark:text-success-400">8/10</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Node.js', 'MongoDB', 'Git'].map((skill) => (
                        <span key={skill} className="px-2 py-1 bg-success-100 text-success-800 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Missing Skills</span>
                      <span className="text-sm text-danger-600 dark:text-danger-400">2/5</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {['Docker', 'AWS'].map((skill) => (
                        <span key={skill} className="px-2 py-1 bg-danger-100 text-danger-800 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority Skills</span>
                      <span className="text-sm text-warning-600 dark:text-warning-400">3</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {['Docker', 'AWS', 'GraphQL'].map((skill) => (
                        <span key={skill} className="px-2 py-1 bg-warning-100 text-warning-800 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* How It Works */}
      <div className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Three simple steps to better hiring decisions</p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-full transform group-hover:scale-110 transition-all duration-300">
                  <DocumentArrowUpIcon className="w-8 h-8 text-primary-600 dark:text-primary-400 transition-transform duration-300 group-hover:rotate-12" />
                </div>
              </div>
              <div className="mb-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Upload Resume</h3>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">PDF parsing + skill extraction (no manual entry needed)</p>
              <p className="text-gray-600 dark:text-gray-300">Upload your resume or manually enter skills and experience</p>
            </div>
            <div className="text-center group">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-full transform group-hover:scale-110 transition-all duration-300">
                  <BriefcaseIcon className="w-8 h-8 text-primary-600 dark:text-primary-400 transition-transform duration-300 group-hover:rotate-12" />
                </div>
              </div>
              <div className="mb-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add Job Description</h3>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">AI-powered skill extraction from job requirements</p>
              <p className="text-gray-600 dark:text-gray-300">Input job requirements and desired skills</p>
            </div>
            <div className="text-center group">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-full transform group-hover:scale-110 transition-all duration-300">
                  <ChartBarIcon className="w-8 h-8 text-primary-600 dark:text-primary-400 transition-transform duration-300 group-hover:rotate-12" />
                </div>
              </div>
              <div className="mb-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Get Skill Gap Analysis</h3>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">ATS-style scoring + detailed skill breakdown</p>
              <p className="text-gray-600 dark:text-gray-300">Receive detailed match scores and actionable insights</p>
            </div>
          </div>
        </div>
      </div>

      {/* What You'll Get */}
      <div className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">What You'll Get</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Real, actionable insights - not just scores</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Screenshot */}
            <div className="order-2 lg:order-1">
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-600 p-4 shadow-lg transform hover:scale-105 transition-all duration-300">
                <div className="bg-white dark:bg-gray-800 rounded-md p-6 border border-gray-200 dark:border-gray-700 transform hover:shadow-xl transition-all duration-300">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Analysis Results</h4>
                    <span className="px-3 py-1 bg-success-100 text-success-800 text-sm font-medium rounded-full animate-pulse">
                      85% Match
                    </span>
                  </div>
                  
                  {/* Skills Overview */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-success-50 dark:bg-success-900 rounded-lg transform hover:scale-105 transition-all duration-300">
                      <div className="text-2xl font-bold text-success-600 dark:text-success-400">12</div>
                      <div className="text-sm text-success-700 dark:text-success-300">Matched Skills</div>
                    </div>
                    <div className="text-center p-4 bg-danger-50 dark:bg-danger-900 rounded-lg transform hover:scale-105 transition-all duration-300">
                      <div className="text-2xl font-bold text-danger-600 dark:text-danger-400">3</div>
                      <div className="text-sm text-danger-700 dark:text-danger-300">Missing Skills</div>
                    </div>
                  </div>
                  
                  {/* Skill Tags */}
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Matched:</div>
                      <div className="flex flex-wrap gap-1">
                        {['React', 'TypeScript', 'Node.js', 'MongoDB', 'AWS'].map((skill, index) => (
                          <span 
                            key={skill} 
                            className="px-2 py-1 bg-success-100 text-success-800 text-xs rounded transform hover:scale-110 transition-all duration-300"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Missing:</div>
                      <div className="flex flex-wrap gap-1">
                        {['Docker', 'GraphQL', 'Kubernetes'].map((skill, index) => (
                          <span 
                            key={skill} 
                            className="px-2 py-1 bg-danger-100 text-danger-800 text-xs rounded transform hover:scale-110 transition-all duration-300"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Live Analysis Results</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Detailed skill gap analysis with match scores</p>
                </div>
              </div>
            </div>
            
            {/* Features List */}
            <div className="order-1 lg:order-2">
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-success-100 text-success-600 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Match Score Logic</h4>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">ATS-style scoring based on skill relevance, experience level, and job requirements</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-success-100 text-success-600 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Skill Gap Reasoning</h4>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Clear explanations of why skills match or don't match with specific gaps identified</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-success-100 text-success-600 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Priority Skills</h4>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Identifies critical missing skills that will make the biggest impact</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-success-100 text-success-600 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Actionable Recommendations</h4>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">Specific suggestions for improving your resume and skill set</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why This Tool */}
      <div className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Why This Tool</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">ATS-style Scoring</h3>
              <p className="text-gray-600 dark:text-gray-300">Professional scoring system that matches real-world applicant tracking systems</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Explainable Results</h3>
              <p className="text-gray-600 dark:text-gray-300">Clear breakdown of why skills match or don't match, with actionable recommendations</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Black-box AI</h3>
              <p className="text-gray-600 dark:text-gray-300">Transparent analysis process that you can understand and trust</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack / Trust Strip */}
      <div className="py-8 bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Built with Modern Technology</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Professional-grade stack for reliable results</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 lg:gap-6">
            <div className="inline-flex items-center px-3 py-1.5 bg-blue-100 dark:bg-blue-900 rounded-full">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">⚛️ React</span>
            </div>
            <div className="inline-flex items-center px-3 py-1.5 bg-green-100 dark:bg-green-900 rounded-full">
              <span className="text-sm font-medium text-green-600 dark:text-green-400">🟢 Node.js</span>
            </div>
            <div className="inline-flex items-center px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900 rounded-full">
              <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">🔥 Firebase</span>
            </div>
            <div className="inline-flex items-center px-3 py-1.5 bg-purple-100 dark:bg-purple-900 rounded-full">
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">🤖 Gemini AI</span>
            </div>
            <div className="inline-flex items-center px-3 py-1.5 bg-red-100 dark:bg-red-900 rounded-full">
              <span className="text-sm font-medium text-red-600 dark:text-red-400">📊 ATS-Style</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p>&copy; 2026 SkillGap. Professional skill matching for modern hiring.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
