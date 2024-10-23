import baseConfig, { restrictEnvAccess } from "@kreios/eslint-config/base"
import nextjsConfig from "@kreios/eslint-config/nextjs"
import reactConfig from "@kreios/eslint-config/react"

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".next/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  ...restrictEnvAccess,
]
