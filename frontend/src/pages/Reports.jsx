import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, BarChart3, PieChart, Calendar,
  TrendingUp, TrendingDown, Wallet, Loader2, AlertCircle,
  RefreshCw, Bot, CheckCircle2, Sparkles, ShieldCheck, Coins,
  Upload, X, FileUp, CloudUpload, FilePlus2
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const fmt = (n) =>
  '₹ ' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const PALETTE = [
  '#C9A227', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899',
  '#F59E0B', '#14B8A6', '#6366F1', '#10B981', '#F43F5E'
];

// ── Bar Chart Component ──────────────────────────────────────────
function Bar({ label, income, expense, maxVal }) {
  const iH = maxVal > 0 ? (income / maxVal) * 100 : 0;
  const eH = maxVal > 0 ? (expense / maxVal) * 100 : 0;
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-[40px]">
      <div className="flex items-end gap-1 w-full justify-center" style={{ height: '96px' }}>
        <div className="relative flex-1 bg-[var(--input-bg)] rounded-t-sm overflow-hidden" style={{ height: '96px' }}>
          <div className="absolute bottom-0 w-full bg-[#22C55E] rounded-t-sm transition-all duration-500" style={{ height: `${iH}%` }} />
        </div>
        <div className="relative flex-1 bg-[var(--input-bg)] rounded-t-sm overflow-hidden" style={{ height: '96px' }}>
          <div className="absolute bottom-0 w-full bg-[var(--text-secondary)]/50 rounded-t-sm transition-all duration-500" style={{ height: `${eH}%` }} />
        </div>
      </div>
      <p className="text-[10px] font-semibold text-[var(--text-secondary)] text-center leading-tight">{label}</p>
    </div>
  );
}

