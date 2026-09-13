/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#07111F',
        card: '#101C2C',
        'card-2': '#162438',
        primary: '#1683FF',
        success: '#28C76F',
        accent: '#FFC928',
        cta: '#FF8A00',
        danger: '#FF4D4F',
        muted: '#9BA9BA',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '28px',
      },
      boxShadow: {
        glow: '0 0 24px rgba(22,131,255,0.35)',
        'glow-green': '0 0 24px rgba(40,199,111,0.35)',
      },
    },
  },
  plugins: [],
};
