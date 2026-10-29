import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('interview_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success) {
            setUser(res.data.user);
          }
        } catch (err) {
          console.warn('Session expired or offline fallback active.');
          // Restore cached user info if available
          const cachedUser = localStorage.getItem('interview_user');
          if (cachedUser) {
            try {
              setUser(JSON.parse(cachedUser));
            } catch (e) {}
          }
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('interview_token', res.data.token);
        localStorage.setItem('interview_user', JSON.stringify(res.data.user));
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Login failed' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check your credentials.',
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data?.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('interview_token', res.data.token);
        localStorage.setItem('interview_user', JSON.stringify(res.data.user));
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Registration failed' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed. Try a different email.',
      };
    }
  };

  // Quick 1-click Demo Login for Recruiters / Evaluators
  const loginAsDemo = async (role = 'candidate') => {
    try {
      const res = await api.post('/auth/demo', { role });
      if (res.data?.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('interview_token', res.data.token);
        localStorage.setItem('interview_user', JSON.stringify(res.data.user));
        return { success: true };
      }
    } catch (e) {
      console.warn('Online demo login failed, using local demo fallback.');
    }

    const mockUser = {
      id: '66a1234567890123456789ab',
      _id: '66a1234567890123456789ab',
      name: role === 'admin' ? 'Admin Reviewer' : 'Placement Candidate',
      email: role === 'admin' ? 'admin@placement.edu' : 'candidate@placement.edu',
      role: role,
      targetRole: 'Full Stack Software Engineer (SDE-1)',
      targetCompany: 'Google / Amazon / Microsoft',
      experienceLevel: 'fresher',
      streak: { currentStreak: 5, longestStreak: 12, history: [new Date()] },
      overallReadinessScore: 86,
    };
    const mockToken = 'mock_jwt_token_' + Date.now();
    setToken(mockToken);
    setUser(mockUser);
    localStorage.setItem('interview_token', mockToken);
    localStorage.setItem('interview_user', JSON.stringify(mockUser));
    return { success: true };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('interview_token');
    localStorage.removeItem('interview_user');
  };

  const updateUserProfile = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
    localStorage.setItem('interview_user', JSON.stringify({ ...user, ...updatedUser }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        loginAsDemo,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
