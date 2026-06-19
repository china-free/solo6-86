/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        primary: {
          50: '#f2f7f1',
          100: '#e0ece0',
          200: '#c2d9c1',
          300: '#9bc09a',
          400: '#6ea16d',
          500: '#4d854b',
          600: '#3d6b3b',
          700: '#2D5A27',
          800: '#284828',
          900: '#213c22',
        },
        accent: {
          50: '#fef3f0',
          100: '#fce5e3',
          200: '#f9cfc9',
          300: '#f4aea4',
          400: '#eb837a',
          500: '#E07A5F',
          600: '#cb5b4c',
          700: '#aa483a',
          800: '#8c3e35',
          900: '#743931',
        },
        warm: {
          50: '#fef9ef',
          100: '#fdf0d5',
          200: '#fbe0ac',
          300: '#f7ca78',
          400: '#F2CC8F',
          500: '#e6a75c',
          600: '#d98c3f',
          700: '#b56d31',
          800: '#92572d',
          900: '#77482a',
        },
        cream: {
          50: '#fdfcfb',
          100: '#faf7f2',
          200: '#f5efe6',
          300: '#ede4d5',
          400: '#e2d4bf',
          500: '#d4c2a7',
          600: '#bfa889',
          700: '#9e8a6d',
          800: '#7f705a',
          900: '#685c4c',
        }
      },
      fontFamily: {
        display: ['"ZCOOL XiaoWei"', 'serif'],
        body: ['"Noto Sans SC"', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 20px -2px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.12)',
        'card': '0 4px 6px -1px rgba(45, 90, 39, 0.08), 0 2px 4px -1px rgba(45, 90, 39, 0.04)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-in': 'bounceIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
    },
  },
  plugins: [],
};
