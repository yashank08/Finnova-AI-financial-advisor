import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { Mail, Lock, Eye, EyeOff, TrendingUp, LogIn, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const registeredEmail = location.state?.registeredEmail || '';
  const initialMsg = location.state?.message || null;

  const [email, setEmail] = useState(registeredEmail);
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(
    initialMsg ? { type: 'success', message: initialMsg } : null
  );

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email address format.';
    if (!password) errs.password = 'Password is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login(email, password, rememberMe);
      setToast({ type: 'success', message: 'Login successful! Redirecting…' });
      setTimeout(() => {
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }, 1000);
    } catch (err) {
      let serverMsg = 'Invalid email or password. Please try again.';
      if (!err.response) {
        serverMsg = 'Cannot connect to backend server. Make sure the backend is running.';
      } else {
        const detail = err.response?.data?.detail;
        if (typeof detail === 'string') serverMsg = detail;
        else if (Array.isArray(detail) && detail.length > 0) serverMsg = detail[0].msg || 'Invalid login credentials.';
      }
      setToast({ type: 'error', message: serverMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('aarav.sharma@example.com');
    setPassword('FinPassword123!');
    setErrors({});
    setIsSubmitting(true);
    try {
      await login('aarav.sharma@example.com', 'FinPassword123!', true);
      setToast({ type: 'success', message: 'Demo login successful! Redirecting…' });
      setTimeout(() => {
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }, 800);
    } catch (err) {
      let serverMsg = 'Demo login failed.';
      if (!err.response) serverMsg = 'Cannot connect to backend server.';
      else if (err.response?.data?.detail) serverMsg = typeof err.response.data.detail === 'string' ? err.response.data.detail : 'Invalid credentials.';
      setToast({ type: 'error', message: serverMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[var(--bg-primary)] transition-colors duration-300">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm space-y-6"
      >
        {/* Logo mark */}
        <div className="flex items-center gap-3 justify-center">
          <div className="w-9 h-9 rounded-xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/40 text-[var(--accent-gold)] flex items-center justify-center font-bold shadow-md">
            <TrendingUp className="w-5 h-5 text-[var(--accent-gold)]" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold text-[var(--text-primary)]">FinNova</span>
        </div>

        <div className="bg-[var(--card-bg)] rounded-2xl p-7 border border-[var(--card-border)] shadow-2xl space-y-5">
          
          <div className="text-center">
            <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Sign in to your account</h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Institutional wealth management platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: '' })); }}
                  placeholder="name@example.com"
                  className={`input pl-10 ${errors.email ? 'border-[#EF4444]' : ''}`}
                />
              </div>
              {errors.email && <p className="mt-1 text-[11px] text-[#EF4444] font-medium">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-[var(--accent-gold)] hover:underline font-semibold">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: '' })); }}
                  placeholder="••••••••"
                  className={`input pl-10 pr-10 ${errors.password ? 'border-[#EF4444]' : ''}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-[11px] text-[#EF4444] font-medium">{errors.password}</p>}
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--input-border)] bg-[var(--input-bg)] accent-[var(--accent-gold)] cursor-pointer"
              />
              <span className="text-xs text-[var(--text-secondary)] font-medium">Keep me signed in</span>
            </label>

            {/* Submit */}
            <button type="submit" disabled={isSubmitting}
              className="w-full btn-primary justify-center py-2.5 text-xs font-bold shadow-md">
              {isSubmitting
                ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <LogIn className="w-4 h-4" />
              }
              <span>{isSubmitting ? 'Signing in…' : 'Sign in'}</span>
            </button>

            {/* Demo */}
            <button type="button" onClick={handleDemoLogin} disabled={isSubmitting}
              className="w-full btn-secondary justify-center py-2.5 text-xs font-semibold">
              <ArrowRight className="w-4 h-4 text-[var(--accent-gold)]" />
              <span>Try Demo Portfolio</span>
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-[var(--card-border)] text-center text-xs text-[var(--text-secondary)]">
            Don't have an account?{' '}
            <Link to="/register" className="text-[var(--accent-gold)] hover:underline font-bold">
              Create one
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
