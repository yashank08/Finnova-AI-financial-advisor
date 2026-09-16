/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        surface: {
          base:      '#0B1220',
          card:      '#111827',
          elevated:  '#1B2435',
          border:    '#293548',
        },
        accent: {
          DEFAULT: '#10B981',
          hover:   '#059669',
          muted:   'rgba(16,185,129,0.08)',
          border:  'rgba(16,185,129,0.2)',
        },
        text: {
          primary:   '#F8FAFC',
          secondary: '#94A3B8',
          muted:     '#64748B',
        },
        status: {
          success: '#22C55E',
          warning: '#F59E0B',
          danger:  '#EF4444',
        },
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        'sm': '6px',
        'DEFAULT': '8px',
        'md': '10px',
        'lg': '12px',
        'xl': '14px',
        '2xl': '16px',
        '3xl': '20px',
        'full': '9999px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.3), 0 1px 2px -1px rgba(0,0,0,0.3)',
        'card-hover': '0 8px 24px -4px rgba(0,0,0,0.4)',
        'panel': '0 4px 16px -2px rgba(0,0,0,0.35)',
      },
      transitionDuration: {
        '250': '250ms',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
