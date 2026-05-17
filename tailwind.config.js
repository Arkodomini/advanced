/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        canvas: '#F5F5F0',
        'card-white': '#FFFFFF',
        'card-yellow': '#FEF9C3',
        'card-green': '#DCFCE7',
        'card-blue': '#DBEAFE',
        'card-pink': '#FCE7F3',
        'card-purple': '#EDE9FE',
        'card-orange': '#FED7AA',
        'card-gray': '#F3F4F6',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.10)',
        'card-selected': '0 0 0 2px #3B82F6, 0 4px 12px rgba(59,130,246,0.15)',
      },
      borderRadius: {
        card: '8px',
      },
    },
  },
  plugins: [],
}
