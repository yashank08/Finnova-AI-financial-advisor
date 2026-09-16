import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import FinancialAssistant from '../components/FinancialAssistant';
import AIInsightsDashboard from '../components/AIInsightsDashboard';
import { Bot, Sparkles } from 'lucide-react';

export default function AIInsights() {
  const location = useLocation();
  const initialPrompt = location.state?.initialPrompt || null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-[85vh] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 bg-[var(--bg-primary)] transition-colors duration-300">
      
      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[var(--card-border)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Powered by OpenRouter AI
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            AI Assistant & Insights
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium">
            Ask questions, optimize tax strategies, and analyze portfolio health in real-time.
          </p>
        </div>
      </div>

      {/* 1. CHATBOT INTERFACE */}
      <FinancialAssistant initialPrompt={initialPrompt} />

      {/* 2. AI PORTFOLIO INSIGHTS CARDS */}
      <AIInsightsDashboard />
    </div>
  );
}
