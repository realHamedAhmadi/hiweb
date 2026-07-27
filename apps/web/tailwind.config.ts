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
        display: typography.fontFamily.display,
        body: typography.fontFamily.body,
        mono: typography.fontFamily.mono,
      },
      fontSize: typography.scale,
      borderRadius: radius,
    },
  },
  plugins: [],
};

export default config;
