import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Filter, X, CreditCard, Download,
  Search, ChevronLeft, ChevronRight,
  AlertCircle, Loader2, CheckCircle2, ArrowUpRight, ArrowDownRight,
  TrendingUp, TrendingDown, Wallet, ListFilter
} from 'lucide-react';
import api from '../utils/api';

const CATEGORIES = [
  'Income', 'Food', 'Transport', 'Utilities', 'Entertainment',
  'Healthcare', 'Education', 'Investment', 'Shopping', 'Rent',
  'Insurance', 'Travel', 'Gifts', 'Freelance', 'Other'
];

const fmt = (n) =>
  '₹ ' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Add Transaction Modal ──────────────────────────────────────
function AddModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    type: 'Expense',
    category: 'Food',
    amount: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.description.trim()) e.description = 'Description is required.';
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = 'Enter a valid positive amount.';
    if (!form.date) e.date = 'Date is required.';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setServerError('');
    try {
      await api.post('/transactions', {
        type: form.type,
        category: form.category,
        amount: parseFloat(form.amount),
        description: form.description.trim(),
        date: new Date(form.date).toISOString(),
      });
      onSaved();
      onClose();
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') setServerError(detail);
      else if (Array.isArray(detail)) setServerError(detail[0]?.message || 'Validation error.');
      else setServerError('Failed to save transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[var(--card-border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Add Transaction</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[var(--input-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--card-border)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {serverError && (
          <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, type: 'Expense', category: 'Food' })}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  form.type === 'Expense'
                    ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
                    : 'bg-[var(--input-bg)] text-[var(--text-secondary)] border-[var(--card-border)]'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, type: 'Income', category: 'Income' })}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  form.type === 'Income'
                    ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30'
                    : 'bg-[var(--input-bg)] text-[var(--text-secondary)] border-[var(--card-border)]'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          <div>
            <label className="label">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input text-xs"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              placeholder="e.g. 2500"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="input text-xs"
            />
            {errors.amount && <p className="text-[11px] text-[#EF4444] mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label className="label">Description</label>
            <input
              type="text"
              placeholder="e.g. Grocery shopping at Supermarket"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input text-xs"
            />
            {errors.description && <p className="text-[11px] text-[#EF4444] mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="label">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="input text-xs"
            />
            {errors.date && <p className="text-[11px] text-[#EF4444] mt-1">{errors.date}</p>}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs px-5 py-2"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Transaction'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Main Transactions Page ──────────────────────────────────────
export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedTxIds, setSelectedTxIds] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (typeFilter !== 'All') params.type = typeFilter;

      const res = await api.get('/transactions', { params });
      setTransactions(res.data.transactions || []);
      setTotalCount(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      setError('Could not load transactions. Make sure backend is connected.');
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter, typeFilter]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleDelete = async (targetId) => {
    if (!targetId) return;
    setDeletingId(targetId);
    try {
      await api.delete(`/transactions/${targetId}`);
      
      // 1. Immediately update UI state
      setTransactions(prev => prev.filter(t => (t.id !== targetId && t._id !== targetId)));
      setTotalCount(prev => Math.max(0, prev - 1));
      setSelectedTxIds(prev => prev.filter(id => id !== targetId));

      // 2. Display success toast
      setToastMessage('Transaction deleted successfully.');
      setTimeout(() => setToastMessage(null), 3000);

      // 3. Re-fetch fresh transaction list from server
      fetchTransactions();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to delete transaction.';
      setToastMessage(`Error: ${errorMsg}`);
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTxIds.length === 0) return;
    setLoading(true);
    try {
      await api.delete('/transactions', { data: { ids: selectedTxIds } });
      const idsSet = new Set(selectedTxIds);
      setTransactions(prev => prev.filter(t => !idsSet.has(t.id) && !idsSet.has(t._id)));
      setSelectedTxIds([]);
      setToastMessage('Selected transactions deleted successfully.');
      setTimeout(() => setToastMessage(null), 3000);
      fetchTransactions();
    } catch (err) {
      setToastMessage('Failed to delete selected transactions.');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    let income = 0;
    let expense = 0;
    transactions.forEach(t => {
      if (t.type === 'Income') income += t.amount;
      else expense += t.amount;
    });
    return { income, expense, net: income - expense };
  };

  const totals = calculateTotals();

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

      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[var(--card-border)] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            Transactions Manager
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium">
            Track, filter, and export all account inflows and outflows.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          <a
            href="/api/transactions/export"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
            <span>Download Statement</span>
          </a>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── 4 SUMMARY CARDS (Dashboard Card Style) ───────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1: Total Income */}
        <div className="bg-[var(--card-bg)] rounded-2xl p-5 border border-[var(--card-border)] card-hover space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Total Income
            </span>
            <div className="w-7 h-7 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-[#22C55E] font-mono tabular-nums">{fmt(totals.income)}</p>
            <span className="text-[11px] text-[#22C55E] font-semibold block">+12.4% vs last month</span>
          </div>
        </div>

        {/* CARD 2: Total Expenses */}
        <div className="bg-[var(--card-bg)] rounded-2xl p-5 border border-[var(--card-border)] card-hover space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Total Expenses
            </span>
            <div className="w-7 h-7 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--text-primary)] flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-[var(--text-primary)] font-mono tabular-nums">{fmt(totals.expense)}</p>
            <span className="text-[11px] text-[var(--text-secondary)] block">Verified account outflow</span>
          </div>
        </div>

        {/* CARD 3: Net Savings */}
        <div className="bg-[var(--card-bg)] rounded-2xl p-5 border border-[var(--card-border)] card-hover space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Net Savings
            </span>
            <div className="w-7 h-7 rounded-xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-[var(--accent-gold)] font-mono tabular-nums">{fmt(totals.net)}</p>
            <span className="text-[11px] text-[var(--accent-gold)] font-semibold block">Net liquid position</span>
          </div>
        </div>

        {/* CARD 4: Total Records */}
        <div className="bg-[var(--card-bg)] rounded-2xl p-5 border border-[var(--card-border)] card-hover space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Total Records
            </span>
            <div className="w-7 h-7 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--text-primary)] flex items-center justify-center">
              <ListFilter className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-[var(--text-primary)] font-mono tabular-nums">{totalCount}</p>
            <span className="text-[11px] text-[var(--text-secondary)] block">Page {page} of {totalPages}</span>
          </div>
        </div>

      </div>

      {/* ── SEARCH & FILTER CONTROLS ────────────────────────────── */}
      <div className="bg-[var(--card-bg)] rounded-2xl p-4 border border-[var(--card-border)] shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search description..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input text-xs pl-9 py-2"
          />
        </div>

        {/* Filters & Bulk Actions */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {selectedTxIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 rounded-xl bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 text-xs font-bold flex items-center gap-1.5 transition-all hover:bg-[#EF4444]/25"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedTxIds.length})</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="input text-xs py-1.5 px-3 w-36"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="input text-xs py-1.5 px-3 w-28"
          >
            <option value="All">All Types</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
        </div>

      </div>

      {/* ── PREMIUM TRANSACTIONS TABLE ───────────────────────────── */}
      <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-7 h-7 text-[var(--accent-gold)] animate-spin" />
            <p className="text-xs font-semibold text-[var(--text-secondary)]">Loading transaction ledger...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <CreditCard className="w-8 h-8 text-[var(--text-muted)] mx-auto" />
            <p className="text-sm font-bold text-[var(--text-primary)]">No transactions found</p>
            <p className="text-xs text-[var(--text-secondary)]">Try clearing filters or add a new transaction.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="table-head">
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const txId = tx.id || tx._id;
                  const isSelected = selectedTxIds.includes(txId);
                  return (
                    <tr
                      key={txId}
                      onClick={() => {
                        if (isSelected) setSelectedTxIds(selectedTxIds.filter(id => id !== txId));
                        else setSelectedTxIds([...selectedTxIds, txId]);
                      }}
                      className={`table-row cursor-pointer ${
                        isSelected ? 'bg-[var(--card-hover)] border-l-4 border-l-[var(--accent-gold)]' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <span
                          className={`badge ${
                            tx.type === 'Income' ? 'badge-success' : 'badge-neutral'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-xs text-[var(--text-primary)]">
                        {tx.description}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-[var(--text-secondary)]">
                        {tx.category}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-[var(--text-muted)] font-mono">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-xs tabular-nums">
                        <span className={tx.type === 'Income' ? 'text-[#22C55E]' : 'text-[var(--text-primary)]'}>
                          {tx.type === 'Income' ? '+' : '-'}{fmt(tx.amount)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleDelete(txId)}
                          disabled={deletingId === txId}
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                          title="Delete transaction"
                        >
                          {deletingId === txId ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#EF4444]" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[var(--card-border)] bg-[var(--bg-secondary)] flex items-center justify-between">
            <span className="text-xs text-[var(--text-secondary)] font-medium">
              Showing page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <AddModal
          onClose={() => setShowAddModal(false)}
          onSaved={() => {
            setToastMessage('Transaction saved successfully');
            setTimeout(() => setToastMessage(null), 3000);
            fetchTransactions();
          }}
        />
      )}

    </div>
  );
}
