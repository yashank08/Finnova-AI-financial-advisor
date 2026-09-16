import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Globe, ShieldCheck, User, Mail, Edit2, Check, X } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || user?.fullName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const displayUsername = user?.username || user?.fullName || 'User';

  const handleSaveUsername = async (e) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    setIsSubmitting(true);
    try {
      if (updateProfile) {
        await updateProfile({
          username: newUsername.trim(),
          fullName: newUsername.trim()
        });
      }
      setMessage({ type: 'success', text: 'Username updated successfully!' });
      setIsEditing(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update username.' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    { label: 'Username', value: displayUsername, icon: <User className="w-3.5 h-3.5" />, editable: true },
    { label: 'Email Address', value: user?.email || 'N/A', icon: <Mail className="w-3.5 h-3.5" />, editable: false },
    { label: 'Country / Nationality', value: user?.nationality || 'India', icon: <Globe className="w-3.5 h-3.5" />, editable: false },
    { label: 'Preferred Currency', value: '₹ Indian Rupee (INR)', icon: '₹', editable: false },
  ];

  return (
    <div className="min-h-[85vh] py-8 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-6 bg-[var(--bg-primary)] transition-colors duration-300">
      
      <div className="border-b border-[var(--card-border)] pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">Account Profile</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Your account information and platform preferences</p>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-xs font-medium border ${
          message.type === 'success' ? 'bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E]' : 'bg-[#EF4444]/10 border-[#EF4444]/20 text-[#EF4444]'
        }`}>
          {message.text}
        </div>
      )}

      {/* Account Card */}
      <div className="bg-[var(--card-bg)] rounded-2xl p-6 sm:p-7 border border-[var(--card-border)] shadow-xl space-y-6">
        {/* Avatar row */}
        <div className="flex items-center justify-between pb-5 border-b border-[var(--card-border)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] flex items-center justify-center text-lg font-bold shadow-md">
              {displayUsername.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)] leading-tight">{displayUsername}</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                <span className="text-[11px] text-[#22C55E] font-semibold">256-Bit Encrypted Account</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setNewUsername(displayUsername);
              setIsEditing(!isEditing);
            }}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Inline Edit Username Form */}
        {isEditing && (
          <form onSubmit={handleSaveUsername} className="bg-[var(--input-bg)] p-4 rounded-xl border border-[var(--accent-gold)]/40 space-y-3">
            <label className="text-xs font-bold text-[var(--text-primary)] block">Update Username</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter new username"
                className="flex-1 input text-xs py-2 px-3"
                autoFocus
              />
              <button
                type="submit"
                disabled={isSubmitting || !newUsername.trim()}
                className="btn-primary text-xs py-2 px-3 flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" /> Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn-secondary text-xs py-2 px-3 flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            </div>
          </form>
        )}

        {/* Account Details & Preferences */}
        <div>
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            Account Details &amp; Preferences
          </span>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)]">
                <div className="w-8 h-8 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center text-[var(--accent-gold)] text-xs font-bold shrink-0">
                  {f.icon}
                </div>
                <div className="flex-1">
                  <span className="text-[11px] text-[var(--text-secondary)] block">{f.label}</span>
                  <p className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">{f.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
