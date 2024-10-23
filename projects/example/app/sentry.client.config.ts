/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable no-restricted-properties */
// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN ?? "___DSN___",
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV ?? "development",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // The sample rate for sessions that has had an error occur. This is different from the `tracesSampleRate` as it is
  // specifically for sessions that have had an error occur.
  replaysOnErrorSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.feedbackIntegration({
      autoInject: false,
      showBranding: false,
      triggerLabel: "",
      colorScheme: "system",
    }),
  ],
})
