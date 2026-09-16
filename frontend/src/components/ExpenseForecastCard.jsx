import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  BrainCircuit, 
  Loader2, 
  Info, 
  Sparkles,
  ShieldAlert,
  Coins,
  BarChart2
} from 'lucide-react';
import api from '../utils/api';

const fmt = (n) =>
  '₹ ' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ExpenseForecastCard() {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/ai/predict');
        setForecast(res.data);
      } catch (err) {
        console.error("Failed to fetch ML forecast:", err);
        setError('Could not fetch ML forecast.');
      } finally {
        setLoading(false);
      }
    };
    fetchForecast();
  }, []);

  if (loading) {
    return (
      <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)] shadow-xl flex items-center justify-center min-h-[180px]">
        <div className="flex items-center gap-3 text-xs font-semibold text-[var(--text-secondary)]">
          <Loader2 className="w-5 h-5 text-[var(--accent-gold)] animate-spin" />
          <span>Running ML Time-Series Models (Linear, Random Forest, Gradient Boosting)...</span>
        </div>
      </div>
    );
  }

  if (error || !forecast) {
    return (
      <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)] shadow-xl">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
          <ShieldAlert className="w-4 h-4" />
          <span>Expense Forecast Initializing</span>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mt-2">
          Add transactions to trigger the ML expense forecasting engine.
        </p>
      </div>
    );
  }

  const isColdStart = forecast.trainingMonths < 3 || forecast.modelUsed?.includes('Cold Start');
  const predictedVal = forecast.predictedExpense || 0;
  const trend = forecast.trend || 'stable';
  const modelName = forecast.modelUsed || 'Linear Regression';
  const mae = forecast.mae;
  const r2 = forecast.r2;

  const getTrendBadge = () => {
    if (trend === 'increasing') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Increasing ({forecast.forecastChangePct > 0 ? `+${forecast.forecastChangePct}%` : `${forecast.forecastChangePct}%`})</span>
        </span>
      );
    }
    if (trend === 'decreasing') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1">
          <TrendingDown className="w-3.5 h-3.5" />
          <span>Decreasing ({forecast.forecastChangePct}%</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center gap-1">
        <Minus className="w-3.5 h-3.5" />
        <span>Stable Trend</span>
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--accent-gold)]/40 shadow-2xl space-y-5 relative overflow-hidden"
    >
      {/* Background Accent glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--accent-gold)]/5 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--card-border)] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] flex items-center justify-center shrink-0 shadow-md">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                ML Expense Forecast
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {forecast.predictionMonthLabel || 'Next Month'}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">
              Multi-model Machine Learning time-series prediction
            </p>
          </div>
        </div>

        {getTrendBadge()}
      </div>

      {/* MAIN METRIC & BEST MODEL GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* PREDICTED EXPENSE */}
        <div className="bg-[var(--input-bg)] rounded-xl p-4 border border-[var(--card-border)] space-y-1">
          <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            Predicted Next Month Outflow
          </span>
          <p className="text-2xl font-bold text-[var(--text-primary)] font-mono tabular-nums">
            {fmt(predictedVal)}
          </p>
          <span className="text-[11px] text-[var(--text-muted)] block">
            Hist. Average: {fmt(forecast.historicalAverage)}
          </span>
        </div>

        {/* BEST MODEL SELECTED */}
        <div className="bg-[var(--input-bg)] rounded-xl p-4 border border-[var(--card-border)] space-y-1">
          <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
            <BarChart2 className="w-3.5 h-3.5 text-[var(--accent-gold)]" /> Best ML Model Selected
          </span>
          <p className="text-sm font-bold text-[var(--accent-gold)] truncate">
            {modelName}
          </p>
          <span className="text-[11px] text-[var(--text-muted)] block">
            Evaluated over {forecast.trainingMonths || 0} historical months
          </span>
        </div>

        {/* EXPECTED SAVINGS */}
        <div className="bg-[var(--input-bg)] rounded-xl p-4 border border-[var(--card-border)] space-y-1">
          <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-emerald-400" /> Expected Monthly Surplus
          </span>
          <p className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
            {fmt(forecast.expectedSavings)}
          </p>
          <span className="text-[11px] text-[var(--text-muted)] block">
            Net projected savings buffer
          </span>
        </div>

      </div>

      {/* METRICS BAR & COLD START BADGE */}
      <div className="pt-2 border-t border-[var(--card-border)] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 text-[var(--text-secondary)]">
          {mae !== null && mae !== undefined && (
            <span>
              <strong className="text-[var(--text-primary)]">MAE:</strong> ₹{Number(mae).toLocaleString('en-IN')}
            </span>
          )}
          {r2 !== null && r2 !== undefined && (
            <span>
              <strong className="text-[var(--text-primary)]">R² Score:</strong> {r2}
            </span>
          )}
          {isColdStart && (
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> Cold Start (Track 3+ months for multi-model ML)
            </span>
          )}
        </div>

        <p className="text-[11px] text-[var(--text-muted)] italic">
          {forecast.confidenceNote}
        </p>
      </div>

    </motion.div>
  );
}
