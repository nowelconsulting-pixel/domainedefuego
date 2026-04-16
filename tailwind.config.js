/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy coral — kept for admin components
        coral: {
          50:  '#FFF0ED',
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
        // ── Nature Vivante palette ──────────────────────────────────────────
        forest:         '#2D3A35',
        'forest-dark':  '#1E2822',
        'forest-darker':'#161D19',
        'nv-green':     '#4F7F6A',
        'nv-green-mid': '#5A8E78',
        'nv-green-light':'#E8F2EE',
        'nv-teal':      '#6FA8A6',
        'nv-teal-deep': '#2E6E6C',
        'nv-teal-text': '#3A7A78',
        'nv-amber':     '#E2A94F',
        'nv-amber-dark':'#C8952A',
        gold:           '#C8A96A',
        brown:          '#6B4F3A',
        page:           '#F0EDE5',
        surface:        '#FAFAF7',
        'site-border':  '#E8E2D8',
        muted:          '#6A7870',
        hint:           '#9AA8A2',
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
