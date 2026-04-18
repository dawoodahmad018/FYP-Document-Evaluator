/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        flame: "#f35b04",
        amber: "#f18701",
        sun: "#f7b801",
        periwinkle: "#7678ed",
        indigo: "#3d348b",
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Manrope", "sans-serif"],
      },
      boxShadow: {
        glow: "0 20px 40px rgba(61, 52, 139, 0.2)",
      },
    },
  },
  plugins: [],
};
