import { readFileSync } from "node:fs"
import path from "path"
import type { Config } from "tailwindcss"
import { globSync } from "glob"
import { fontFamily } from "tailwindcss/defaultTheme"

import baseConfig from "@kreios/tailwind-config/web"

const packageJson = JSON.parse(readFileSync("./package.json").toString())

export default {
  content: [
    ...baseConfig.content,
    ...globSync(
      `node_modules/{${Object.entries(packageJson.dependencies)
        .filter(([, version]) => version === "workspace:*")
        .map(([name]) => name)
        .join(",")}}/tailwind.config.ts`
    ).map((filePath) => path.join(path.dirname(filePath), "src", "**", "*.{ts,tsx}")),
  ],
  presets: [baseConfig],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
    },
  },
} satisfies Config
