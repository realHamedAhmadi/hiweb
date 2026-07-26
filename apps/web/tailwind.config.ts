import type { Config } from "tailwindcss";
import { colors, typography, radius } from "../../packages/ui/src/tokens";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors,
      fontFamily: {
          display: ["Vazirmatn", "ui-sans-serif", "system-ui", "sans-serif"],
          body: ["Vazirmatn", "ui-sans-serif", "system-ui", "sans-serif"],
          mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      fontSize: typography.scale,
      borderRadius: radius,
    },
  },
  plugins: [],
};

export default config;
