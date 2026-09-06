/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "brand-gold": "#D4AF37",
        "brand-gold-hover": "#C5A028",
        "brand-gold-light": "#FDF8E7",
        "brand-navy": "#1F2937",
        surface: "#F8FAFC",
        "surface-card": "#FFFFFF",
        "surface-border": "#E2E8F0",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
