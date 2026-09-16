import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Bot, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles, 
  Zap, 
  PieChart, 
  CheckCircle2, 
  Lock,
  Activity,
  ArrowUpRight,
  BarChart3,
  Layers,
  Coins
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();

  return (
    <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-[85vh] transition-colors duration-300">
      
      {/* ── HERO SECTION ────────────────────────────────────────── */}
      <section className="relative pt-8 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading, Subtitle & Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-7 space-y-6 max-w-2xl"
          >
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Wealth Management</span>
            </div>

            {/* Main Heading: Mostly Black, only "Managed" in Gold */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.1]">
              Your Wealth, <br />
              Intelligently{' '}
              <span className={isDark ? 'text-[#D4AF37]' : 'text-[#C9A227]'}>
                Managed.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-xl">
              FinNova combines institutional portfolio algorithms with deep-learning AI to optimize tax strategies, manage investments, and build your emergency safety reserve.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to={isAuthenticated ? '/dashboard' : '/register'}
                className="btn-primary text-sm px-6 py-3.5 flex items-center gap-2 shadow-lg"
              >
                <span>{isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to={isAuthenticated ? '/ai-insights' : '/login'}
                className="btn-secondary text-sm px-6 py-3.5 flex items-center gap-2"
              >
                <Bot className="w-4 h-4 text-[var(--accent-gold)]" />
                <span>Explore AI Assistant</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-[var(--text-secondary)] font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                <span>SEBI Compliant Algorithms</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[var(--accent-gold)]" />
                <span>256-Bit SSL Encryption</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: AI Dashboard Visual Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-5 relative"
          >
            <div className="bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--card-border)] shadow-2xl relative space-y-4">
              
              {/* Mockup Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--card-border)]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] flex items-center justify-center font-bold">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--text-primary)]">FinNova AI Engine</p>
                    <p className="text-[10px] text-[#22C55E] font-semibold">● Real-time Optimization</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30 text-[10px] font-bold">
                  +18.4% Alpha
                </span>
              </div>

              {/* Mockup Stat Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-[var(--input-bg)] border border-[var(--card-border)] space-y-1">
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wider">Net Worth</span>
                  <p className="text-base font-bold text-[var(--text-primary)] font-mono">₹48,50,000</p>
                  <span className="text-[10px] text-[#22C55E] font-bold flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" /> +14.2% YoY
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--input-bg)] border border-[var(--card-border)] space-y-1">
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wider">Tax Savings</span>
                  <p className="text-base font-bold text-[#22C55E] font-mono">₹46,800</p>
                  <span className="text-[10px] text-[var(--accent-gold)] font-bold">80C Optimized</span>
                </div>
              </div>

              {/* Mockup Recommendation Box */}
              <div className="p-4 rounded-2xl bg-[var(--input-bg)] border border-[var(--accent-gold)]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--accent-gold)] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> High Impact AI Plan
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">94% Match</span>
                </div>
                <p className="text-xs font-semibold text-[var(--text-primary)]">Reallocate ₹12,500 into ELSS Tax Saver SIP</p>
                <div className="flex items-center justify-between pt-1 text-[11px] text-[var(--text-secondary)]">
                  <span>Est. Annual Benefit</span>
                  <span className="font-bold text-[#22C55E]">₹46,800 Saved</span>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-4 -left-4 bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xl rounded-2xl px-4 py-2.5 flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--text-primary)]">Health Score</p>
                  <p className="text-[10px] font-bold text-[#22C55E]">89 / 100 Optimal</p>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </section>

      {/* ── 3 MINI STATS CARDS (Elegant cards with hover animation) ───── */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--card-border)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)] shadow-md hover:border-[var(--accent-gold)]/40 transition-all duration-200 space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] flex items-center justify-center mb-3">
              <Coins className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)] font-mono tracking-tight">₹12L+</p>
            <p className="text-xs font-semibold text-[var(--accent-gold)]">Average Tax Saved</p>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Achieved across high net worth individuals utilizing AI 80C optimization strategies.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)] shadow-md hover:border-[#22C55E]/40 transition-all duration-200 space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold text-[#22C55E] font-mono tracking-tight">99.9%</p>
            <p className="text-xs font-semibold text-[#22C55E]">Platform Uptime</p>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Institutional SLA reliability powered by redundant Cloud infrastructure.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)] shadow-md hover:border-[var(--accent-gold)]/40 transition-all duration-200 space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] flex items-center justify-center mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)] font-mono tracking-tight">256-Bit</p>
            <p className="text-xs font-semibold text-[var(--accent-gold)]">Bank-Grade Encryption</p>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Zero-knowledge data security protocols protecting all transactions.
            </p>
          </motion.div>

        </div>
      </section>

      {/* ── FEATURE CARDS ───────────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            Institutional Wealth Features
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Designed for high earners, investors, and forward-thinking individuals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)] space-y-3 shadow-sm hover:border-[var(--accent-gold)]/40 transition-all">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">AI Assistant DeepSeek v4</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Ask natural language questions about budgeting, tax strategies, mutual funds, and emergency planning with instant context-aware analysis.
            </p>
          </div>

          <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)] space-y-3 shadow-sm hover:border-[var(--accent-gold)]/40 transition-all">
            <div className="w-9 h-9 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] flex items-center justify-center">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Automated Tax Optimization</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Identify Section 80C, 80D, and NPS tax saving gaps before year-end to maximize your post-tax wealth compound rate.
            </p>
          </div>

          <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)] space-y-3 shadow-sm hover:border-[var(--accent-gold)]/40 transition-all">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Financial Health Score</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Get an accurate 0-100 wealth readiness score calculated from debt ratios, liquid reserves, savings velocity, and asset allocation.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
