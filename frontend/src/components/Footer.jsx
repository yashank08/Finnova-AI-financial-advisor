import React from 'react';
import { TrendingUp, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-[#2E2E2E] py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#FFFFFF] text-[#000000] flex items-center justify-center font-bold shadow-md">
            <TrendingUp className="w-4 h-4 text-[#000000]" />
          </div>
          <span className="font-bold text-[#FFFFFF] text-sm tracking-tight">FinNova</span>
          <span className="text-[#D4AF37] text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30">
            Wealth Engine
          </span>
        </div>

        <p className="text-xs text-[#A1A1AA] flex items-center gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
          © 2026 FinNova Intelligence. Institutional-grade encrypted wealth management.
        </p>

      </div>
    </footer>
  );
}
