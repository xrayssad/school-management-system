/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: "#0B4F45",
          50: "#EAF3F1",
          100: "#CFE4DF",
          200: "#9FC9C0",
          600: "#0F5F53",
          700: "#0B4F45",
          800: "#083A33",
          900: "#062822",
        },
        gold: {
          DEFAULT: "#B8862F",
          50: "#FBF3E3",
          100: "#F3E1B8",
          400: "#C89A3E",
          600: "#B8862F",
          700: "#96702A",
        },
        sand: {
          DEFAULT: "#FAF6EE",
          100: "#FFFDF9",
          200: "#F4EFE1",
        },
        ink: {
          DEFAULT: "#1C2521",
          600: "#3A443F",
          400: "#66716B",
        },
        sage: {
          DEFAULT: "#E7EFE9",
          200: "#DCE8E0",
        },
      },
      fontFamily: {
        // Warm, crafted serif for public/marketing headlines (falls back gracefully if
        // "Fraunces" isn't installed locally -- add a self-hosted webfont later if desired).
        serif: ["Fraunces", "Iowan Old Style", "Palatino Linotype", "Georgia", "serif"],
        // Clean, dense-data-friendly sans for the app/dashboard UI.
        sans: ["Inter", "-apple-system", "Segoe UI", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 16px rgba(11, 79, 69, 0.08)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
