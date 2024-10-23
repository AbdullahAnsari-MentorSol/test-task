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

import { describe, expect, expectTypeOf, it } from "vitest"
import z from "zod"

import { jobType } from "./builder"

describe("JobTypeBuilder", () => {
  it("should create a job handler with the correct metadata", () => {
    // When
    const exampleJobType = jobType("exampleJob")
      .description("An example job")
      .synchronous()
      .input(z.object({ foo: z.string() }))
      .handler(async (_input) => {
        return { bar: 42 }
      })
      .build()

    // Then
    expect(exampleJobType.metadata).toEqual({
      type: "exampleJob",
      description: "An example job",
      synchronous: true,
    })
  })

  it("should expect an empty input schema if no input is provided", () => {
    // When
    const job = jobType("noInputJob")
      .description("A job with no input")
      .handler(async () => {
        return { result: "success" }
      })
      .build()

    // Then
    expect(JSON.stringify(job.inputSchema.shape)).toEqual(JSON.stringify(z.object({}).shape))
  })

  it("should preserve the type of the job name", () => {
    // When
    const job = jobType("specificJob")
      .description("A specific job")
      .input(z.object({ baz: z.number() }))
      .handler(async (_input) => {
        return { qux: "result" }
      })
      .build()

    // Then
    expectTypeOf(job.metadata.type).toEqualTypeOf<"specificJob">()
  })

  it("should correctly infer input and output types for the handler", () => {
    // When
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const job = jobType("testJob")
      .description("A test job")
      .input(z.object({ foo: z.string().transform((arg) => arg.length) }))
      .handler(async (_input) => {
        return { bar: 42 }
      })
      .build()

    // Then
    type InputType = Parameters<typeof job.handle>[0]
    type OutputType = Awaited<ReturnType<typeof job.handle>>

    expectTypeOf<InputType>().toMatchTypeOf<{ foo: number }>()
    expectTypeOf<OutputType>().toMatchTypeOf<{ bar: number }>()
  })

  it("should create independent instances of JobTypeBuilder", () => {
    // When
    const builder1 = jobType("job1")
      .description("Job 1")
      .input(z.object({ foo: z.string() }))
      .handler(async (_input) => {
        return { bar: "42" }
      })
    const builder2 = builder1.description("Job 2").handler(async (_input) => {
      return { jizz: 66 }
    })

    const job1 = builder1.build()
    const job2 = builder2.build()

    // Then
    expect(job1.metadata.description).toBe("Job 1")
    expect(job2.metadata.description).toBe("Job 2")

    type Job1OutputType = Awaited<ReturnType<typeof job1.handle>>
    type Job2OutputType = Awaited<ReturnType<typeof job2.handle>>

    expectTypeOf<Job1OutputType>().toMatchTypeOf<{ bar: string }>()
    expectTypeOf<Job2OutputType>().toMatchTypeOf<{ jizz: number }>()
  })
})
