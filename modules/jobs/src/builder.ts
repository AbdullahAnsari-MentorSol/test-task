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

import type { AnyZodObject } from "zod"
import { z } from "zod"

import type { JobHandler, JobHandlerMetadata } from "./dispatcher"

/**
 * JobHandlerBuilder class to fluently create job handlers with type safety.
 */
class JobHandlerBuilder<TType extends string, TSchema extends AnyZodObject, TOutput> {
  private metadata: JobHandlerMetadata<TType>
  private inputSchema?: TSchema
  private jobHandler?: (input: TSchema) => Promise<TOutput>

  /**
   * Initializes a new instance of JobHandlerBuilder with the specified job type.
   * @param type - The type of the job.
   */
  constructor(type: TType) {
    this.metadata = { type, synchronous: false }
  }

  /**
   * Sets the description for the job.
   * @param desc - The description of the job.
   * @returns A new JobHandlerBuilder instance with the updated description.
   */
  description(desc: string): JobHandlerBuilder<TType, TSchema, TOutput> {
    const builder = new JobHandlerBuilder<TType, TSchema, TOutput>(this.metadata.type)
    builder.metadata = { ...this.metadata, description: desc }
    builder.inputSchema = this.inputSchema
    builder.jobHandler = this.jobHandler
    return builder
  }

  /**
   * Sets whether the job is synchronous or asynchronous.
   * @param value - Whether the job is synchronous (true) or asynchronous (false). Default is true.
   * @returns A new JobHandlerBuilder instance with the updated synchronous value.
   */
  synchronous(value = true): JobHandlerBuilder<TType, TSchema, TOutput> {
    const builder = new JobHandlerBuilder<TType, TSchema, TOutput>(this.metadata.type)
    builder.metadata = { ...this.metadata, synchronous: value }
    builder.inputSchema = this.inputSchema
    builder.jobHandler = this.jobHandler
    return builder
  }

  /**
   * Sets the input schema for the job using Zod.
   * @param schema - The Zod schema for the job input.
   * @returns A new JobHandlerBuilder instance with the updated input schema.
   */
  input<USchema extends AnyZodObject>(schema: USchema): JobHandlerBuilder<TType, USchema, TOutput> {
    if (this.jobHandler) {
      throw new Error("handler() must be called after input()")
    }

    const builder = new JobHandlerBuilder<TType, USchema, TOutput>(this.metadata.type)
    builder.metadata = { ...this.metadata }
    builder.inputSchema = schema
    return builder
  }

  /**
   * Sets the handler function for the job.
   * @param handle - The function to handle the job input and produce the output.
   * @returns A new JobHandlerBuilder instance with the updated handler.
   * @throws An error if input schema is not set.
   */
  handler<UOutput>(handle: (input: z.infer<TSchema>) => Promise<UOutput>): JobHandlerBuilder<TType, TSchema, UOutput> {
    const builder = new JobHandlerBuilder<TType, TSchema, UOutput>(this.metadata.type)
    builder.metadata = { ...this.metadata }
    builder.inputSchema = this.inputSchema
    builder.jobHandler = handle
    return builder
  }

  /**
   * Builds and returns a JobHandler instance.
   * @returns The created JobHandler instance.
   * @throws An error if handler is not set.
   */
  build(): JobHandler<TType, TSchema, TOutput> {
    if (!this.jobHandler) {
      throw new Error("handler() must be called before build()")
    }

    // Ensure inputSchema is set to zod.object({}) only if it is not already provided
    const inputSchema = this.inputSchema ?? (z.object({}) as TSchema)

    return {
      metadata: this.metadata,
      inputSchema: inputSchema,
      handle: this.jobHandler,
    }
  }
}

/**
 * Initializes a new JobHandlerBuilder with the specified job type.
 * @param type - The type of the job.
 * @returns A new JobHandlerBuilder instance.
 */
export const jobType = <TType extends string>(type: TType) => new JobHandlerBuilder<TType, AnyZodObject, unknown>(type)
