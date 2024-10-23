import { createEnv } from "@t3-oss/env-core"
import { vercel } from "@t3-oss/env-core/presets"
import { z } from "zod"

export const env = createEnv({
  extends: [vercel()],
  server: {
    QSTASH_TOKEN: z.string(),
  },
  runtimeEnv: process.env,
  skipValidation:
    !!process.env.CI ||
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.npm_lifecycle_event === "lint" ||
    process.env.NODE_ENV === "test",
  emptyStringAsUndefined: true,
})
