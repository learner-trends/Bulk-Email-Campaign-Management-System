/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
      colors: {
        base: '#0b1120',
        surface: '#111827',
        card: '#1a2234',
        hover: '#1f2d42',
        border: '#1e3a5f',
        accent: '#22d3ee',
        'accent-dim': '#0891b2',
        success: '#34d399',
        warning: '#fbbf24',
        danger: '#f87171',
        muted: '#475569',
        secondary: '#94a3b8',
      },
      boxShadow: {
        glow: '0 0 20px rgba(34, 211, 238, 0.2)',
        'glow-sm': '0 0 10px rgba(34, 211, 238, 0.15)',
        card: '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}
