import type { Config } from "tailwindcss"
import colors from "tailwindcss/colors"

export default {
  theme: {
    extend: {
      colors: {
        neutral: {
          ...colors.neutral,
          925: "#0f0f0f", // between neutral-900 and neutral-950
        },
      },
    },
  },
} satisfies Config
