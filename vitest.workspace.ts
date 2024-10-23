import { defineWorkspace } from "vitest/config"

export default defineWorkspace(["./platform/*/vitest.config.ts", "./projects/*/*/vitest.config.ts"])
