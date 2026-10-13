/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        juara: {
          DEFAULT: "#EA580C",
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#EA580C",
          600: "#C2410C",
          700: "#9A3412",
        },
        bgApp: "#F7F5F2",
        panel: "#FFFFFF",
        textMain: "#1F2937",
        textMuted: "#5A6B78",
        status: {
          waiting: "#F59E0B",
          submitted: "#F59E0B",
          active: "#15A66A",
          graded: "#15A66A",
          rejected: "#E53935",
          late: "#E53935",
          unsubmitted: "#6B7280",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
