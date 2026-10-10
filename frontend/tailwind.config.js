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
        paper: "var(--paper)",
        ink: "var(--ink)",
        red: "var(--red)",
        grn: "var(--grn)",
        blu: "var(--blu)",
        yel: "var(--yel)",
        card: "var(--card)",
        mut: "var(--mut)",
      },
      fontFamily: {
        gochi: ["var(--font-gochi)", "cursive"],
        patrick: ["var(--font-patrick)", '"Comic Sans MS"', "cursive"],
      },
      boxShadow: {
        crayon: "5px 6px 0 var(--yel)",
        btn: "3px 3px 0 var(--ink)",
      },
      keyframes: {
        bob: {
          "50%": { transform: "translateY(-10px) rotate(-3deg)" },
        },
        spin: {
          to: { rotate: "360deg" },
        },
        mq: {
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        bob: "bob 4s ease-in-out infinite",
        "bob-fast": "bob 1.5s infinite",
        spin: "spin 40s linear infinite",
        mq: "mq 40s linear infinite",
      },
    },
  },
  plugins: [],
};
