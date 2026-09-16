import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, User, AlertCircle, RefreshCw } from 'lucide-react';
import { calculateHealthScores } from './beginnerData';

const fmt = (n) =>
  '₹ ' + Number(n || 0).toLocaleString('en-IN');

export default function BeginnerProfileCard({ profile, onRetake }) {
  const scores = calculateHealthScores(profile);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--card-border)] pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] flex items-center justify-center font-bold shadow-md">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">AI Financial Profile</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 text-[10px] font-bold uppercase tracking-wider">
                {scores.healthStatus}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">Personalized based on your questionnaire responses</p>
          </div>
        </div>

        {onRetake && (
          <button
            onClick={onRetake}
            className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
            <span>Retake Questionnaire</span>
          </button>
        )}
      </div>

      {/* STEP 3 - 6 KEY METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {/* Metric 1: Experience */}
        <div className="bg-[var(--input-bg)] p-3.5 rounded-2xl border border-[var(--card-border)] space-y-1">
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Experience</span>
          <p className="text-sm font-bold text-[var(--text-primary)] truncate">
            {profile.priorInvestment === 'Never' ? 'Complete Beginner' : profile.priorInvestment === 'A little' ? 'Intermediate' : 'Experienced'}
          </p>
        </div>

        {/* Metric 2: Risk Profile */}
        <div className="bg-[var(--input-bg)] p-3.5 rounded-2xl border border-[var(--card-border)] space-y-1">
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Risk Profile</span>
          <p className="text-sm font-bold text-[var(--accent-gold)] truncate">{profile.riskTolerance} Risk</p>
        </div>

        {/* Metric 3: Monthly Savings */}
        <div className="bg-[var(--input-bg)] p-3.5 rounded-2xl border border-[var(--card-border)] space-y-1">
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Monthly Savings</span>
          <p className="text-sm font-bold text-[#22C55E] font-mono tabular-nums">{fmt(profile.monthlySavings)}</p>
        </div>

        {/* Metric 4: Suggested Investment */}
        <div className="bg-[var(--input-bg)] p-3.5 rounded-2xl border border-[var(--card-border)] space-y-1">
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Suggested SIP</span>
          <p className="text-sm font-bold text-[var(--accent-gold)] font-mono tabular-nums">{fmt(scores.suggestedMonthlyInvestment)}/mo</p>
        </div>

        {/* Metric 5: Primary Goal */}
        <div className="bg-[var(--input-bg)] p-3.5 rounded-2xl border border-[var(--card-border)] space-y-1">
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Primary Goal</span>
          <p className="text-sm font-bold text-[var(--text-primary)] truncate">
            {(profile.goals && profile.goals[0]) || 'Emergency Fund'}
          </p>
        </div>

        {/* Metric 6: Financial Health */}
        <div className="bg-[var(--input-bg)] p-3.5 rounded-2xl border border-[var(--card-border)] space-y-1">
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Overall Score</span>
          <p className="text-sm font-bold text-[#22C55E] font-mono tabular-nums">{scores.overall}/100</p>
        </div>
      </div>

      {/* STEP 6 - FINANCIAL HEALTH SCORE BREAKDOWN */}
      <div className="bg-[var(--input-bg)] rounded-2xl p-5 border border-[var(--card-border)] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--accent-gold)]" /> Financial Health Scorecard
          </h3>
          <span className="text-xs font-mono font-bold text-[var(--accent-gold)]">{scores.overall}/100 Points</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Budgeting', score: scores.budgetingScore, tip: 'Keep expenses <= 50% of income' },
            { label: 'Savings Rate', score: scores.savingsScore, tip: `${scores.savingsRate}% of income saved` },
            { label: 'Emergency Safety', score: scores.emergencyScore, tip: 'Aim for 3-6 months reserve' },
            { label: 'Knowledge Level', score: scores.knowledgeScore, tip: 'Complete Beginner Roadmap' },
            { label: 'Risk Awareness', score: scores.riskScore, tip: `${profile.riskTolerance} risk comfort` }
          ].map((item, idx) => (
            <div key={idx} className="bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--card-border)] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--text-secondary)] text-[11px]">{item.label}</span>
                <span className="font-mono font-bold text-[var(--accent-gold)] text-xs">{item.score}</span>
              </div>
              <div className="w-full bg-[var(--input-bg)] h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--accent-gold)] rounded-full transition-all duration-500"
                  style={{ width: `${item.score}%` }}
                />
              </div>
              <p className="text-[10px] text-[var(--text-muted)] truncate">{item.tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Notice */}
      <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30 text-xs font-medium text-[var(--text-primary)]">
        <ShieldCheck className="w-4 h-4 text-[var(--accent-gold)] shrink-0" />
        <span>
          <strong>Safety Commitment:</strong> Beginner Mode does NOT recommend individual stocks. Guidance is focused on core money management, index funds, SIPs, and asset allocation.
        </span>
      </div>
    </motion.div>
  );
}
