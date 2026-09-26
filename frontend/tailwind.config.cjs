/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ollama-primary': '#2C3E50',
        'ollama-secondary': '#3498DB',
      },
    },
  },
  plugins: [],
}
