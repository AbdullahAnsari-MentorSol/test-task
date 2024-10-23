import z from "zod"

import { jobType } from "@kreios/jobs"

export const helloWorld = jobType("hello-world")
  .description("A simple hello world job used for testing")
  .input(z.object({ name: z.string() }))
  .handler(async ({ name }) => {
    return `Hello, ${name}!`
  })
  .build()
