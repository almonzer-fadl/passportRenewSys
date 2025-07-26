import typography from '@tailwindcss/typography';
import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        sudan: {
          red: '#D21F3C',
          white: '#FFFFFF', 
          black: '#000000',
          blue: '#0047AB',
          green: '#10b981',
          gold: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    typography,
    daisyui,
  ],
  daisyui: {
    themes: [
      {
        sudan: {
          primary: '#D21F3C',      // Sudan red
          secondary: '#0047AB',    // Sudan blue  
          accent: '#10b981',       // Green accent
          neutral: '#374151',      // Gray
          'base-100': '#ffffff',   // White background
          'base-200': '#f8fafc',   // Light gray
          'base-300': '#e2e8f0',   // Medium gray
          info: '#0ea5e9',         // Blue info
          success: '#10b981',      // Green success
          warning: '#f59e0b',      // Orange warning
          error: '#ef4444',        // Red error
        },
      },
      'light',
    ],
    base: true,
    utils: true,
    logs: false,
    rtl: true,
  },
}

