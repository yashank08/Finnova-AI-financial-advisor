import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="fixed top-4 right-4 z-50 w-full max-w-sm"
      >
        <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-panel bg-[#111827] ${
          isSuccess ? 'border-[#10B981]/30' : isError ? 'border-[#EF4444]/30' : 'border-[#293548]'
        }`}>
          {isSuccess && <CheckCircle className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />}
          {isError && <AlertCircle className="w-3.5 h-3.5 text-[#EF4444] shrink-0 mt-0.5" />}
          {!isSuccess && !isError && <Info className="w-3.5 h-3.5 text-[#94A3B8] shrink-0 mt-0.5" />}
          
          <p className="flex-1 text-[13px] text-[#F8FAFC] leading-relaxed">{toast.message}</p>

          <button onClick={onClose} className="text-[#64748B] hover:text-[#94A3B8] transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
