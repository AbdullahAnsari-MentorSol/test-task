/* eslint-disable no-restricted-properties */
"use client"

import { useEffect } from "react"
import NextError from "next/error" // Avoids naming conflict with the native Error object
import * as Sentry from "@sentry/nextjs"

interface GlobalErrorProps {
  error: Error // Standard JavaScript Error object
}

export default function GlobalError({ error }: GlobalErrorProps) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_TURBOPACK) Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        {/* Display the Next.js error page component with a default status code and the error message */}
        <NextError statusCode={500} title={error.message || "An unexpected error occurred"} />
      </body>
    </html>
  )
}
