/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
    extend: {
      colors: {
        ink: {
          50: '#f8f8fc',
          100: '#e8e8f0',
          200: '#c5c5d8',
          300: '#9d9dbc',
          400: '#6b6b95',
          500: '#4a4a7a',
          600: '#3a3a62',
          700: '#2e2e4d',
          800: '#1a1a2e',
          900: '#16213e',
          950: '#0f0f1a',
        },
        gold: {
          50: '#fdf9ed',
          100: '#f9f0d3',
          200: '#f2dea6',
          300: '#e9c972',
          400: '#e0b342',
          500: '#d4af37',
          600: '#b89224',
          700: '#936d1e',
          800: '#77561f',
          900: '#65481e',
        },
        coral: {
          50: '#fef2f3',
          100: '#fee2e4',
          200: '#ffc9ce',
          300: '#fea1aa',
          400: '#fb6b7c',
          500: '#e94560',
          600: '#d42849',
          700: '#b21d3b',
          800: '#951c38',
          900: '#7d1c36',
        },
        forest: {
          50: '#edf7f1',
          100: '#d3ece0',
          200: '#aad8c2',
          300: '#78be9e',
          400: '#4d9d7a',
          500: '#2d6a4f',
          600: '#21523d',
          700: '#1b4232',
          800: '#173529',
          900: '#142c23',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.15)',
        'card-hover': '0 12px 40px -4px rgba(0, 0, 0, 0.25)',
        'gold': '0 4px 20px -2px rgba(212, 175, 55, 0.3)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
