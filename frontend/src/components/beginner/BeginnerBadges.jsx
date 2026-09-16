import React from 'react';
import { motion } from 'framer-motion';
import { Award, Lock, CheckCircle2 } from 'lucide-react';
import { BADGES_LIST } from './beginnerData';

export default function BeginnerBadges({ completedLevels = [] }) {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
      <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[var(--accent-gold)]" />
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Achievements</h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Unlock financial milestones as you progress through lessons
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {BADGES_LIST.map((badge) => {
          const isUnlocked = badge.id === 'first_lesson'
            ? completedLevels.length > 0
            : badge.id === 'wealth_architect'
            ? completedLevels.length >= 10
            : completedLevels.includes(badge.unlockedAtLevel);

          return (
            <motion.div
              key={badge.id}
              whileHover={isUnlocked ? { scale: 1.04 } : {}}
              className={`p-4 rounded-2xl border text-center space-y-2 relative transition-all select-none ${
                isUnlocked
                  ? 'bg-[var(--accent-gold)]/10 border-[var(--accent-gold)]/50 shadow-md'
                  : 'bg-[var(--input-bg)] border-[var(--card-border)] opacity-50 grayscale'
              }`}
            >
              <div className="relative inline-block">
                <span className="text-3xl block">{badge.icon}</span>
                {isUnlocked ? (
                  <span className="absolute -bottom-1 -right-1 bg-[#22C55E] text-[#000000] p-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </span>
                ) : (
                  <span className="absolute -bottom-1 -right-1 bg-[var(--card-border)] text-[var(--text-muted)] p-0.5 rounded-full">
                    <Lock className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-[var(--text-primary)] leading-tight">{badge.title}</h4>
                <p className="text-[10px] text-[var(--text-secondary)] leading-tight mt-1 line-clamp-2">
                  {badge.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
