/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        nle: {
          bg: 'var(--nle-bg)',
          canvas: 'var(--nle-canvas)',
          surface: 'var(--nle-surface)',
          panel: 'var(--nle-panel)',
          header: 'var(--nle-header)',
          border: 'var(--nle-border)',
          muted: 'var(--nle-muted)',
          text: 'var(--nle-text)',
          dim: 'var(--nle-dim)',
          accent: '#00e5ff',
          blue: '#0d99ff',
          amber: '#f59e0b',
          crimson: '#ef4444',
          emerald: '#10b981',
          purple: '#a855f7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        '2xs': '0.625rem', // 10px
        '3xs': '0.5625rem', // 9px
      },
    },
  },
  plugins: [],
};
