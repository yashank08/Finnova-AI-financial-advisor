import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { Mail, KeyRound, Lock, Eye, EyeOff, ArrowLeft, CheckCircle, TrendingUp } from 'lucide-react';

export default function ForgotPassword() {
  const { forgotPassword, resetPassword } = useAuth();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const handleRequestToken = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Please enter a valid email address.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await forgotPassword(email);
      setToast({ type: 'success', message: res.message });
      if (res.reset_token) {
        setResetToken(res.reset_token);
        setStep(2);
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to request password reset.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    if (!resetToken.trim()) errs.resetToken = 'Reset token is required.';
    if (!newPassword) errs.newPassword = 'New password is required.';
    else if (newPassword.length < 8) errs.newPassword = 'Must be at least 8 characters.';
    else if (!/[A-Z]/.test(newPassword)) errs.newPassword = 'Must contain an uppercase letter.';
    else if (!/[a-z]/.test(newPassword)) errs.newPassword = 'Must contain a lowercase letter.';
    else if (!/\d/.test(newPassword)) errs.newPassword = 'Must contain a number.';
    else if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(newPassword)) errs.newPassword = 'Must contain a special character.';

    if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPassword(resetToken, newPassword);
      setToast({ type: 'success', message: res.message });
      setStep(3);
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to reset password. Check your reset token.'
      });
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
          
          {step === 1 && (
            <>
              <div className="text-center">
                <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Reset Password</h1>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Enter your registered email address to get a reset token</p>
              </div>

              <form onSubmit={handleRequestToken} className="space-y-4">
                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setErrors({}); }}
                      placeholder="name@example.com"
                      className={`input pl-10 ${errors.email ? 'border-[#EF4444]' : ''}`}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-[11px] text-[#EF4444] font-medium">{errors.email}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary justify-center py-2.5 text-xs font-bold shadow-md"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Request Reset Token</span>
                  )}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center">
                <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Set New Password</h1>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Token generated for {email}</p>
              </div>

              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <label className="label">Reset Token</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      value={resetToken}
                      onChange={e => setResetToken(e.target.value)}
                      placeholder="Paste your reset token..."
                      className={`input pl-10 font-mono ${errors.resetToken ? 'border-[#EF4444]' : ''}`}
                    />
                  </div>
                  {errors.resetToken && <p className="mt-1 text-[11px] text-[#EF4444] font-medium">{errors.resetToken}</p>}
                </div>

                <div>
                  <label className="label">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`input pl-10 pr-10 ${errors.newPassword ? 'border-[#EF4444]' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="mt-1 text-[11px] text-[#EF4444] font-medium">{errors.newPassword}</p>}
                </div>

                <div>
                  <label className="label">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
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

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary justify-center py-2.5 text-xs font-bold shadow-md"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Reset Password</span>
                  )}
                </button>
              </form>
            </>
          )}

          {step === 3 && (
            <div className="text-center space-y-4 py-3">
              <div className="w-12 h-12 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Password Reset Complete</h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Your password has been successfully updated.</p>
              </div>
              <Link
                to="/login"
                className="w-full btn-primary justify-center py-2.5 text-xs font-bold shadow-md inline-flex"
              >
                Sign In Now
              </Link>
            </div>
          )}

          <div className="mt-5 pt-5 border-t border-[var(--card-border)] text-center text-xs text-[var(--text-secondary)]">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-[var(--accent-gold)] hover:underline font-semibold">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
