/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        graphite: {
          950: "#0F1112",
          900: "#141719",
          850: "#181B1D",
          800: "#1D2023",
          700: "#2A2E32",
          600: "#41474D",
          500: "#6F7780",
          400: "#9AA1A9",
          300: "#C4CBD4",
          100: "#F1F3F5",
        },
        financial: {
          positive: "#00C896",
          negative: "#FF4D5A",
          accent: "#3B82F6",
        },
      },
    },
  },
  plugins: [],
};