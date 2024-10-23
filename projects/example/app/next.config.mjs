import { fileURLToPath } from "url"
import { createJiti } from "jiti"

// Next.js runs the config twice during build. In the first run, process.env.TURBOPACK is not set.
// We need to check for both the env var and the CLI flag to determine if Turbopack is enabled.
const TURBOPACK_ENABLED = Boolean(process.env.TURBOPACK) || Boolean(process.argv.includes("--turbo"))

const ENABLE_SENTRY = Boolean(!TURBOPACK_ENABLED && process.env.NEXT_PUBLIC_SENTRY_DSN)

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
createJiti(fileURLToPath(import.meta.url))("./src/env")

/** @type {import("next").NextConfig} */
let config = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_TURBOPACK: process.env.TURBOPACK,
  },
  experimental: {
    taint: true,
  },

  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,

  images: {
    remotePatterns: [],
  },
}

if (process.env.NODE_ENV === "development") {
  const { withVercelToolbar } = await import("@vercel/toolbar/plugins/next")
  config = withVercelToolbar()(config)
}

// Apply Sentry default configuration to Next.js config.
if (ENABLE_SENTRY) {
  const { withSentryConfig } = await import("@sentry/nextjs")
  // @ts-ignore
  config = withSentryConfig(config, {
    org: process.env.SENTRY_ORG ?? "kreios",
    project: process.env.SENTRY_PROJECT ?? "data-platform-prototype",
    silent: !process.env.CI, // Suppresses source map uploading logs during build
    widenClientFileUpload: true, // Upload a larger set of source maps
    tunnelRoute: "/monitoring", // Route to bypass ad-blockers (check for middleware conflicts)
    hideSourceMaps: true, // Hides source maps from client bundles
    disableLogger: true, // Tree-shakes Sentry logger statements to reduce bundle size
    automaticVercelMonitors: true, // Auto instrumentation for Vercel Cron Monitors
  })
}

export default config
