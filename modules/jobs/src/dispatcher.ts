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

import type { AnyZodObject, z } from "zod"
import { Client } from "@upstash/qstash"
import superjson from "superjson"

/**
 * Represents the options for configuring the job dispatcher.
 *
 * The caller must provide EITHER a `qstashToken` OR a `qstashClient`.
 *
 * @property {string} [qstashToken] - The token (i.e. API key) to use for authenticating with the Upstash QStash API.
 * @property {Client} [qstashClient] - The client to use for interacting with the Upstash QStash API.
 * @property {string} baseUrl - The fully-qualified base URI (i.e. dynamic Next.js API route) that QStash shall invoke to process jobs.
 */
type JobDispatcherOptions =
  | { qstashToken: string; qstashClient?: Client; baseUrl: string }
  | { qstashToken?: string; qstashClient: Client; baseUrl: string }

/**
 * Represents the ID of a job that is currently being processed.
 */
export type JobId = string

/**
 * A service that other components can use to dispatch (i.e. start) asynchronous jobs to run in the background.
 * The service is responsible for managing the lifecycle of the jobs, such as queuing, processing and completion.
 * It also handles all the nitty-gritty details of integrating with the underlying job processing system (QStash, for now).
 */
export class JobDispatcher<THandlers extends readonly JobHandler[]> {
  private readonly qstashClient: Client

  /**
   * Creates an instance of JobDispatcher.
   *
   * @param handlers - An array of job handlers to register with the dispatcher.
   * @param options - The options to configure the dispatcher.
   */
  constructor(
    private readonly handlers: THandlers,
    private readonly options: JobDispatcherOptions
  ) {
    // Ensure that at least one handler is specified
    if (handlers.length === 0) {
      throw new Error("At least one handler must be specified")
    }

    // Make sure we have a valid QStash client
    this.qstashClient = options.qstashClient ?? new Client({ token: options.qstashToken! })

    // Log some information so people know what's going on
    console.info(`Initialized job dispatcher with a total of ${handlers.length} handlers:`)
    handlers.forEach((handler) => console.info(`- ${handler.metadata.description} (${handler.metadata.type})`))
  }

  /**
   * Enumerates all the job types that are registered with this dispatcher.
   */
  public listJobTypes(): { type: string; description?: string }[] {
    return this.handlers.map((handler) => handler.metadata)
  }

  /**
   * Finds the handler for the given job type.
   * Throws an error if no handler is found.
   *
   * @param type - The type of the job to find the handler for.
   * @private
   * @returns The handler for the given job type.
   */
  private findHandlerForJobType<TType extends string, TSchema extends AnyZodObject, TOutput>(type: TType) {
    const handler = this.handlers.find((h) => h.metadata.type === type) as
      | JobHandler<TType, TSchema, TOutput>
      | undefined
    if (!handler) {
      throw new Error(`Handler for job type ${type} not found`)
    }
    return handler
  }

  /**
   * Schedules a job of the given type with the provided input.
   *
   * @param type - The type of the job to schedule.
   * @param input - The input for the job.
   * @returns The ID of the scheduled job.
   */
  async schedule<
    TType extends JobType<this>,
    TSchema extends AnyZodObject = JobSchema<this, TType>,
    TOutput = JobOutput<this, TType>,
  >(type: TType, input: z.input<TSchema>): Promise<{ jobId: JobId } | { output: TOutput }> {
    // Find the handler for the given job type
    const handler = this.findHandlerForJobType<TType, TSchema, TOutput>(type)

    // Make sure the input we have received is valid
    const parsedInput = handler.inputSchema.parse(input)

    // If the handler is synchronous, we can run it directly
    if (handler.metadata.synchronous) {
      console.info(`Running synchronous job of type ${type}`)
      const output = await handler.handle(parsedInput) // Run the handler with the parsedInput
      return { output: output }
    }

    // If the handler is asynchronous, we need to schedule it with QStash
    else {
      // Call the QStash API to publish the job
      const response = await this.qstashClient.publish({
        url: `${this.options.baseUrl}/${type}`,
        body: superjson.stringify(input), // Send the unparsed input to parsed inside the dispatcher.handle method
        headers: { "Content-Type": "application/json" },
      })

      // Return the ID of the newly created job
      console.info(`Scheduled job of type ${type} with ID ${response.messageId} (URL: ${this.options.baseUrl}/${type})`)
      return { jobId: response.messageId }
    }
  }

  /**
   * Handles a job of the given type with the provided input.
   *
   * @param type - The type of the job to handle.
   * @param input - The input for the job.
   * @returns The output of the job.
   */
  async handle<
    TType extends JobType<this>,
    TSchema extends AnyZodObject = JobSchema<this, TType>,
    TOutput = JobOutput<this, TType>,
  >(type: TType, input: z.input<TSchema>): Promise<TOutput> {
    // Find the handler for the given job type
    const handler = this.findHandlerForJobType<TType, TSchema, TOutput>(type)

    // Validate the input against the handler's schema
    const parsedInput = handler.inputSchema.parse(input)

    // Finally, call the handler to process the job
    console.info(`Received request to handle job of type ${type}`)
    try {
      return await handler.handle(parsedInput) // Run the handler with the parsedInput
    } catch (error) {
      console.error(`Error handling job of type ${type}:`, error)
      throw error
    }
  }
}

/**
 * Represents the metadata for a job handler.
 */
export type JobHandlerMetadata<TType extends string = string> = {
  /**
   * The unique identifier for the job handler.
   */
  type: TType

  /**
   * A human-readable description of the job handler.
   */
  description?: string

  /**
   * Whether the job handler is to be invoked synchronously or asynchronously.
   * If true, the `JobDispatcher.schedule` method will block until the job has run to completion.
   */
  synchronous: boolean
}

/**
 * Represents a job handler that can be dispatched to run in the background.
 */
export interface JobHandler<
  TType extends string = string,
  TSchema extends AnyZodObject = AnyZodObject,
  TOutput = unknown,
> {
  metadata: JobHandlerMetadata<TType>

  /**
   * The Zod schema for the input of the job handler.
   */
  inputSchema: TSchema

  /**
   * Handles the job with the given input and returns the output.
   *
   * @param input - The input for the job.
   * @returns The output of the job.
   */
  handle(input: z.infer<TSchema>): Promise<TOutput>
}

/**
 * Helper type to get the union of all type IDs in a given JobDispatcher.
 */
export type JobType<TDispatcher> = TDispatcher extends JobDispatcher<infer T> ? T[number]["metadata"]["type"] : never

/**
 * Helper type to get the handler type for a specific job type in a given JobDispatcher.
 */
export type JobHandlerType<TDispatcher, TTypeId extends JobType<TDispatcher>> =
  TDispatcher extends JobDispatcher<infer T> ? Extract<T[number], { metadata: { type: TTypeId } }> : never

/**
 * Helper type to get the input type for a specific job type in a given JobDispatcher.
 */
export type JobInput<TDispatcher, TTypeId extends JobType<TDispatcher>> = z.input<JobSchema<TDispatcher, TTypeId>>

/**
 * Helper type to get the input schema for a specific job type in a given JobDispatcher.
 */
export type JobSchema<TDispatcher, TTypeId extends JobType<TDispatcher>> = JobHandlerType<
  TDispatcher,
  TTypeId
>["inputSchema"]

/**
 * Helper type to get the output type for a specific job type in a given JobDispatcher.
 */
export type JobOutput<TDispatcher, TTypeId extends JobType<TDispatcher>> = ReturnType<
  JobHandlerType<TDispatcher, TTypeId>["handle"]
>
