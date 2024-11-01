import { fileURLToPath } from "url"

/** @typedef {import("prettier").Config} PrettierConfig */
/** @typedef {import("prettier-plugin-tailwindcss").PluginOptions} TailwindConfig */
/** @typedef {import("@ianvs/prettier-plugin-sort-imports").PluginConfig} SortImportsConfig */

/** @type { PrettierConfig | SortImportsConfig | TailwindConfig } */
const config = {
  printWidth: 120,
  endOfLine: "lf",
  semi: false,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "es5",
  plugins: ["@ianvs/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],
  tailwindConfig: fileURLToPath(new URL("../../platform/tailwind/web.ts", import.meta.url)),
  tailwindFunctions: ["cn", "cva"],
  importOrder: [
    "<TYPES>",
    "^(react/(.*)$)|^(react$)|^(react-native(.*)$)",
    "^(next/(.*)$)|^(next$)",
    "^(expo(.*)$)|^(expo$)",
    "<THIRD_PARTY_MODULES>",
    "",
    "<TYPES>^@kreios",
    "^types$",
    "^@/types/(.*)$",
    "^@kreios/(.*)$",
    "",
    "<TYPES>^[.|..|~]",
    "^~/",
    "^[../]",
    "^[./]",
  ],
  importOrderParserPlugins: [
    "typescript",
    "jsx",
    "decorators-legacy",
    "importAssertions",
    "explicitResourceManagement",
  ],
  importOrderTypeScriptVersion: "4.4.0",
}

export default config
