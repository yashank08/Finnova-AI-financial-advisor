import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import AIInsights from './pages/AIInsights';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import BeginnerMode from './pages/BeginnerMode';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans transition-colors duration-300">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Unauthenticated / Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

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
                  path="/financial-compass" 
                  element={
                    <ProtectedRoute>
                      <BeginnerMode />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/beginner-mode" 
                  element={
                    <ProtectedRoute>
                      <BeginnerMode />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/transactions" 
                  element={
                    <ProtectedRoute>
                      <Transactions />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/ai-insights" 
                  element={
                    <ProtectedRoute>
                      <AIInsights />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/reports" 
                  element={
                    <ProtectedRoute>
                      <Reports />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
