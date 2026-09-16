import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Compass, ArrowRight } from 'lucide-react';

export default function BeginnerRecommendations({ profile, onSelectLevel }) {
  const recommendations = [
    {
      id: 1,
      title: 'Build an Emergency Fund',
      detail: `Based on your monthly expenses of ₹${(profile.monthlyExpenses || 25000).toLocaleString('en-IN')}, target an emergency fund of ₹${((profile.monthlyExpenses || 25000) * 6).toLocaleString('en-IN')} in a liquid reserve.`,
      action: 'Learn Level 3: Emergency Fund',
      targetLevelId: 3
    },
    {
      id: 2,
      title: 'Track Monthly Expenses',
      detail: 'Apply the 50/30/20 budgeting rule (50% Needs, 30% Wants, 20% Savings) to maintain strict control over cash flow.',
      action: 'Learn Level 2: Budgeting',
      targetLevelId: 2
    },
    {
      id: 3,
      title: 'Learn SIP Investing',
      detail: `Automate a monthly investment of ₹${(profile.monthlyInvestable || 3000).toLocaleString('en-IN')}/month to benefit from Rupee Cost Averaging.`,
      action: 'Learn Level 7: SIP',
      targetLevelId: 7
    },
    {
      id: 4,
      title: 'Understand Risk & Inflation',
      detail: 'Learn how inflation erodes purchasing power and how risk tolerance defines your optimal asset allocation.',
      action: 'Learn Level 4: Inflation',
      targetLevelId: 4
    },
    {
      id: 5,
      title: 'Start with Diversified Investments',
      detail: 'Avoid putting all money into a single stock. Use index funds, mutual funds, and gold to spread risk.',
      action: 'Learn Level 9: Diversification',
      targetLevelId: 9
    }
  ];

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
      <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[var(--accent-gold)]" />
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Smart Recommendations</h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Educational guidance tailored to your goals (No direct stock selling)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec) => (
          <motion.div
            key={rec.id}
            whileHover={{ y: -2 }}
            className="p-5 rounded-2xl bg-[var(--input-bg)] border border-[var(--card-border)] hover:border-[var(--accent-gold)]/50 transition-all flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                <h4 className="text-sm font-bold text-[var(--text-primary)]">{rec.title}</h4>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{rec.detail}</p>
            </div>

            {onSelectLevel && (
              <button
                onClick={() => onSelectLevel({ id: rec.targetLevelId })}
                className="text-xs font-bold text-[var(--accent-gold)] hover:underline flex items-center gap-1.5 pt-2 border-t border-[var(--card-border)] cursor-pointer"
              >
                <span>{rec.action}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
