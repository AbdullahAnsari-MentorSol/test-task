import baseConfig, { platformLicense } from "@kreios/eslint-config/base"

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [],
  },
  ...baseConfig,
  ...platformLicense,
]
