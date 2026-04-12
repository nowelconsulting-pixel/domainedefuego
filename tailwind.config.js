/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          50: '#FFF0ED',
          100: '#FFD9D3',
          200: '#FFB3A7',
          300: '#FF8C7A',
          400: '#F5664E',
          500: '#E8452C',
          600: '#C93520',
          700: '#A52818',
          800: '#7E1E12',
          900: '#5C160D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

