import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SidebarProvider, useSidebar } from './context/SidebarContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ParticleBackground from './components/ParticleBackground';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GroupDiscussion from './pages/GroupDiscussion';
import ProjectDefense from './pages/ProjectDefense';
import Assessments from './pages/Assessments';
import MicroLearning from './pages/MicroLearning';
import Jobs from './pages/Jobs';
import Onboarding from './pages/Onboarding';
import ResumeUpload from './pages/ResumeUpload';
import TextInterview from './pages/TextInterview';
import CodeInterview from './pages/CodeInterview';
import VoiceInterview from './pages/VoiceInterview';
import Analytics from './pages/Analytics';
import AdminQuestions from './pages/AdminQuestions';

const AppLayout = () => {
  const { user } = useAuth();
  const { isOpen } = useSidebar();
  const location = useLocation();

  const isPublicPage = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-h-screen flex flex-col bg-dark-900 relative text-slate-100 font-sans">
      <ParticleBackground />
      <Navbar />

      <div className="flex-1 flex w-full relative z-10">
        {!isPublicPage && user && <Sidebar />}

        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 ${
            !isPublicPage && user ? (isOpen ? 'max-w-7xl' : 'max-w-[1400px]') : 'w-full'
          } mx-auto overflow-y-auto`}
        >
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gd"
              element={
                <ProtectedRoute>
                  <GroupDiscussion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview/project-defense"
              element={
                <ProtectedRoute>
                  <ProjectDefense />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assessment"
              element={
                <ProtectedRoute>
                  <Assessments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/learning"
              element={
                <ProtectedRoute>
                  <MicroLearning />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs"
              element={
                <ProtectedRoute>
                  <Jobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resume"
              element={
                <ProtectedRoute>
                  <ResumeUpload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview/text"
              element={
                <ProtectedRoute>
                  <TextInterview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview/code"
              element={
                <ProtectedRoute>
                  <CodeInterview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview/voice"
              element={
                <ProtectedRoute>
                  <VoiceInterview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/questions"
              element={
                <ProtectedRoute adminOnly>
                  <AdminQuestions />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Router>
          <AppLayout />
        </Router>
      </SidebarProvider>
    </AuthProvider>
  );
}

export default App;
