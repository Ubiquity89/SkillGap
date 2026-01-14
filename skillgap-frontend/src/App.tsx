import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import JobForm from './pages/JobForm';
import CreateAnalysis from './pages/CreateAnalysis';
import AnalysisResult from './pages/AnalysisResult';
import History from './pages/History';
import { isAuthenticated, setupAxiosAuth } from './services/authService';
import { auth } from './firebase';

function App() {
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Initialize auth and wait for Firebase to restore session
    const initializeAuth = async () => {
      console.log('🚀 App initialization started');
      
      // Setup axios with stored token first
      const hasToken = setupAxiosAuth();
      
      // Wait for Firebase auth to initialize and restore session
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        console.log('🔥 Firebase auth state changed:', {
          user: user ? 'User logged in' : 'User logged out',
          email: user?.email,
          uid: user?.uid
        });
        
        if (user && hasToken) {
          // Firebase user exists and we have a token - user is authenticated
          console.log('✅ User session restored successfully');
        } else if (!user && hasToken) {
          // We have a token but no Firebase user - clear the invalid token
          console.log('⚠️ Invalid token found, clearing...');
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
        } else {
          console.log('📝 User not logged in');
        }
        
        setAuthChecked(true);
      });
      
      return unsubscribe;
    };

    initializeAuth();
  }, []);

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!authChecked) {
      return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }
    
    if (!isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }
    
    return <>{children}</>;
  };

  // Auth-aware route for root path
  const RootRoute = () => {
    if (!authChecked) {
      return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }
    
    // Always show Landing page, regardless of auth state
    return <Landing />;
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Navbar />
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/resume-upload" element={
            <ProtectedRoute>
              <Navbar />
              <ResumeUpload />
            </ProtectedRoute>
          } />
          <Route path="/job-form" element={
            <ProtectedRoute>
              <Navbar />
              <JobForm />
            </ProtectedRoute>
          } />
          <Route path="/create-analysis" element={
            <ProtectedRoute>
              <Navbar />
              <CreateAnalysis />
            </ProtectedRoute>
          } />
          <Route path="/analysis/:id" element={
            <ProtectedRoute>
              <Navbar />
              <AnalysisResult />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <Navbar />
              <History />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
