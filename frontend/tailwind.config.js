/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        primary: {
          50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc',
          400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
          800: '#3730a3', 900: '#312e81', 950: '#1e1b4b'
        },
        dark: {
          900: '#07070f', 800: '#0f0f1a', 700: '#161624', 600: '#1e1e2e',
          500: '#28283c', 400: '#3a3a52', 300: '#52526e'
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-in':   'fadeIn .25s ease-out',
        'slide-up':  'slideUp .3s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'none' } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'none' } },
      }
    }
  },
  plugins: []
}
