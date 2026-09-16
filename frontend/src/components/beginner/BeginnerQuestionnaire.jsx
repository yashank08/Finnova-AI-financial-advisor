import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

const GOAL_OPTIONS = [
  'Emergency Fund', 'Buy a Car', 'Buy a House',
  'Retirement', 'Travel', 'Wealth Creation',
  'Education', 'Just Learning'
];

const OCCUPATION_OPTIONS = [
  'Student', 'Salaried Employee', 'Business Owner', 'Freelancer', 'Other'
];

const PRIOR_INVESTMENT_OPTIONS = ['Never', 'A little', 'Yes'];
const RISK_OPTIONS = ['Very Low', 'Low', 'Medium', 'High'];
const TIMELINE_OPTIONS = ['1 Year', '3 Years', '5 Years', '10+ Years'];

export default function BeginnerQuestionnaire({ initialAnswers, onComplete, onCancel }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [formData, setFormData] = useState({ ...initialAnswers });
  const [errorMsg, setErrorMsg] = useState('');

  const totalSteps = 10;
  const progressPercent = Math.round(((currentIndex + 1) / totalSteps) * 100);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrorMsg('');
  };

  const toggleGoal = (goal) => {
    setFormData(prev => {
      const current = prev.goals || [];
      if (current.includes(goal)) {
        return { ...prev, goals: current.filter(g => g !== goal) };
      } else {
        return { ...prev, goals: [...current, goal] };
      }
    });
    setErrorMsg('');
  };

  const handleNext = () => {
    // Validate current step
    if (currentIndex === 0 && (!formData.age || formData.age < 15 || formData.age > 100)) {
      setErrorMsg('Please enter a valid age between 15 and 100.');
      return;
    }
    if (currentIndex === 2 && (formData.monthlyIncome === '' || formData.monthlyIncome < 0)) {
      setErrorMsg('Please enter a valid monthly income.');
      return;
    }
    if (currentIndex === 3 && (formData.monthlySavings === '' || formData.monthlySavings < 0)) {
      setErrorMsg('Please enter valid monthly savings.');
      return;
    }
    if (currentIndex === 4 && (formData.monthlyExpenses === '' || formData.monthlyExpenses < 0)) {
      setErrorMsg('Please enter valid monthly expenses.');
      return;
    }
    if (currentIndex === 6 && (!formData.goals || formData.goals.length === 0)) {
      setErrorMsg('Please select at least one financial goal.');
      return;
    }
    if (currentIndex === 8 && (formData.monthlyInvestable === '' || formData.monthlyInvestable < 0)) {
      setErrorMsg('Please enter a valid investable amount.');
      return;
    }

    if (currentIndex < totalSteps - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete(formData);
    }
  };

  const handlePrev = () => {
    setErrorMsg('');
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      
      {/* Progress Bar & Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
          <span className="text-[var(--accent-gold)] uppercase tracking-wider font-mono">
            Financial Assessment • Question {currentIndex + 1} of {totalSteps}
          </span>
          <span className="font-mono">{progressPercent}% Completed</span>
        </div>

        <div className="w-full bg-[var(--input-bg)] h-2 rounded-full overflow-hidden border border-[var(--card-border)]">
          <motion.div
            className="h-full bg-gradient-to-r from-[var(--accent-gold)] to-[#F59E0B]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Dynamic Question Container */}
      <div className="min-h-[220px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {/* Q1: Age */}
            {currentIndex === 0 && (
              <div className="space-y-4">
                <label className="block text-lg font-bold text-[var(--text-primary)]">
                  1. What is your age?
                </label>
                <input
                  type="number"
                  min="15"
                  max="100"
                  value={formData.age}
                  onChange={(e) => updateField('age', Number(e.target.value))}
                  placeholder="e.g. 25"
                  className="w-full bg-[var(--input-bg)] text-[var(--text-primary)] text-lg rounded-2xl p-4 border border-[var(--input-border)] focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[var(--accent-gold)]/20 focus:outline-none transition-all font-mono"
                  autoFocus
                />
              </div>
            )}

            {/* Q2: Occupation */}
            {currentIndex === 1 && (
              <div className="space-y-4">
                <label className="block text-lg font-bold text-[var(--text-primary)]">
                  2. What is your occupation?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {OCCUPATION_OPTIONS.map((occ) => (
                    <button
                      key={occ}
                      type="button"
                      onClick={() => updateField('occupation', occ)}
                      className={`p-4 rounded-2xl border text-left font-semibold text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${
                        formData.occupation === occ
                          ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] shadow-md'
                          : 'border-[var(--card-border)] bg-[var(--input-bg)] text-[var(--text-primary)] hover:border-[var(--accent-gold)]/40'
                      }`}
                    >
                      <span>{occ}</span>
                      {formData.occupation === occ && <CheckCircle2 className="w-4 h-4 text-[var(--accent-gold)]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Q3: Monthly Income */}
            {currentIndex === 2 && (
              <div className="space-y-4">
                <label className="block text-lg font-bold text-[var(--text-primary)]">
                  3. What is your Monthly Income? (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.monthlyIncome}
                  onChange={(e) => updateField('monthlyIncome', Number(e.target.value))}
                  placeholder="e.g. 45000"
                  className="w-full bg-[var(--input-bg)] text-[var(--text-primary)] text-lg rounded-2xl p-4 border border-[var(--input-border)] focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[var(--accent-gold)]/20 focus:outline-none transition-all font-mono"
                  autoFocus
                />
              </div>
            )}

            {/* Q4: Monthly Savings */}
            {currentIndex === 3 && (
              <div className="space-y-4">
                <label className="block text-lg font-bold text-[var(--text-primary)]">
                  4. What are your average Monthly Savings? (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={formData.monthlySavings}
                  onChange={(e) => updateField('monthlySavings', Number(e.target.value))}
                  placeholder="e.g. 12000"
                  className="w-full bg-[var(--input-bg)] text-[var(--text-primary)] text-lg rounded-2xl p-4 border border-[var(--input-border)] focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[var(--accent-gold)]/20 focus:outline-none transition-all font-mono"
                  autoFocus
                />
              </div>
            )}

            {/* Q5: Monthly Expenses */}
            {currentIndex === 4 && (
              <div className="space-y-4">
                <label className="block text-lg font-bold text-[var(--text-primary)]">
                  5. What are your Monthly Expenses? (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={formData.monthlyExpenses}
                  onChange={(e) => updateField('monthlyExpenses', Number(e.target.value))}
                  placeholder="e.g. 25000"
                  className="w-full bg-[var(--input-bg)] text-[var(--text-primary)] text-lg rounded-2xl p-4 border border-[var(--input-border)] focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[var(--accent-gold)]/20 focus:outline-none transition-all font-mono"
                  autoFocus
                />
              </div>
            )}

            {/* Q6: Prior Investment */}
            {currentIndex === 5 && (
              <div className="space-y-4">
                <label className="block text-lg font-bold text-[var(--text-primary)]">
                  6. Have you ever invested before?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PRIOR_INVESTMENT_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField('priorInvestment', opt)}
                      className={`p-4 rounded-2xl border text-center font-semibold text-sm transition-all cursor-pointer ${
                        formData.priorInvestment === opt
                          ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] shadow-md'
                          : 'border-[var(--card-border)] bg-[var(--input-bg)] text-[var(--text-primary)] hover:border-[var(--accent-gold)]/40'
                      }`}
                    >
                      <span>{opt}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Q7: Financial Goals */}
            {currentIndex === 6 && (
              <div className="space-y-4">
                <label className="block text-lg font-bold text-[var(--text-primary)]">
                  7. What are your primary financial goals? <span className="text-xs font-normal text-[var(--text-secondary)]">(Select all that apply)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {GOAL_OPTIONS.map((goal) => {
                    const isChecked = (formData.goals || []).includes(goal);
                    return (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => toggleGoal(goal)}
                        className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                          isChecked
                            ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] shadow-sm'
                            : 'border-[var(--card-border)] bg-[var(--input-bg)] text-[var(--text-primary)] hover:border-[var(--accent-gold)]/40'
                        }`}
                      >
                        <span className="truncate">{goal}</span>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-gold)] shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Q8: Risk Comfort */}
            {currentIndex === 7 && (
              <div className="space-y-5">
                <label className="block text-lg font-bold text-[var(--text-primary)]">
                  8. How comfortable are you with risk?
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {RISK_OPTIONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => updateField('riskTolerance', r)}
                      className={`p-4 rounded-2xl border text-center font-bold text-sm transition-all cursor-pointer ${
                        formData.riskTolerance === r
                          ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] shadow-md'
                          : 'border-[var(--card-border)] bg-[var(--input-bg)] text-[var(--text-primary)] hover:border-[var(--accent-gold)]/40'
                      }`}
                    >
                      <span>{r}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[var(--text-secondary)] text-center">
                  Selected Risk Tolerance: <strong className="text-[var(--accent-gold)]">{formData.riskTolerance} Risk</strong>
                </p>
              </div>
            )}

            {/* Q9: Monthly Investable */}
            {currentIndex === 8 && (
              <div className="space-y-4">
                <label className="block text-lg font-bold text-[var(--text-primary)]">
                  9. How much money could you invest every month? (₹)
                </label>
                <input
                  type="number"
                  min="500"
                  step="500"
                  value={formData.monthlyInvestable}
                  onChange={(e) => updateField('monthlyInvestable', Number(e.target.value))}
                  placeholder="e.g. 3000"
                  className="w-full bg-[var(--input-bg)] text-[var(--text-primary)] text-lg rounded-2xl p-4 border border-[var(--input-border)] focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[var(--accent-gold)]/20 focus:outline-none transition-all font-mono"
                  autoFocus
                />
              </div>
            )}

            {/* Q10: Target Timeline */}
            {currentIndex === 9 && (
              <div className="space-y-4">
                <label className="block text-lg font-bold text-[var(--text-primary)]">
                  10. When do you want to achieve your primary goal?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {TIMELINE_OPTIONS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => updateField('targetTimeline', t)}
                      className={`p-4 rounded-2xl border text-center font-bold text-sm transition-all cursor-pointer ${
                        formData.targetTimeline === t
                          ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] shadow-md'
                          : 'border-[var(--card-border)] bg-[var(--input-bg)] text-[var(--text-primary)] hover:border-[var(--accent-gold)]/40'
                      }`}
                    >
                      <span>{t}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--card-border)]">
        <button
          type="button"
          onClick={handlePrev}
          className="btn-secondary text-xs px-4 py-2.5 flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="btn-primary text-xs px-6 py-2.5 flex items-center gap-1.5 font-bold shadow-md cursor-pointer"
        >
          <span>{currentIndex === totalSteps - 1 ? 'Generate My Profile 🚀' : 'Next Question'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
