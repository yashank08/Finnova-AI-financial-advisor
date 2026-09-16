import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { nationalities } from '../utils/countries';
import Toast from '../components/Toast';
import { 
  User, 
  Mail, 
  Lock, 
  Globe, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  ArrowRight
} from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    nationality: '',
    acceptTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const passwordCriteria = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(formData.password)
  };

  const validateField = (name, value) => {
    let err = '';
    if (name === 'fullName' && !value.trim()) {
      err = 'Full Name is required.';
    } else if (name === 'email') {
      if (!value.trim()) err = 'Email address is required.';
      else if (!/\S+@\S+\.\S+/.test(value)) err = 'Please enter a valid email address.';
    } else if (name === 'password') {
      if (!value) err = 'Password is required.';
      else if (value.length < 8) err = 'Password must be at least 8 characters long.';
      else if (!/[A-Z]/.test(value)) err = 'Password must contain at least one uppercase letter.';
      else if (!/[a-z]/.test(value)) err = 'Password must contain at least one lowercase letter.';
      else if (!/\d/.test(value)) err = 'Password must contain at least one number.';
      else if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(value)) err = 'Password must contain at least one special character.';
    } else if (name === 'confirmPassword') {
      if (!value) err = 'Please confirm your password.';
      else if (value !== formData.password) err = 'Passwords do not match.';
    } else if (name === 'nationality') {
      if (!value) err = 'Please select your country of residence.';
    } else if (name === 'acceptTerms') {
      if (!value) err = 'You must accept the Terms of Service to continue.';
    }
    return err;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (name === 'password' && formData.confirmPassword) {
      if (formData.confirmPassword !== value) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    const err = validateField(name, val);
    if (err) {
      setErrors(prev => ({ ...prev, [name]: err }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setToast({
        type: 'error',
        message: 'Please fix the errors in the form before submitting.'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        fullName: formData.fullName.trim(),
        username: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.password,
        nationality: formData.nationality || 'Indian',
        acceptTerms: true
      });

      setToast({
        type: 'success',
        message: 'Registration successful! Redirecting to login…'
      });

      setTimeout(() => {
        navigate('/login', { 
          state: { 
            registeredEmail: formData.email.trim(),
            message: 'Account created successfully! Please sign in.' 
          } 
        });
      }, 1500);

    } catch (err) {
      let serverMsg = 'Registration failed. Please try again.';
      if (!err.response) {
        serverMsg = 'Cannot connect to backend server. Make sure the backend is running.';
      } else {
        const detail = err.response?.data?.detail;
        if (typeof detail === 'string') {
          serverMsg = detail;
        } else if (Array.isArray(detail) && detail.length > 0) {
          serverMsg = detail[0].msg || 'Validation error occurred.';
        }
      }

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
        className="w-full max-w-md space-y-6"
      >
        {/* Logo Mark */}
        <div className="flex items-center gap-3 justify-center">
          <div className="w-9 h-9 rounded-xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/40 text-[var(--accent-gold)] flex items-center justify-center font-bold shadow-md">
            <TrendingUp className="w-5 h-5 text-[var(--accent-gold)]" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold text-[var(--text-primary)]">FinNova</span>
        </div>

        <div className="bg-[var(--card-bg)] rounded-2xl p-7 border border-[var(--card-border)] shadow-2xl space-y-5">
          
          <div className="text-center">
            <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Create your account</h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Start optimizing your financial wealth with AI</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. Aarav Sharma"
                  className={`input pl-10 ${errors.fullName ? 'border-[#EF4444]' : ''}`}
                />
              </div>
              {errors.fullName && <p className="mt-1 text-[11px] text-[#EF4444] font-medium">{errors.fullName}</p>}
            </div>

            {/* Email Address */}
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="name@example.com"
                  className={`input pl-10 ${errors.email ? 'border-[#EF4444]' : ''}`}
                />
              </div>
              {errors.email && <p className="mt-1 text-[11px] text-[#EF4444] font-medium">{errors.email}</p>}
            </div>

            {/* Country of Residence */}
            <div>
              <label className="label">Country of Residence</label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
                <select
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input pl-10 ${errors.nationality ? 'border-[#EF4444]' : ''}`}
                >
                  <option value="" disabled>Select your country...</option>
                  {nationalities.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
              {errors.nationality && <p className="mt-1 text-[11px] text-[#EF4444] font-medium">{errors.nationality}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  className={`input pl-10 pr-10 ${errors.password ? 'border-[#EF4444]' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-[11px] text-[#EF4444] font-medium">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  className={`input pl-10 pr-10 ${errors.confirmPassword ? 'border-[#EF4444]' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-[11px] text-[#EF4444] font-medium">{errors.confirmPassword}</p>}
            </div>

            {/* Terms Checkbox */}
            <div>
              <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-4 h-4 rounded border-[var(--input-border)] bg-[var(--input-bg)] accent-[var(--accent-gold)] cursor-pointer mt-0.5"
                />
                <span className="text-xs text-[var(--text-secondary)] leading-tight">
                  I agree to the <span className="text-[var(--accent-gold)] hover:underline font-semibold">Terms of Service</span> and <span className="text-[var(--accent-gold)] hover:underline font-semibold">Privacy Policy</span>.
                </span>
              </label>
              {errors.acceptTerms && <p className="mt-1 text-[11px] text-[#EF4444] font-medium">{errors.acceptTerms}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary justify-center py-2.5 text-xs font-bold shadow-md mt-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              <span>{isSubmitting ? 'Creating account…' : 'Create Account'}</span>
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-[var(--card-border)] text-center text-xs text-[var(--text-secondary)]">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--accent-gold)] hover:underline font-bold">
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
