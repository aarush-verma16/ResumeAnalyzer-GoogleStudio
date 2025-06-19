
import React, { useState, useCallback } from 'react';
import { analyzeResumeAndJob } from './services/geminiService';
import { AnalysisResult } from './types';
import Loader from './components/Loader';
import DocumentArrowUpIcon from './components/icons/DocumentArrowUpIcon';
import BriefcaseIcon from './components/icons/BriefcaseIcon';
import SparklesIcon from './components/icons/SparklesIcon';
import LightBulbIcon from './components/icons/LightBulbIcon';
import CheckCircleIcon from './components/icons/CheckCircleIcon';
import AcademicCapIcon from './components/icons/AcademicCapIcon';


const App: React.FC = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf") {
        setResumeFile(file);
        setFileName(file.name);
        setError(null); 
      } else {
        setError("Please upload a PDF file.");
        setResumeFile(null);
        setFileName('');
      }
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!process.env.API_KEY) {
      setError("Configuration Error: API Key is missing. Please contact support or check environment variables.");
      setIsLoading(false);
      return;
    }
    if (!resumeFile) {
      setError('Please upload a resume PDF.');
      return;
    }
    if (!jobDescription.trim()) {
      setError('Please enter the job description.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeResumeAndJob(resumeFile, jobDescription);
      setAnalysisResult(result);
    } catch (err) {
      if (err instanceof Error) {
         setError(err.message);
      } else {
        setError('An unexpected error occurred during analysis.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [resumeFile, jobDescription]);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };
  
  const getScoreRingColor = (score: number): string => {
    if (score >= 80) return 'stroke-green-500';
    if (score >= 60) return 'stroke-yellow-500';
    if (score >= 40) return 'stroke-orange-500';
    return 'stroke-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <header className="w-full max-w-5xl mb-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-400 to-green-400">
          Resume Analyzer AI
        </h1>
        <p className="mt-2 text-slate-400 text-lg">
          Get an AI-powered match score and insights for your resume against any job description.
        </p>
      </header>

      <main className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="bg-slate-800 shadow-2xl rounded-xl p-6 space-y-6">
          <div>
            <label htmlFor="resume-upload" className="flex items-center text-lg font-semibold text-slate-300 mb-2">
              <DocumentArrowUpIcon className="w-6 h-6 mr-2 text-blue-400" />
              Upload Resume (PDF)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md hover:border-blue-400 transition-colors">
              <div className="space-y-1 text-center">
                <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-slate-500" />
                <div className="flex text-sm text-slate-400">
                  <label
                    htmlFor="resume-upload-input"
                    className="relative cursor-pointer bg-slate-700 rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-slate-800 focus-within:ring-blue-500 px-2 py-1"
                  >
                    <span>Upload a file</span>
                    <input id="resume-upload-input" name="resume-upload-input" type="file" className="sr-only" accept=".pdf" onChange={handleFileChange} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-slate-500">PDF up to 10MB</p>
                {fileName && <p className="text-sm text-green-400 mt-2">Selected: {fileName}</p>}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="job-description" className="flex items-center text-lg font-semibold text-slate-300 mb-2">
              <BriefcaseIcon className="w-6 h-6 mr-2 text-blue-400" />
              Job Description
            </label>
            <textarea
              id="job-description"
              rows={10}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-slate-200 placeholder-slate-500 resize-none"
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading || !resumeFile || !jobDescription.trim()}
            className="w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold py-3 px-4 rounded-md shadow-lg transform transition-all duration-150 ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 group"
          >
            <SparklesIcon className="w-5 h-5 mr-2 group-hover:animate-pulse" />
            {isLoading ? 'Analyzing...' : 'Analyze Resume'}
          </button>
          {error && <p className="mt-4 text-sm text-red-400 bg-red-900 bg-opacity-30 p-3 rounded-md animate-pulse">{error}</p>}
        </div>

        {/* Results Section */}
        <div className="bg-slate-800 shadow-2xl rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-slate-300 mb-4 text-center">Analysis Results</h2>
          {isLoading && <Loader />}
          {!isLoading && !analysisResult && !error && (
            <div className="text-center text-slate-500 py-10">
              <SparklesIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Your analysis will appear here once you submit a resume and job description.</p>
            </div>
          )}
          
          {analysisResult && (
            <div className="space-y-6 animate-fadeIn">
              {/* Score */}
              <div className="text-center p-6 bg-slate-700 rounded-lg shadow-inner">
                 <div className="relative inline-block mb-2">
                    <svg className="w-32 h-32" viewBox="0 0 36 36">
                        <path className="text-slate-600 stroke-current"
                            strokeWidth="2" fill="none"
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path className={`${getScoreRingColor(analysisResult.score)} stroke-current`}
                            strokeWidth="2" fill="none"
                            strokeDasharray={`${analysisResult.score}, 100`}
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                    </svg>
                    <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-bold ${getScoreColor(analysisResult.score)}`}>
                        {analysisResult.score}
                    </div>
                </div>
                <p className={`text-xl font-semibold ${getScoreColor(analysisResult.score)}`}>Match Score</p>
                <p className="text-sm text-slate-400 mt-1">out of 100</p>
              </div>

              {/* Analysis Text */}
              <div>
                <h3 className="flex items-center text-xl font-semibold text-slate-300 mb-2">
                  <AcademicCapIcon className="w-6 h-6 mr-2 text-teal-400" />
                  AI Analysis
                </h3>
                <p className="text-slate-400 bg-slate-700 p-4 rounded-md shadow-inner">{analysisResult.analysis}</p>
              </div>

              {/* Strengths */}
              <div>
                <h3 className="flex items-center text-xl font-semibold text-slate-300 mb-2">
                  <CheckCircleIcon className="w-6 h-6 mr-2 text-green-400" />
                  Key Strengths
                </h3>
                <ul className="space-y-2">
                  {analysisResult.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start p-3 bg-slate-700 rounded-md shadow-inner">
                      <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-slate-300">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              <div>
                <h3 className="flex items-center text-xl font-semibold text-slate-300 mb-2">
                  <LightBulbIcon className="w-6 h-6 mr-2 text-yellow-400" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {analysisResult.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start p-3 bg-slate-700 rounded-md shadow-inner">
                      <LightBulbIcon className="w-5 h-5 text-yellow-400 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-slate-300">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
      <footer className="w-full max-w-5xl mt-12 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Resume Analyzer AI. Powered by Gemini.</p>
        <p className="mt-1">This tool provides an automated analysis and should be used as a guide, not a definitive assessment.</p>
      </footer>
    </div>
  );
};

export default App;
