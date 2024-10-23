import baseConfig, { platformLicense } from "@kreios/eslint-config/base"
import reactConfig from "@kreios/eslint-config/react"

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [],
  },
  ...baseConfig,
  ...reactConfig,
  ...platformLicense,
]
