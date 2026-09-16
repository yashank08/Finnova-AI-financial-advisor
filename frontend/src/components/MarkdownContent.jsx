import React from 'react';
import { useTheme } from '../context/ThemeContext';

function renderFormattedText(text, isDark) {
  if (!text) return '';
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className={`font-bold ${isDark ? 'text-[var(--accent-gold)]' : 'text-[#B8860B]'}`}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default function MarkdownContent({ content }) {
  const { isDark } = useTheme();
  if (!content) return null;

  const lines = content.split('\n');

  return (
    <div className={`space-y-1.5 text-xs leading-relaxed ${isDark ? 'text-[#FFFFFF]' : 'text-[#111111]'}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className={`text-xs font-bold mt-2 mb-1 ${isDark ? 'text-[var(--accent-gold)]' : 'text-[#B8860B]'}`}>
              {trimmed.replace('### ', '')}
            </h3>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={idx} className={`text-sm font-bold mt-2 mb-1 ${isDark ? 'text-[var(--accent-gold)]' : 'text-[#B8860B]'}`}>
              {trimmed.replace('## ', '')}
            </h2>
          );
        }

        // Bullet lists (- or *)
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const bulletText = trimmed.substring(2);
          return (
            <div key={idx} className={`flex items-start gap-1.5 pl-1.5 ${isDark ? 'text-[#E5E7EB]' : 'text-[#374151]'}`}>
              <span className={`text-[10px] shrink-0 mt-0.5 ${isDark ? 'text-[var(--accent-gold)]' : 'text-[#B8860B]'}`}>•</span>
              <span>{renderFormattedText(bulletText, isDark)}</span>
            </div>
          );
        }

        // Numbered items (e.g. 1. **Title:** text or 1. text)
        const matchNum = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (matchNum) {
          const num = matchNum[1];
          const numText = matchNum[2];
          return (
            <div key={idx} className={`flex items-start gap-1.5 pl-1.5 mt-1 ${isDark ? 'text-[#E5E7EB]' : 'text-[#374151]'}`}>
              <span className={`text-[11px] font-bold shrink-0 ${isDark ? 'text-[var(--accent-gold)]' : 'text-[#B8860B]'}`}>{num}.</span>
              <span>{renderFormattedText(numText, isDark)}</span>
            </div>
          );
        }

        return (
          <p key={idx} className={`text-xs ${isDark ? 'text-[#FFFFFF]' : 'text-[#111111]'}`}>
            {renderFormattedText(line, isDark)}
          </p>
        );
      })}
    </div>
  );
}
