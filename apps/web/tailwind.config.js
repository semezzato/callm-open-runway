/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(240 10% 4%)",
        foreground: "hsl(0 0% 98%)",
        primary: {
          DEFAULT: "hsl(217 91% 60%)",
          foreground: "hsl(0 0% 100%)",
        },
        secondary: {
          DEFAULT: "hsl(45 93% 47%)",
          foreground: "hsl(0 0% 10%)",
        },
        accent: {
          DEFAULT: "hsl(270 91% 65%)",
          foreground: "hsl(0 0% 100%)",
        },
        surface: "rgba(255, 255, 255, 0.05)",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.25rem",
        sm: "0.125rem",
      },
    },
  },
  plugins: [],
}
