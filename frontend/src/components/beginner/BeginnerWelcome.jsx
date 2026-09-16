import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, Sparkles, ArrowRight, ShieldCheck, Award, BookOpen, ChevronDown } from 'lucide-react';

export default function BeginnerWelcome({ onStart, hasProfile }) {
  const [showMore, setShowMore] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="bg-[var(--card-bg)] border border-[var(--accent-gold)]/40 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden text-center max-w-3xl mx-auto"
    >
      {/* Background Subtle Glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-[var(--accent-gold)]/10 blur-3xl pointer-events-none" />

      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/40 text-[var(--accent-gold)] flex items-center justify-center shadow-xl">
          <Compass className="w-8 h-8 text-[var(--accent-gold)] animate-pulse" />
        </div>

        <span className="px-3.5 py-1 rounded-full bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> AI-Powered Guided Onboarding
        </span>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight">
          Financial <span className="text-[var(--accent-gold)]">Compass</span>
        </h1>

        <p className="text-sm sm:text-lg font-semibold text-[var(--accent-gold)] max-w-xl">
          "Your personalized guide to building financial confidence."
        </p>

        <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl leading-relaxed">
          Whether you're managing your first salary, learning to save, or preparing to invest, Financial Compass creates a personalized roadmap based on your goals and financial experience.
        </p>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="bg-[var(--input-bg)] p-4 rounded-2xl border border-[var(--card-border)] space-y-2 text-left">
          <div className="w-8 h-8 rounded-xl bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] flex items-center justify-center font-bold">
            <Compass className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-[var(--text-primary)]">Personalized Assessment</h4>
          <p className="text-[11px] text-[var(--text-secondary)]">Custom roadmap based on your income, savings &amp; risk profile.</p>
        </div>

        <div className="bg-[var(--input-bg)] p-4 rounded-2xl border border-[var(--card-border)] space-y-2 text-left">
          <div className="w-8 h-8 rounded-xl bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] flex items-center justify-center font-bold">
            <BookOpen className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-[var(--text-primary)]">10-Level Roadmap</h4>
          <p className="text-[11px] text-[var(--text-secondary)]">Master money basics, emergency funds &amp; SIPs step-by-step.</p>
        </div>

        <div className="bg-[var(--input-bg)] p-4 rounded-2xl border border-[var(--card-border)] space-y-2 text-left">
          <div className="w-8 h-8 rounded-xl bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] flex items-center justify-center font-bold">
            <Award className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-[var(--text-primary)]">AI Coach &amp; Badges</h4>
          <p className="text-[11px] text-[var(--text-secondary)]">Earn achievement badges and get jargon-free AI coaching.</p>
        </div>
      </div>

      {/* Secondary Info Accordion */}
      {showMore && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-5 rounded-2xl bg-[var(--input-bg)] border border-[var(--card-border)] text-left text-xs space-y-2 text-[var(--text-secondary)]"
        >
          <h5 className="font-bold text-[var(--text-primary)]">Why Financial Compass?</h5>
          <p>
            Financial Compass is designed to remove the complexity from personal finance. We start with a quick 10-question assessment to map out your risk profile, savings capacity, and primary goals. Then, our AI Coach provides simple lessons, quizzes, and real-time guidance without confusing jargon.
          </p>
        </motion.div>
      )}

      {/* Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={onStart}
          className="btn-primary text-sm px-8 py-3.5 rounded-2xl w-full sm:w-auto shadow-xl flex items-center justify-center gap-2 group cursor-pointer"
        >
          <span>{hasProfile ? 'Continue My Journey' : 'Start My Journey'}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={() => setShowMore(!showMore)}
          className="btn-secondary text-sm px-6 py-3.5 rounded-2xl w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Learn More</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showMore ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-muted)] pt-2">
        <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
        <span>No stock recommendations. Pure financial literacy &amp; wealth habits.</span>
      </div>
    </motion.div>
  );
}
