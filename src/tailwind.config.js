/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',   // ← This is very important
  theme: {
    extend: {},
  },
  plugins: [],
}