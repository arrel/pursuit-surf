import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primer: {
          purple: {
            light: "#EEE5FF",
            DEFAULT: "#773FF0",
            dark: "#592CBA",
          },
          black: {
            light: "#6b7280",
            DEFAULT: "#374151",
            dark: "#1f2937",
          },
          gray: {
            light: "#F6F6F6",
            DEFAULT: "#E0E0E0",
            dark: "#6E7179",
          },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
