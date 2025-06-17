/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#002d1b",      // Deep green from your logo
        "primary-dark": "#014123", // Hover dark green
        accent: "#b76e2b",       // Bronze/golden highlight
        background: "#fafafa",   // Light background
        muted: "#f4f1eb",        // Soft beige for cards/sections
        darkText: "#333333",     // For text
      },
    },
  },
  plugins: [],
}
