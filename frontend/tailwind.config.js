/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#2B1C24",
        bg: "#FBF6F4",
        wine: { DEFAULT: "#6B2E4D", dark: "#4A1E36", tint: "#F3E6EC" },
        rose: { DEFAULT: "#D97C93", tint: "#F8E4E9" },
        sage: { DEFAULT: "#6E8B72", tint: "#E7EFE6" },
        gold: "#C79A52",
        line: "#E9DDD9",
        muted: "#8A7078",
      },
      fontFamily: {
        serif: ["Fraunces", "serif"],
        sans: ["Open Sans", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(43,28,36,0.06), 0 8px 24px rgba(43,28,36,0.06)",
      },
    },
  },
  plugins: [],
};
