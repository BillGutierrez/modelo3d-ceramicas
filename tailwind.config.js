/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['"Schibsted Grotesk"', 'system-ui', 'sans-serif'] },
      colors: {
        plano: { 50: '#f3f5f8', 100: '#e8ecf1', 200: '#d6dce5', 300: '#b8c1ce', 500: '#6b7889', 700: '#34414f', 900: '#16202b' },
        cobalto: { 50: '#eaf0fe', 100: '#d3e0fc', 500: '#2a5bd7', 600: '#1f4cbd', 700: '#183c96' },
      },
    },
  },
  plugins: [],
};
