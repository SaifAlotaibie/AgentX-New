/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B8354',
          dark: '#14573A',
          light: '#ABEFCC',
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#ABEFCC',
          300: '#86efac',
          400: '#4ade80',
          500: '#1B8354',
          600: '#16a34a',
          700: '#14573A',
          800: '#166534',
          900: '#14532d',
        },
        secondary: {
          DEFAULT: '#eab308',
          dark: '#ca8a04',
          light: '#fde047',
        },
        text: {
          primary: '#161616',
          secondary: '#676C77',
        },
        border: {
          DEFAULT: '#D2D6DB',
        },
        background: {
          1: '#fafafa',
          2: '#f0fdf4',
          3: '#F1F4F9',
        },
      },
      fontFamily: {
        saud: ['Saud', 'sans-serif'],
        sans: ['Google Sans', 'Open Sans', 'Arial', 'sans-serif'],
        arabic: ['Saud', 'sans-serif'],
      },
      boxShadow: {
        'hrsd': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'hrsd-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'hrsd-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'hrsd-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}
