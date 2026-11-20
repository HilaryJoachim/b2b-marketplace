/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#F36A1B",      // primary brand orange
        "primary-dark": "#d95a12", // darker orange for hover
        secondary: "#084C41",    // primary brand dark green
        "secondary-dark": "#05342a", // darker green
        accent: "#b76e2b",       // bronze/golden highlight
        background: "#fafafa",   // light background
        muted: "#f4f1eb",        // soft beige for cards/sections
        darkText: "#333333",     // for text
      },
    },
  },
  plugins: [],
}
