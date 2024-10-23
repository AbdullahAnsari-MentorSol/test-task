import { createRequestHandler, JobDispatcher } from "@kreios/jobs"

import { env } from "../env"
import { helloWorld } from "./hello-world"

export const name = "@example/jobs"

// Define your job handlers here
export const handlers = [helloWorld]

// The dispatcher is the central hub for scheduling and executing jobs
export const dispatcher = new JobDispatcher(handlers, {
  baseUrl: `https://${env.VERCEL_URL}/api/jobs`,
  qstashToken: env.QSTASH_TOKEN,
})

// The (Next.js) request handler that will route incoming requests to the dispatcher
//export const requestHandler = createRequestHandler(dispatcher, { skipSignatureVerification: !env.VERCEL })
export const requestHandler = createRequestHandler(dispatcher, { skipSignatureVerification: true }) // TODO: Hack to make it work with Vercel Cron
