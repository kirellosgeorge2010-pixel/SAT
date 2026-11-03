/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: '#0f0f0f',
        surface: '#1a1a1a',
        card: '#222222',
        border: '#2e2e2e',
        gold: {
          DEFAULT: '#c9a84c',
          light: '#e4c97a',
          dark: '#9e7d30',
          muted: '#c9a84c33',
        },
        burgundy: {
          DEFAULT: '#7b2d42',
          light: '#a33a57',
          dark: '#5a1f30',
          muted: '#7b2d4233',
        },
        text: {
          primary: '#f0ead6',
          secondary: '#c8bfa0',
          muted: '#8a8a8a',
          dim: '#555555',
        },
        success: '#4ade80',
        error: '#f87171',
        warning: '#fbbf24',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(201,168,76,0)' },
          '50%': { boxShadow: '0 0 0 6px rgba(201,168,76,0.15)' },
        },
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid': '32px 32px',
      },
    },
  },
  plugins: [],
}
