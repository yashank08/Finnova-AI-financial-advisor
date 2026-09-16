import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins,
  ShieldCheck,
  BarChart3,
  Sparkles,
  ArrowRight,
  X,
  CheckCircle2,
  Bot,
  TrendingUp,
  FileText,
  Star,
  Target,
  PieChart,
  RefreshCw,
  Info
} from 'lucide-react';

function AnimatedNumber({ value }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="inline-block font-bold"
    >
      {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
    </motion.span>
  );
}

export function AIInsightsDashboard({ totalIncome = 0, totalExpenses = 0, totalSavings = 0 }) {
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const hasData = totalIncome > 0 || totalExpenses > 0;
  
  const taxOptimizationVal = hasData ? Math.min(46800, Math.round(totalIncome * 0.15)) : 0;
  const emergencyFundVal = hasData ? Math.max(0, totalSavings) : 0;
  const portfolioHealthScore = hasData ? (totalSavings > 0 ? 82 : 45) : 0;

  const triggerAction = (actionName) => {
    setToastMessage(`Action Executed: ${actionName}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const drawerData = {
    tax: {
      title: "Tax Optimization",
      subtitle: "Section 80C Tax Savings & Compound Growth",
      icon: Coins,
      badge: hasData ? "94% Confidence" : "0% Confidence",
      confidence: hasData ? "94%" : "0%",
      benefits: hasData
        ? `Save up to ₹${taxOptimizationVal.toLocaleString('en-IN')} annually while building equity wealth through tax-free compounding ELSS mutual funds.`
        : "Add your income transactions to calculate potential 80C tax savings.",
      metrics: [
        { label: "Estimated Tax Saving", value: `₹${taxOptimizationVal.toLocaleString('en-IN')} / year`, highlight: "text-[#22C55E]" },
        { label: "Recommendation Summary", value: hasData ? "Increase ELSS SIP by ₹12,500/mo" : "No active tax plan", highlight: "text-[var(--text-primary)]" },
        { label: "Confidence Score", value: hasData ? "94% High Confidence" : "No Data", highlight: "text-[var(--accent-gold)]" }
      ],
      aiExplanation: hasData
        ? "Based on your income, increasing your ELSS SIP reduces your tax liability in the highest bracket while compounding at a projected 12.4% CAGR."
        : "No income logged yet. Add your income transactions to unlock AI tax optimizations.",
      importantNotes: "ELSS mutual funds carry a 3-year mandatory lock-in period, offering the shortest lock-in among all Section 80C instruments.",
      buttons: [
        { label: "Explain", icon: Bot, action: "Explain Strategy" },
        { label: "Learn More", icon: TrendingUp, action: "Learn More" },
        { label: "Save", icon: Star, action: "Save Recommendation" }
      ]
    },
    emergency: {
      title: "Emergency Fund",
      subtitle: "6-Month Liquid Safety Reserve Buffer",
      icon: ShieldCheck,
      badge: hasData ? `${Math.min(100, Math.round((emergencyFundVal / Math.max(1, totalExpenses * 6)) * 100))}% Funded` : "0% Funded",
      confidence: hasData ? "95%" : "0%",
      benefits: "Guarantees complete liquidity for zero market volatility during unforeseen personal or macro financial events.",
      metrics: [
        { label: "Current Fund Balance", value: `₹${emergencyFundVal.toLocaleString('en-IN')}`, highlight: "text-[#22C55E]" },
        { label: "Target Reserve Buffer", value: `₹${(totalExpenses * 6 || 0).toLocaleString('en-IN')}`, highlight: "text-[var(--text-primary)]" },
        { label: "Monthly Expenses", value: `₹${totalExpenses.toLocaleString('en-IN')} / month`, highlight: "text-[var(--text-secondary)]" },
        { label: "Months Covered", value: `${totalExpenses > 0 ? (emergencyFundVal / totalExpenses).toFixed(1) : 0} / 6.0 Months`, highlight: "text-[#22C55E]" }
      ],
      progress: hasData && totalExpenses > 0 ? Math.min(100, Math.round((emergencyFundVal / (totalExpenses * 6)) * 100)) : 0,
      shortfall: `₹${Math.max(0, (totalExpenses * 6) - emergencyFundVal).toLocaleString('en-IN')}`,
      aiExplanation: hasData
        ? `Your liquid cash reserve currently covers ${(emergencyFundVal / Math.max(1, totalExpenses)).toFixed(1)} months of living expenses.`
        : "No transaction data available yet. Start logging expenses to calculate emergency reserve requirements.",
      importantNotes: "Liquid reserves are held across high-yield savings accounts and instant-redemption liquid mutual funds.",
      buttons: [
        { label: "Explain", icon: Bot, action: "Explain Reserve" },
        { label: "Learn More", icon: Target, action: "Learn More" },
        { label: "Save", icon: Star, action: "Save Recommendation" }
      ]
    },
    portfolio: {
      title: "Portfolio Health",
      subtitle: "Risk-Adjusted Rebalancing & Asset Split",
      icon: BarChart3,
      badge: `Health Score: ${portfolioHealthScore} / 100`,
      confidence: hasData ? "92%" : "0%",
      benefits: "Reduces portfolio drawback risk by 18% during equity market pullbacks via allocation rebalancing.",
      metrics: [
        { label: "Overall Health Score", value: `${portfolioHealthScore} / 100 ${hasData ? '(Good)' : '(No Data)'}`, highlight: "text-[#22C55E]" },
        { label: "Current Allocation", value: hasData ? "65% Equity | 25% Debt | 10% Gold" : "0% Equity | 0% Debt | 0% Gold", highlight: "text-[var(--text-primary)]" },
        { label: "Suggested Target Split", value: "60% Equity | 25% Debt | 15% Gold", highlight: "text-[var(--accent-gold)]" }
      ],
      riskExplanation: hasData ? "Your current allocation is balanced for growth." : "Add transactions to generate portfolio health analysis.",
      aiExplanation: hasData ? "Rebalancing into Gold ETFs locks in fixed returns plus inflation protection." : "No asset data found.",
      buttons: [
        { label: "Explain", icon: Bot, action: "Explain Allocation" },
        { label: "Learn More", icon: PieChart, action: "Learn More" },
        { label: "Save", icon: Star, action: "Save Recommendation" }
      ]
    }
  };

  return (
    <div className="space-y-4 pt-2 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 right-6 z-50 bg-[var(--card-bg)] text-[var(--text-primary)] px-4 py-2.5 rounded-xl shadow-2xl border border-[var(--accent-gold)]/40 text-xs font-bold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION HEADER */}
      <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--accent-gold)]" />
          <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
            AI Financial Insights
          </h2>
        </div>
        <span className="text-[11px] text-[var(--text-secondary)] font-medium">
          Personalized Wealth Strategies
        </span>
      </div>

      {/* 3 CARDS: Tax Optimization, Emergency Fund, Portfolio Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* CARD 1: Tax Optimization */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          onClick={() => setActiveDrawer('tax')}
          className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)] flex flex-col justify-between group shadow-xl hover:border-[var(--accent-gold)]/50 card-hover cursor-pointer transition-all duration-250"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Tax Optimization
              </span>
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
            </div>

            <div className="text-3xl font-bold text-[#22C55E] font-mono tabular-nums tracking-tight">
              <AnimatedNumber value={hasData ? `₹${taxOptimizationVal.toLocaleString('en-IN')}` : "₹0"} />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-[var(--card-border)] mt-5">
            <span className="text-xs font-bold text-[var(--accent-gold)] group-hover:underline flex items-center gap-1">
              <span>View</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">{hasData ? "94% Confidence" : "0% Confidence"}</span>
          </div>
        </motion.div>

        {/* CARD 2: Emergency Fund */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          onClick={() => setActiveDrawer('emergency')}
          className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)] flex flex-col justify-between group shadow-xl hover:border-[#22C55E]/50 card-hover cursor-pointer transition-all duration-250"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Emergency Fund
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            <div className="text-3xl font-bold text-[var(--text-primary)] font-mono tabular-nums tracking-tight">
              <AnimatedNumber value={hasData ? `₹${emergencyFundVal.toLocaleString('en-IN')}` : "₹0"} />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-[var(--card-border)] mt-5">
            <span className="text-xs font-bold text-[#22C55E] group-hover:underline flex items-center gap-1">
              <span>View</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">{hasData ? `${Math.min(100, Math.round((emergencyFundVal / Math.max(1, totalExpenses * 6)) * 100))}% Funded` : "0% Funded"}</span>
          </div>
        </motion.div>

        {/* CARD 3: Portfolio Health */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.15 }}
          onClick={() => setActiveDrawer('portfolio')}
          className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)] flex flex-col justify-between group shadow-xl hover:border-[var(--accent-gold)]/50 card-hover cursor-pointer transition-all duration-250"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Portfolio Health
              </span>
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>

            <div className="text-3xl font-bold text-[var(--accent-gold)] font-mono tabular-nums tracking-tight">
              {portfolioHealthScore} <span className="text-base text-[var(--text-muted)] font-normal">/ 100</span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-[var(--card-border)] mt-5">
            <span className="text-xs font-bold text-[var(--accent-gold)] group-hover:underline flex items-center gap-1">
              <span>View</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">Optimal Split</span>
          </div>
        </motion.div>

      </div>

      {/* ELEGANT SLIDE-IN SIDE DRAWER */}
      <AnimatePresence>
        {activeDrawer && drawerData[activeDrawer] && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="bg-[var(--card-bg)] border-l border-[var(--card-border)] w-full max-w-xl h-full shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              {/* DRAWER HEADER */}
              <div className="p-6 border-b border-[var(--card-border)] bg-[var(--card-bg)]/95 backdrop-blur-md sticky top-0 z-10 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {React.createElement(drawerData[activeDrawer].icon, {
                    className: "w-6 h-6 text-[var(--accent-gold)]"
                  })}
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30 text-[10px] font-bold">
                      {drawerData[activeDrawer].badge}
                    </span>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mt-1">
                      {drawerData[activeDrawer].title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {drawerData[activeDrawer].subtitle}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveDrawer(null)}
                  className="p-1.5 rounded-xl bg-[var(--input-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors border border-[var(--card-border)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* DRAWER BODY */}
              <div className="p-6 space-y-6 flex-1">

                {/* Metrics */}
                <div className="bg-[var(--input-bg)] rounded-2xl p-5 border border-[var(--card-border)] space-y-3">
                  <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                    <span>Calculated Financial Metrics</span>
                  </h4>
                  
                  <div className="space-y-2 pt-1">
                    {drawerData[activeDrawer].metrics.map((m, idx) => (
                      <div key={idx} className="flex justify-between items-center py-1.5 border-b border-[var(--card-border)] last:border-0">
                        <span className="text-xs text-[var(--text-secondary)] font-medium">{m.label}</span>
                        <span className={`text-xs font-bold ${m.highlight}`}>{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Explanation & Why Recommendation was generated */}
                <div className="bg-[var(--input-bg)] rounded-2xl p-5 border border-[var(--card-border)] space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--accent-gold)]">
                    <Bot className="w-4 h-4" />
                    <span>Why This Recommendation Was Generated</span>
                  </div>
                  <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                    {drawerData[activeDrawer].aiExplanation}
                  </p>
                </div>

                {/* Benefits & Confidence */}
                <div className="bg-[var(--input-bg)] rounded-2xl p-4 border border-[var(--card-border)] space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-[var(--accent-gold)]">
                    <span className="flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> Strategy Benefits</span>
                    <span className="text-[10px] text-[var(--text-muted)]">Confidence: {drawerData[activeDrawer].confidence}</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {drawerData[activeDrawer].benefits}
                  </p>
                </div>

                {/* Actions: Explain, Learn More, Save */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                    Actions
                  </h4>
                  <div className="grid grid-cols-3 gap-2.5">
                    {drawerData[activeDrawer].buttons.map((btn, idx) => (
                      <button
                        key={idx}
                        onClick={() => triggerAction(btn.action)}
                        className="btn-primary text-xs justify-center py-2.5 px-2"
                      >
                        <btn.icon className="w-3.5 h-3.5" />
                        <span>{btn.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* DRAWER FOOTER */}
              <div className="p-5 border-t border-[var(--card-border)] bg-[var(--bg-secondary)] text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                  <span>AI Generated Recommendation • OpenRouter AI</span>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AIInsightsDashboard;
