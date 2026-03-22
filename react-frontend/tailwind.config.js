/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"VT323"', 'monospace'],
        title: ['"Press Start 2P"', 'cursive'],
      },
      colors: {
        retro: {
          bg: '#1e1e2e',
          window: '#ffb6c1',
          panel: '#2b2b45',
          text: '#f8f8f2',
          border: '#11111b',
          accent: '#f9e2af',
          btn: '#cbaacb'
        }
      }
    },
  },
  plugins: [],
}
