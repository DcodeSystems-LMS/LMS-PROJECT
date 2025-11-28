
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'brand-primary': 'var(--brand-primary)',
        'brand-primary-light': 'var(--brand-primary-light)',
        'brand-primary-dark': 'var(--brand-primary-dark)',
        'brand-accent': 'var(--brand-accent)',
        'brand-accent-light': 'var(--brand-accent-light)',
        'brand-accent-dark': 'var(--brand-accent-dark)',
        'theme-bg-primary': 'var(--theme-bg-primary)',
        'theme-bg-secondary': 'var(--theme-bg-secondary)',
        'theme-bg-tertiary': 'var(--theme-bg-tertiary)',
        'theme-text-primary': 'var(--theme-text-primary)',
        'theme-text-secondary': 'var(--theme-text-secondary)',
        'theme-text-tertiary': 'var(--theme-text-tertiary)',
        'theme-border': 'var(--theme-border)',
        'theme-card-bg': 'var(--theme-card-bg)',
        'theme-card-border': 'var(--theme-card-border)',
        'theme-glass-bg': 'var(--theme-glass-bg)',
        'theme-glass-border': 'var(--theme-glass-border)',
        'theme-input-bg': 'var(--theme-input-bg)',
        'theme-hover-bg': 'var(--theme-hover-bg)',
      },
      fontFamily: {
        'pacifico': ['Pacifico', 'serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'spin': 'spin 1s linear infinite',
        'gradient-wave': 'gradientWave 15s ease infinite',
        'float': 'float 8s ease-in-out infinite',
        'float-slow': 'floatSlow 8s ease-in-out infinite',
        'brand-glow': 'brandGlow 2s ease-in-out infinite alternate',
        'neon-glow': 'neonGlow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out both',
        'fade-in-scale': 'fadeInScale 0.5s ease-out both',
        'slide-in-right': 'slideInRight 0.4s ease-out both',
        'slide-down': 'slideDown 0.2s ease-out',
      },
      keyframes: {
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        gradientWave: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        brandGlow: {
          '0%': { boxShadow: '0 0 5px rgba(139, 92, 246, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.8)' },
        },
        neonGlow: {
          '0%': { boxShadow: '0 0 5px rgba(249, 115, 22, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(249, 115, 22, 0.8)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInScale: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        '24': '24px',
        '28': '28px',
        '32': '32px',
      },
      boxShadow: {
        'soft': 'var(--shadow-soft)',
        'medium': 'var(--shadow-medium)',
        'strong': 'var(--shadow-strong)',
        'accent': 'var(--shadow-accent)',
        'brand': 'var(--shadow-brand)',
        'neon': '0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(249, 115, 22, 0.3)',
        'neon-strong': '0 0 30px rgba(139, 92, 246, 0.6), 0 0 60px rgba(249, 115, 22, 0.5)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      transitionDuration: {
        '300': '300ms',
        '400': '400ms',
        '600': '600ms',
      },
      transitionTimingFunction: {
        'theme': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}

export default config
