import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from local or session storage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('finnova_token') || sessionStorage.getItem('finnova_token');
      const storedUser = localStorage.getItem('finnova_user') || sessionStorage.getItem('finnova_user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify with backend
          const res = await api.get('/users/me');
          setUser(res.data);
        } catch (err) {
          console.warn("Session token expired or invalid:", err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password, rememberMe) => {
    const response = await api.post('/auth/login', { email, password, rememberMe });
    const { access_token, user: userData } = response.data;

    setToken(access_token);
    setUser(userData);

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('finnova_token', access_token);
    storage.setItem('finnova_user', JSON.stringify(userData));

    return userData;
  };

  const register = async (formData) => {
    const response = await api.post('/auth/register', formData);
    return response.data;
  };

  const updateProfile = async (updatedData) => {
    const response = await api.put('/users/profile', updatedData);
    const updatedUser = response.data;
    setUser(updatedUser);
    const storage = localStorage.getItem('finnova_token') ? localStorage : sessionStorage;
    storage.setItem('finnova_user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  const forgotPassword = async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  };

  const resetPassword = async (token, newPassword, confirmPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword, confirmPassword });
    return response.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('finnova_token');
    localStorage.removeItem('finnova_user');
    sessionStorage.removeItem('finnova_token');
    sessionStorage.removeItem('finnova_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        register,
        updateProfile,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
