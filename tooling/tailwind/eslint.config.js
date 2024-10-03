// FIXME: This kinda stinks...
/// <reference types="../../tooling/eslint/types.d.ts" />

import baseConfig, { platformLicense } from "@kreios/eslint-config/base"

export default [...baseConfig, ...platformLicense]
