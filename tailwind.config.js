/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          dark: '#0B1020',
          secondary: '#11182B',
          light: '#F8FAFC',
          'light-secondary': '#F1F5F9',
        },
        card: {
          dark: '#151D32',
          elevated: '#1B2540',
          light: '#FFFFFF',
          'light-elevated': '#FFFFFF',
        },
        accent: {
          primary: '#6C63FF',
          'primary-hover': '#5B52E5',
          secondary: '#22C55E',
        },
        financial: {
          income: '#22C55E',
          'income-bg': 'rgba(34, 197, 94, 0.12)',
          expense: '#F43F5E',
          'expense-bg': 'rgba(244, 63, 94, 0.12)',
          warning: '#F59E0B',
          'warning-bg': 'rgba(245, 158, 11, 0.12)',
          info: '#38BDF8',
          'info-bg': 'rgba(56, 189, 248, 0.12)',
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          'light-primary': '#0F172A',
          'light-secondary': '#64748B',
        },
        spendlyBorder: {
          dark: 'rgba(255, 255, 255, 0.08)',
          'dark-elevated': 'rgba(255, 255, 255, 0.14)',
          light: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 20px -5px rgba(108, 99, 255, 0.3)',
        'glow-income': '0 0 20px -5px rgba(34, 197, 94, 0.3)',
        'glow-expense': '0 0 20px -5px rgba(244, 63, 94, 0.3)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.35)',
        'card-light': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      }
    },
  },
  plugins: [],
}