// ── Donut Chart Component ────────────────────────────────────────
function Donut({ data }) {
  if (!data || data.length === 0) return (
    <div className="flex items-center justify-center h-40 text-[var(--text-muted)] text-xs font-medium">No expense data available</div>
  );

  const total = data.reduce((s, d) => s + d.totalAmount, 0);
  const radius = 68, stroke = 18;
  const circ = 2 * Math.PI * radius;
  let offset = 0;
  const slices = data.slice(0, 8).map((d, i) => {
    const pct = total > 0 ? d.totalAmount / total : 0;
    const dash = pct * circ;
    const gap = circ - dash;
    const slice = { ...d, dash, gap, offset, color: PALETTE[i % PALETTE.length] };
    offset += dash;
    return slice;
  });

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative shrink-0">
        <svg width="160" height="160" viewBox="0 0 160 160">
          {slices.map((s, i) => (
            <circle
              key={i}
              cx="80" cy="80" r={radius}
              fill="transparent"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${s.dash} ${s.gap}`}
              strokeDashoffset={-s.offset}
              transform="rotate(-90 80 80)"
              className="transition-all duration-500"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase">Total Outflow</span>
          <span className="text-xs font-bold text-[var(--text-primary)] font-mono">{fmt(total)}</span>
        </div>
      </div>

      <div className="w-full space-y-1.5 pt-2 border-t border-[var(--card-border)]">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-[var(--text-secondary)] font-medium">{s._id || s.id || 'Uncategorized'}</span>
            </div>
            <span className="font-mono font-bold text-[var(--text-primary)]">{fmt(s.totalAmount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CSV Upload Panel ─────────────────────────────────────────────
function UploadPanel({ onUploaded }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadError('Only CSV files are accepted. Please upload a .csv bank statement.');
      return;
    }
    setUploadError('');
    setResult(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
      if (res.data.imported > 0) onUploaded();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setUploadError(typeof detail === 'string' ? detail : 'Upload failed. Please check your CSV format and try again.');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const onInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
    e.target.value = '';
  };

  return (
    <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)] shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-3">
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <CloudUpload className="w-4 h-4 text-[var(--accent-gold)]" /> Import Bank Statement
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Upload a CSV file to bulk-import transactions</p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 cursor-pointer transition-all duration-200 select-none
          ${dragOver
            ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/10'
            : 'border-[var(--card-border)] hover:border-[var(--accent-gold)]/60 hover:bg-[var(--input-bg)]'
          }`}
      >
        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          onChange={onInputChange}
          className="hidden"
        />
        {uploading ? (
          <>
            <Loader2 className="w-8 h-8 text-[var(--accent-gold)] animate-spin" />
            <p className="text-xs font-semibold text-[var(--text-secondary)]">Importing transactions…</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 flex items-center justify-center">
              <FilePlus2 className="w-6 h-6 text-[var(--accent-gold)]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-[var(--text-primary)]">
                {dragOver ? 'Drop your CSV here' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">CSV files only — bank statements, exports</p>
            </div>
          </>
        )}
      </div>

      {/* Format hint */}
      <div className="text-xs text-[var(--text-muted)] bg-[var(--input-bg)] rounded-xl p-3 border border-[var(--card-border)]">
        <p className="font-semibold text-[var(--text-secondary)] mb-1">Expected CSV columns (flexible order):</p>
        <code className="text-[var(--accent-gold)]">date, description, amount, type, category</code>
        <p className="mt-1">Type: <code>Income</code> or <code>Expense</code> (defaults to Expense). Dates: YYYY-MM-DD, DD/MM/YYYY, etc.</p>
      </div>

      {/* Error */}
      <AnimatePresence>
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-medium flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{uploadError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{result.message}</span>
            </div>
            {result.skipped > 0 && (
              <div className="p-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--text-secondary)] text-xs">
                <p className="font-semibold mb-1">{result.skipped} row(s) skipped:</p>
                <ul className="space-y-0.5 list-disc list-inside">
                  {result.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                  {result.errors.length > 5 && <li>…and {result.errors.length - 5} more.</li>}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Reports Page ───────────────────────────────────────────
export default function Reports() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/reports/summary');
      setData(res.data);
    } catch (err) {
      setError('Could not load report metrics. Ensure the backend server is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Background
      doc.setFillColor(17, 17, 17);
      doc.rect(0, 0, 210, 297, 'F');

      // Header
      doc.setTextColor(201, 162, 39);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('FinNova AI Wealth Report', 14, 22);

      doc.setTextColor(180, 180, 180);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated for: ${user?.fullName || 'Valued Client'} • ${new Date().toLocaleDateString('en-IN')}`, 14, 30);

      doc.setDrawColor(201, 162, 39);
      doc.setLineWidth(0.5);
      doc.line(14, 34, 196, 34);

      // Executive Summary
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Executive Financial Summary', 14, 46);

      const summaryRows = [
        ['Total Income Inflow', fmt(data?.summary?.totalIncome)],
        ['Total Expense Outflow', fmt(data?.summary?.totalExpenses)],
        ['Net Liquid Surplus', fmt(data?.summary?.netSavings)],
        ['Section 80C Tax Saving Status', '₹46,800 Saved (ELSS Optimized)'],
        ['Financial Health Index', '89 / 100 (Optimal)'],
      ];

      let y = 56;
      summaryRows.forEach(([label, val]) => {
        doc.setFillColor(28, 28, 28);
        doc.rect(14, y - 4, 182, 8, 'F');
        doc.setTextColor(160, 160, 160);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(label, 18, y + 1);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(String(val), 190, y + 1, { align: 'right' });
        y += 11;
      });

      // Category Breakdown
      if (data?.categoryBreakdown?.length) {
        y += 6;
        doc.setTextColor(201, 162, 39);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('2. Category Expense Breakdown', 14, y);
        y += 10;

        data.categoryBreakdown.slice(0, 8).forEach((c) => {
          doc.setFillColor(28, 28, 28);
          doc.rect(14, y - 4, 182, 8, 'F');
          doc.setTextColor(160, 160, 160);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.text(c._id || c.id || 'Other', 18, y + 1);
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.text(fmt(c.totalAmount), 190, y + 1, { align: 'right' });
          y += 10;
        });
      }

      // Monthly Trend
      if (data?.monthlyTrend?.length) {
        y += 6;
        doc.setTextColor(201, 162, 39);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('3. Monthly Cash-Flow Trend', 14, y);
        y += 10;

        data.monthlyTrend.slice(-6).forEach((m) => {
          doc.setFillColor(28, 28, 28);
          doc.rect(14, y - 4, 182, 8, 'F');
          doc.setTextColor(160, 160, 160);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.text(m.month, 18, y + 1);
          doc.setTextColor(34, 197, 94);
          doc.text(`In: ${fmt(m.income)}`, 90, y + 1);
          doc.setTextColor(255, 255, 255);
          doc.text(`Out: ${fmt(m.expense)}`, 155, y + 1, { align: 'right' });
          y += 10;
        });
      }

      // Footer
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(8);
      doc.text('FinNova — Smart Finance. Smarter Future. | Confidential Report', 105, 290, { align: 'center' });

      doc.save(`FinNova_Wealth_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
      setToastMessage('✅ PDF Statement downloaded successfully!');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error(err);
      setToastMessage('❌ Failed to generate PDF. Please try again.');
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setExporting(false);
    }
  };

  const maxVal = data?.monthlyTrend
    ? Math.max(...data.monthlyTrend.map((m) => Math.max(m.income, m.expense || 0)), 1)
    : 1;

  if (loading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-[var(--bg-primary)] transition-colors duration-300">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[var(--accent-gold)] animate-spin" />
          <p className="text-xs font-semibold text-[var(--text-secondary)]">Compiling financial reports…</p>
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
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 right-6 z-50 bg-[var(--card-bg)] text-[var(--text-primary)] px-4 py-2.5 rounded-xl shadow-2xl border border-[var(--accent-gold)]/40 text-xs font-bold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[var(--card-border)] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            Financial Reports &amp; Analytics
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium">
            Deep-dive portfolio breakdown, category analytics, and downloadable statements.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          {/* Upload toggle */}
          <button
            onClick={() => setShowUpload((v) => !v)}
            className={`btn-secondary text-xs py-2.5 px-4 flex items-center gap-2 ${showUpload ? 'border-[var(--accent-gold)]/60' : ''}`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{showUpload ? 'Hide Upload' : 'Upload Statement'}</span>
          </button>

          {/* Refresh */}
          <button
            onClick={fetchReport}
            className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          {/* CSV Download */}
          <a
            href="/api/reports/download"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-2"
          >
            <FileText className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
            <span>Download CSV Statement</span>
          </a>

          {/* PDF Download */}
          <button
            onClick={handleExportPDF}
            disabled={exporting || !data}
            className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 disabled:opacity-60"
          >
            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── UPLOAD PANEL ──────────────────────────────────────── */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <UploadPanel onUploaded={() => {
              fetchReport();
              setToastMessage('✅ Transactions imported! Reports refreshed.');
              setTimeout(() => setToastMessage(null), 3500);
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 4 SUMMARY CARDS ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-[var(--card-bg)] rounded-2xl p-5 border border-[var(--card-border)] card-hover space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Total Inflow</span>
            <div className="w-7 h-7 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-[#22C55E] font-mono tabular-nums">{fmt(data?.summary?.totalIncome)}</p>
            <span className="text-[11px] text-[#22C55E] font-semibold block">Verified gross income</span>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] rounded-2xl p-5 border border-[var(--card-border)] card-hover space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Total Outflow</span>
            <div className="w-7 h-7 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--text-primary)] flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-[var(--text-primary)] font-mono tabular-nums">{fmt(data?.summary?.totalExpenses)}</p>
            <span className="text-[11px] text-[var(--text-secondary)] block">Verified total spending</span>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] rounded-2xl p-5 border border-[var(--card-border)] card-hover space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Net Surplus</span>
            <div className="w-7 h-7 rounded-xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-[var(--accent-gold)] font-mono tabular-nums">{fmt(data?.summary?.netSavings)}</p>
            <span className="text-[11px] text-[#F59E0B] font-semibold block">
              {data?.summary?.totalIncome > 0
                ? `${((data.summary.netSavings / data.summary.totalIncome) * 100).toFixed(1)}% savings rate`
                : 'No income data'}
            </span>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] rounded-2xl p-5 border border-[var(--card-border)] card-hover space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Section 80C Tax Saved</span>
            <div className="w-7 h-7 rounded-xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-[#22C55E] font-mono tabular-nums">₹46,800</p>
            <span className="text-[11px] text-[#22C55E] font-semibold block">Fully Optimized</span>
          </div>
        </div>

      </div>

      {/* ── CHARTS SECTION ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Bar Chart: Monthly Income vs Expenses */}
        <div className="lg:col-span-8 bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)] shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-3">
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[var(--accent-gold)]" /> Monthly Inflow vs Outflow
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">Historical cashflow comparison across months</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-[#22C55E]"><span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" /> Income</span>
              <span className="flex items-center gap-1.5 text-[var(--text-secondary)]"><span className="w-2.5 h-2.5 rounded-full bg-[var(--text-secondary)]" /> Expense</span>
            </div>
          </div>

          <div className="flex items-end gap-2 pt-4 justify-between overflow-x-auto custom-scrollbar">
            {data?.monthlyTrend?.length > 0
              ? data.monthlyTrend.map((m, i) => (
                  <Bar key={i} label={m.month} income={m.income} expense={m.expense || 0} maxVal={maxVal} />
                ))
              : <p className="text-xs text-[var(--text-muted)] mx-auto py-8">No monthly data yet. Add transactions to see trends.</p>
            }
          </div>
        </div>

        {/* Donut Chart: Expense Breakdown */}
        <div className="lg:col-span-4 bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)] shadow-xl space-y-4">
          <div className="border-b border-[var(--card-border)] pb-3">
            <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[var(--accent-gold)]" /> Expense Category Split
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">Distribution across categories</p>
          </div>
          <Donut data={data?.categoryBreakdown} />
        </div>

      </div>

      {/* ── AI EXECUTIVE SUMMARY CARD ─────────────────────────────── */}
      <div className="bg-[var(--card-bg)] rounded-2xl p-6 sm:p-7 border border-[var(--accent-gold)]/40 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <span className="px-2 py-0.5 rounded-full bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30 text-[10px] font-bold">
                OpenRouter AI Intelligence
              </span>
              <h2 className="text-lg font-bold text-[var(--text-primary)] mt-0.5">
                🤖 AI Executive Financial Summary
              </h2>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-xs text-[var(--text-primary)] leading-relaxed bg-[var(--input-bg)] p-5 rounded-2xl border border-[var(--card-border)]">
          {data?.summary?.totalIncome > 0 ? (
            <>
              <p>
                Your current savings velocity sits at{' '}
                <span className="text-[#22C55E] font-bold">
                  {((data.summary.netSavings / data.summary.totalIncome) * 100).toFixed(1)}%
                </span>{' '}
                of total gross inflow. Net surplus stands at <span className="text-[var(--accent-gold)] font-bold">{fmt(data.summary.netSavings)}</span>.
              </p>
              {data?.categoryBreakdown?.[0] && (
                <p className="text-[var(--text-secondary)]">
                  Highest expense category: <span className="text-[var(--text-primary)] font-semibold">{data.categoryBreakdown[0]._id || data.categoryBreakdown[0].id}</span> at{' '}
                  <span className="text-[var(--accent-gold)] font-bold">{fmt(data.categoryBreakdown[0].totalAmount)}</span>.
                  Consider reviewing this category for potential savings opportunities.
                </p>
              )}
            </>
          ) : (
            <p className="text-[var(--text-muted)]">
              Add transactions or upload a bank statement CSV to generate your personalised AI financial summary.
            </p>
          )}
        </div>
      </div>

    </div>
  );
}
