/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // SOC dark theme palette
        'soc-bg': '#0a0e1a',
        'soc-surface': '#0f1629',
        'soc-card': '#141c2e',
        'soc-border': '#1e2d4a',
        'soc-accent': '#00d4ff',
        'soc-accent2': '#7c3aed',
        'soc-green': '#00ff9d',
        'soc-red': '#ff3b5c',
        'soc-orange': '#ff8c00',
        'soc-yellow': '#ffd700',
        'soc-text': '#c8d6e5',
        'soc-muted': '#4a5e7a',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        }
      }
    },
  },
  plugins: [],
}
