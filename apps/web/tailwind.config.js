/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        uiBlue: '#6f84f7',
        uiBlue2: '#4d66f6',
        coral: '#f58b7b',
        haze: '#f3f5ff',
        haze2: '#e9edff',
        ink: '#0d1b3d',
        slateInk: '#4a5d7d'
      }
    }
  },
  plugins: []
};
