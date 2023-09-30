import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {},
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  important: true,
} satisfies Config;
