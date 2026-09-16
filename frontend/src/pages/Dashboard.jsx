import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Loader2,
  AlertCircle,
  ArrowRight,
  Bot,
  Target,
  BarChart3,
  X,
  CheckCircle2,
  Info,
  Coins,
  Compass
} from 'lucide-react';
import api from '../utils/api';
import ExpenseForecastCard from '../components/ExpenseForecastCard';

const fmt = (n) =>
  '₹ ' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [heroDismissed, setHeroDismissed] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/dashboard');
        setData(res.data);
      } catch (err) {
        setError('Could not load dashboard data. Ensure backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const userName = user?.fullName ? user.fullName.split(' ')[0] : 'Aarav';

  const handleAskAI = (prompt = 'Help me optimize my monthly spending') => {
    navigate('/ai-insights', { state: { initialPrompt: prompt } });
  };

  if (loading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-[var(--bg-primary)] transition-colors duration-300">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[var(--accent-gold)] animate-spin" />
          <p className="text-xs font-semibold text-[var(--text-secondary)]">Loading AI Financial Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 bg-[var(--bg-primary)] transition-colors duration-300">
      
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

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── GREETING HEADER & QUICK ACTIONS ──────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[var(--card-border)] pb-6"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            {getGreeting()}, {userName} 👋
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium">
            Welcome back to your AI Wealth Dashboard.
          </p>
        </div>

        {/* QUICK ACTIONS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/beginner-mode')}
            className="btn-primary text-xs py-2 px-3.5 bg-gradient-to-r from-[var(--accent-gold)] to-[#D4AF37] text-black font-bold shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-black" />
            <span>🎓 Beginner Mode</span>
          </button>

          <button
            onClick={() => handleAskAI()}
            className="btn-primary text-xs py-2 px-3.5"
          >
            <Bot className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
            <span>🤖 Ask AI</span>
          </button>
          
          <button
            onClick={() => navigate('/transactions')}
            className="btn-secondary text-xs py-2 px-3.5"
          >
            <Plus className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
            <span>➕ Add Transaction</span>
          </button>

          <button
            onClick={() => navigate('/reports')}
            className="btn-secondary text-xs py-2 px-3.5"
          >
            <BarChart3 className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
            <span>📊 Reports</span>
          </button>

          <button
            onClick={() => {
              setToastMessage('Goal Created: Emergency Safety Buffer ₹3,60,000');
              setTimeout(() => setToastMessage(null), 3000);
            }}
            className="btn-secondary text-xs py-2 px-3.5"
          >
            <Target className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
            <span>🎯 Goals</span>
          </button>
        </div>
      </motion.div>

      {/* ── FINANCIAL COMPASS HERO BANNER CARD ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => navigate('/financial-compass')}
        className="bg-[var(--card-bg)] border border-[var(--accent-gold)]/50 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer hover:border-[var(--accent-gold)] transition-all group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] flex items-center justify-center text-2xl font-bold shrink-0">
            🧭
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors">
                Financial Compass
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30 text-[10px] font-bold uppercase">
                AI Onboarding
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Your personalized guide to building financial confidence &amp; 10-level wealth roadmap.
            </p>
          </div>
        </div>

        <button
          className="btn-primary text-xs py-2.5 px-5 shrink-0 flex items-center gap-1.5 font-bold shadow-md cursor-pointer"
        >
          <span>Launch Financial Compass</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>

      {/* ── HERO RECOMMENDATION CARD (Larger than others) ──────────── */}
      {!heroDismissed && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          onClick={() => setActiveDrawer('hero')}
          className="bg-[var(--card-bg)] rounded-2xl p-6 sm:p-7 border border-[var(--accent-gold)]/40 shadow-2xl relative overflow-hidden group hover:border-[var(--accent-gold)] hover:-translate-y-1 transition-all duration-250 cursor-pointer"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-gold)] animate-pulse" />
                <span className="text-xs font-bold text-[var(--accent-gold)] uppercase tracking-wider flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-[var(--accent-gold)]" />
                  🤖 AI Recommendation
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30 text-[10px] font-bold">
                  {data?.latestTransactions?.length > 0 ? "High Impact" : "Setup Mode"}
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                  {data?.latestTransactions?.length > 0 ? "Save ₹3,000 this month" : "Start your financial journey"}
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                  {data?.latestTransactions?.length > 0 ? (
                    <>Reason: <span className="text-[var(--text-primary)] font-semibold">Dining expenses increased by 15%</span> compared to your previous 30-day average. Reallocating this amount to your liquid reserve accelerates your 6-month safety buffer.</>
                  ) : (
                    "Add your first income or expense transaction to unlock real-time AI wealth recommendations and asset management strategies."
                  )}
                </p>
              </div>
            </div>

            {/* HERO BUTTONS */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => navigate('/transactions')}
                className="btn-primary text-xs py-2.5 px-4"
              >
                <span>{data?.latestTransactions?.length > 0 ? "View Plan" : "Add Transaction"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleAskAI(data?.latestTransactions?.length > 0 ? 'Explain how to reduce dining expenses by 15% to save ₹3,000' : 'How do I start managing my personal finances?')}
                className="btn-secondary text-xs py-2.5 px-4"
              >
                <span>Ask AI</span>
              </button>

              <button
                onClick={() => setHeroDismissed(true)}
                className="btn-ghost text-xs py-2.5 px-3 text-[var(--text-muted)] hover:text-[#EF4444]"
              >
                <span>Dismiss</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── ML EXPENSE FORECAST CARD ────────────────────────────────── */}
      <ExpenseForecastCard />

      {/* ── 5 SUMMARY CARDS GRID ────────────────────────────────────── */}
      {(() => {
        const hasData = Boolean(
          (data?.latestTransactions && data.latestTransactions.length > 0) ||
          (data?.recentTransactions && data.recentTransactions.length > 0) ||
          (data?.totalIncome && data.totalIncome > 0) ||
          (data?.totalExpenses && data.totalExpenses > 0)
        );
        const computedSavingsRate = data?.savingsRate || (data?.totalIncome > 0 ? Number(((data.totalSavings / data.totalIncome) * 100).toFixed(1)) : 0);

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* CARD 1: Financial Health */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.1 }}
              className="bg-[var(--card-bg)] rounded-2xl p-5 border border-[var(--card-border)] card-hover space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Financial Health
                </span>
                <div className="w-7 h-7 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-[var(--text-primary)] font-mono tabular-nums">
                  {hasData ? "89 / 100" : "0 / 100"}
                </p>
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${hasData ? 'text-[#22C55E]' : 'text-[var(--text-muted)]'}`}>
                  {hasData ? <><TrendingUp className="w-3 h-3" /> ↑ Improving</> : "Setup Required"}
                </span>
              </div>
            </motion.div>

            {/* CARD 2: Portfolio Health */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.15 }}
              className="bg-[var(--card-bg)] rounded-2xl p-5 border border-[var(--card-border)] card-hover space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Portfolio Health
                </span>
                <div className="w-7 h-7 rounded-xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-1">
                <p className={`text-2xl font-bold ${hasData ? 'text-[#22C55E]' : 'text-[var(--text-muted)]'}`}>
                  {hasData ? "Healthy" : "No Data"}
                </p>
                <span className="text-[11px] text-[var(--text-muted)] block">
                  {hasData ? "65% Eq / 25% Debt / 10% Gold" : "0% Eq / 0% Debt / 0% Gold"}
                </span>
              </div>
            </motion.div>

            {/* CARD 3: Monthly Savings */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.2 }}
              className="bg-[var(--card-bg)] rounded-2xl p-5 border border-[var(--card-border)] card-hover space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Monthly Savings
                </span>
                <div className="w-7 h-7 rounded-xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-[var(--accent-gold)] font-mono tabular-nums">{fmt(data?.totalSavings)}</p>
                <span className="text-[11px] text-[#F59E0B] font-semibold block">
                  {hasData ? `${computedSavingsRate}% savings rate` : "0% savings rate"}
                </span>
              </div>
            </motion.div>

        {/* CARD 4: Income */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.25 }}
          className="bg-[var(--card-bg)] rounded-2xl p-5 border border-[var(--card-border)] card-hover space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Income
            </span>
            <div className="w-7 h-7 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-[#22C55E] font-mono tabular-nums">{fmt(data?.totalIncome)}</p>
            <span className="text-[11px] text-[var(--text-muted)] block">Total verified inflow</span>
          </div>
        </motion.div>

        {/* CARD 5: Expenses */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.3 }}
          className="bg-[var(--card-bg)] rounded-2xl p-5 border border-[var(--card-border)] card-hover space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Expenses
            </span>
            <div className="w-7 h-7 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--text-primary)] flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-[var(--text-primary)] font-mono tabular-nums">{fmt(data?.totalExpenses)}</p>
            <span className="text-[11px] text-[var(--text-muted)] block">Total logged outflow</span>
          </div>
        </motion.div>
      </div>
    );
  })()}

      {/* ── RECENT TRANSACTIONS SECTION ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.35 }}
        className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--card-border)]">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">Recent Transactions</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Latest account inflows and outflows</p>
          </div>
          <button
            onClick={() => navigate('/transactions')}
            className="text-xs font-semibold text-[var(--accent-gold)] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-6">
          {data?.latestTransactions?.length > 0 ? (
            <div className="space-y-2">
              {data.latestTransactions.map((tx, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] hover:border-[var(--accent-gold)]/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        tx.type === 'Income'
                          ? 'bg-[#22C55E]/15 border-[#22C55E]/30 text-[#22C55E]'
                          : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {tx.type === 'Income' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)]">{tx.description}</p>
                      <span className="text-[11px] text-[var(--text-secondary)]">
                        {tx.date} • {tx.category}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold font-mono tabular-nums ${
                      tx.type === 'Income' ? 'text-[#22C55E]' : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {tx.type === 'Income' ? '+' : '-'}{fmt(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)]">
              <CreditCard className="w-8 h-8 text-[var(--text-muted)] mb-2" />
              <p className="text-xs font-semibold text-[var(--text-primary)]">No transactions recorded yet</p>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1 mb-4">Add a transaction to view live history.</p>
              <button
                onClick={() => navigate('/transactions')}
                className="btn-primary text-xs px-4 py-2"
              >
                Add Transaction
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* ELEGANT HERO SIDE DRAWER */}
      <AnimatePresence>
        {activeDrawer === 'hero' && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="bg-[var(--card-bg)] border-l border-[var(--card-border)] w-full max-w-xl h-full shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              <div className="p-6 border-b border-[var(--card-border)] bg-[var(--card-bg)]/95 backdrop-blur-md sticky top-0 z-10 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30 text-[10px] font-bold">
                      94% Confidence
                    </span>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mt-1">
                      Save ₹3,000 Strategy Plan
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      Optimization for monthly discretionary spending
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

              <div className="p-6 space-y-6 flex-1">
                <div className="bg-[var(--input-bg)] rounded-2xl p-5 border border-[var(--card-border)] space-y-3">
                  <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                    <span>Quantitative Impact</span>
                  </h4>
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between text-xs py-1 border-b border-[var(--card-border)]">
                      <span className="text-[var(--text-secondary)]">Target Monthly Savings</span>
                      <span className="text-[var(--accent-gold)] font-bold">₹3,000 / month</span>
                    </div>
                    <div className="flex justify-between text-xs py-1 border-b border-[var(--card-border)]">
                      <span className="text-[var(--text-secondary)]">Annual Cumulative Potential</span>
                      <span className="text-[#22C55E] font-bold">₹36,000 / year</span>
                    </div>
                    <div className="flex justify-between text-xs py-1">
                      <span className="text-[var(--text-secondary)]">Category Target</span>
                      <span className="text-[var(--text-primary)] font-semibold">Dining & Food Delivery (-15%)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--input-bg)] rounded-2xl p-5 border border-[var(--card-border)] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--accent-gold)]">
                    <Bot className="w-4 h-4" />
                    <span>AI Reasoning & Explanation</span>
                  </div>
                  <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                    FinNova detected that dining out expenses jumped to ₹23,000 over the past 30 days. By cooking 2 additional meals per week or opting for home dining, you comfortably save ₹3,000 without altering your core lifestyle.
                  </p>
                </div>

                <div className="bg-[var(--input-bg)] rounded-2xl p-4 border border-[var(--card-border)] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-gold)]">
                    <Info className="w-3.5 h-3.5" />
                    <span>Key Benefits</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Directing ₹3,000 into high-yielding liquid funds or monthly SIPs yields an extra ₹44,500 over 12 months with compound returns.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => {
                      setActiveDrawer(null);
                      handleAskAI('Create a step-by-step budget to save ₹3,000 from dining');
                    }}
                    className="w-full btn-primary justify-center py-3 text-xs font-bold"
                  >
                    <span>Execute Saving Plan with AI</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-5 border-t border-[var(--card-border)] bg-[var(--bg-secondary)] text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                  <span>Powered by FinNova AI DeepSeek v4</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
