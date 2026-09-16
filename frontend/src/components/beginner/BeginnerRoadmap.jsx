import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Lock, Clock, BookOpen, ArrowRight } from 'lucide-react';
import { ROADMAP_LEVELS } from './beginnerData';

export default function BeginnerRoadmap({ completedLevels = [], onSelectLevel, currentLevelId }) {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--card-border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🧭</span>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Your Financial Roadmap</h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Step-by-step masterclass to transform from beginner to confident investor
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-mono font-bold text-[var(--accent-gold)] px-3 py-1.5 rounded-xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30">
            {completedLevels.length} / {ROADMAP_LEVELS.length} Levels Completed
          </span>
        </div>
      </div>

      {/* 10-LEVEL CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {ROADMAP_LEVELS.map((level, idx) => {
          const isCompleted = completedLevels.includes(level.id);
          // Level 1 is always unlocked. Subsequent levels unlock if previous level is completed.
          const isUnlocked = level.id === 1 || completedLevels.includes(level.id - 1) || isCompleted;
          const isActive = currentLevelId === level.id;

          return (
            <motion.div
              key={level.id}
              whileHover={isUnlocked ? { y: -2 } : {}}
              onClick={() => isUnlocked && onSelectLevel(level)}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3 relative overflow-hidden select-none ${
                isActive
                  ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/15 shadow-lg ring-1 ring-[var(--accent-gold)]'
                  : isCompleted
                  ? 'border-[#22C55E]/40 bg-[#22C55E]/10'
                  : isUnlocked
                  ? 'border-[var(--card-border)] bg-[var(--input-bg)] hover:border-[var(--accent-gold)]/60 cursor-pointer'
                  : 'border-[var(--card-border)]/50 bg-[var(--bg-secondary)]/50 opacity-60 cursor-not-allowed'
              }`}
            >
              {/* Level Badge Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[var(--accent-gold)]">
                  Level {level.id}
                </span>

                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                ) : !isUnlocked ? (
                  <Lock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-gold)] animate-pulse" />
                )}
              </div>

              {/* Icon & Title */}
              <div className="space-y-1">
                <span className="text-2xl block">{level.icon}</span>
                <h3 className="text-xs font-bold text-[var(--text-primary)] leading-snug line-clamp-1">
                  {level.title}
                </h3>
                <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 leading-tight">
                  {level.subtitle}
                </p>
              </div>

              {/* Footer Meta */}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--card-border)]/60 text-[10px] text-[var(--text-muted)]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {level.readTime}
                </span>
                <span className="font-semibold px-2 py-0.5 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)]">
                  {level.difficulty}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
