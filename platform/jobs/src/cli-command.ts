/**
 * This file is part of the Kreios platform.
 *
 * Copyright (c) 2024 KREIOS S.A.R.L
 * Licensed under the MIT License (Expat). You may obtain a copy of the License
 * in the LICENSE file in the root directory of this source tree.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Command } from "@commander-js/extra-typings"
import superjson from "superjson"
import { z } from "zod"

import type { JobDispatcher, JobHandler } from "./dispatcher"

/**
 * Creates a Command object for running jobs through the CLI.
 * This function sets up a command that can execute jobs with proper input validation
 * and error handling, providing a user-friendly interface for job execution.
 *
 * @param dispatcher - The JobDispatcher instance containing registered job handlers
 * @returns A Command object that can be added to a Commander program
 */
export const createJobRunnerCommand = <THandlers extends readonly JobHandler[]>(
  dispatcher: JobDispatcher<THandlers>
) => {
  const program = new Command().description("CLI for running and managing jobs")

  program.addCommand(createRunJobCommand(dispatcher))
  program.addCommand(createEncodeUrlCommand(dispatcher))

  return program
}

const createRunJobCommand = <THandlers extends readonly JobHandler[]>(dispatcher: JobDispatcher<THandlers>) => {
  return new Command("run-job")
    .description("Run a job")
    .argument("[jobType]", "The type of job to run")
    .option("-i, --input <json>", "JSON input for the job", "{}")
    .action(async (jobType: string | undefined, options: { input?: string }) => {
      try {
        if (!jobType) {
          // List all available job types if no job type is specified
          console.log("Available job types:")
          dispatcher.listJobTypes().forEach((job) => {
            console.log(`- ${job.type}: ${job.description ?? "No description"}`)
          })
          return
        }

        // Locate the appropriate job handler
        const jobHandler = dispatcher.handlers.find((handler) => handler.metadata.type === jobType)
        if (!jobHandler) {
          throw new Error(`Job type '${jobType}' not found`)
        }

        if (!options.input) {
          console.error(`No input provided. This job requires input of the following shape:`)
          console.error(describeSchema(jobHandler.inputSchema))
          process.exit(1)
        }

        // Parse and validate the input JSON
        const validatedInput = parseJsonInput(options.input, jobHandler.inputSchema)

        // Execute the job and display the result
        const result = await dispatcher.handle(jobType, validatedInput)
        console.log("Job result:", superjson.stringify(result))
      } catch {
        process.exit(1)
      }
    })
    .addHelpText("after", () => {
      const jobTypes = dispatcher.listJobTypes()
      return `
Available job types:
${jobTypes.map((job) => `  ${job.type}: ${job.description ?? "No description"}`).join("\n")}
`
    })
}

/**
 * Creates a Command object for encoding job input and generating a URL.
 *
 * @param dispatcher - The JobDispatcher instance containing registered job handlers
 * @returns A Command object that can be added to a Commander program
 */
export const createEncodeUrlCommand = <THandlers extends readonly JobHandler[]>(
  dispatcher: JobDispatcher<THandlers>
) => {
  return new Command("encode-url")
    .description("Encode job input and generate a URL for job execution")
    .argument("<jobType>", "The type of job to encode input for")
    .option("-i, --input <json>", "JSON input for the job")
    .action(async (jobType: string, options: { input?: string }) => {
      try {
        // Locate the appropriate job handler
        const jobHandler = dispatcher.handlers.find((handler) => handler.metadata.type === jobType)
        if (!jobHandler) {
          throw new Error(`Job type '${jobType}' not found`)
        }

        if (!options.input) {
          console.error(`No input provided. This job requires input of the following shape:`)
          console.error(describeSchema(jobHandler.inputSchema))
          process.exit(1)
        }

        // Parse the input JSON
        const parsedInput = JSON.parse(options.input) as unknown

        // Stringify with superjson
        const superjsonString = superjson.stringify(parsedInput)

        // Base64 encode the superjson string
        const base64Encoded = Buffer.from(superjsonString).toString("base64")

        // Generate the URL
        const url = `${dispatcher.options.baseUrl}/${jobType}?input=${encodeURIComponent(base64Encoded)}`

        console.log("\nOriginal input:")
        console.log(options.input)
        console.log("\nSuperjson version:")
        console.log(superjsonString)
        console.log("\nBase64 encoded version:")
        console.log(base64Encoded)
        console.log("\nHTTP GET URL:")
        console.log(url)
      } catch (error) {
        if (error instanceof SyntaxError) {
          console.error("Invalid JSON input. Please provide a valid JSON string.", error)
        } else {
          console.error("Error encoding input:", error)
        }
        process.exit(1)
      }
    })
    .addHelpText("after", () => {
      const jobTypes = dispatcher.listJobTypes()
      return `
Available job types:
${jobTypes.map((job) => `  ${job.type}: ${job.description ?? "No description"}`).join("\n")}
`
    })
}

// HELPER FUNCTIONS

const parseJsonInput = <TSchema extends z.Schema>(input: string, schema: TSchema): z.infer<TSchema> => {
  try {
    const parsedInput = JSON.parse(input) as unknown
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return schema.parse(parsedInput)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Input validation error:")
      console.error(error.errors.map((err) => `- ${err.path.join(".")}: ${err.message}`).join("\n"))
      console.error("\nExpected input shape:")

      console.error(describeSchema(schema))
    } else if (error instanceof SyntaxError) {
      console.error("Invalid JSON input. Please provide a valid JSON string.", error)
    } else {
      // Handle other types of errors
      console.error("Error validating input:", error)
    }
    throw error
  }
}
/**
 * Generates a human-readable description of a Zod schema.
 * This function recursively traverses the schema structure to provide
 * a clear representation of the expected input shape.
 *
 * @param schema - The Zod schema to describe
 * @returns A string representation of the schema
 */
function describeSchema(schema: z.ZodTypeAny): string {
  /* eslint-disable */
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape as Record<string, z.ZodTypeAny>
    const fields = Object.entries(shape)
      .map(([key, value]) => `  ${key}: ${describeSchema(value)}`)
      .join("\n")
    return `{\n${fields}\n}`
  }
  if (schema instanceof z.ZodString) return "string"
  if (schema instanceof z.ZodNumber) return "number"
  if (schema instanceof z.ZodBoolean) return "boolean"
  if (schema instanceof z.ZodArray) return `array of ${describeSchema(schema.element)}`
  if (schema instanceof z.ZodEnum) return `enum(${schema.options.map((o: any) => `"${o}"`).join(" | ")})`
  if (schema instanceof z.ZodUnion) return schema.options.map((o: any) => describeSchema(o)).join(" | ")
  if (schema instanceof z.ZodOptional) return `${describeSchema(schema.unwrap())} (optional)`
  return schema.constructor.name
  /* eslint-enable */
}
