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

import type { Client } from "@upstash/qstash"
import { describe, expect, expectTypeOf, it, vi } from "vitest"
import z from "zod"

import type { JobHandlerType, JobInput, JobOutput, JobType } from "./dispatcher"
import { jobType } from "./builder"
import { JobDispatcher } from "./dispatcher"

describe("JobDispatcher", () => {
  const mockQstashClient = {
    publish: vi.fn(),
  }

  // Define some dummy jobs with spies injected
  const dummyJob1 = jobType("dummyJob1")
    .description("Dummy job 1 description")
    .input(z.object({ foo: z.string().transform((arg) => arg.length) }))
    .handler(
      vi.fn(async () => {
        return { bar: 42 }
      })
    )
    .build()

  const dummyJob2 = jobType("dummyJob2")
    .description("Dummy job 2 description")
    .synchronous()
    .input(z.object({ biz: z.number() }))
    .handler(
      vi.fn(async () => {
        return { qux: "result" }
      })
    )
    .build()

  const dispatcher = new JobDispatcher([dummyJob1, dummyJob2], {
    qstashClient: mockQstashClient as unknown as Client,
    baseUrl: "http://localhost:3000/api/jobs",
  })

  it("should be able to enumerate all registered job types", () => {
    const jobTypes = dispatcher.listJobTypes()
    expect(jobTypes).toEqual([
      { type: "dummyJob1", description: "Dummy job 1 description", synchronous: false },
      { type: "dummyJob2", description: "Dummy job 2 description", synchronous: true },
    ])
  })

  it("should correctly resolve JobType helper", () => {
    type Dispatcher = typeof dispatcher
    type DummyJobType = JobType<Dispatcher>

    expectTypeOf<DummyJobType>().toEqualTypeOf<"dummyJob1" | "dummyJob2">()
  })

  it("should make it possible to resolve the concrete JobInput type for a given job type by using the JobInput helper", () => {
    type Dispatcher = typeof dispatcher
    type DummyJob1InputType = JobInput<Dispatcher, "dummyJob1">
    type DummyJob2InputType = JobInput<Dispatcher, "dummyJob2">

    expectTypeOf<DummyJob1InputType>().toMatchTypeOf<{ foo: string }>()
    expectTypeOf<DummyJob2InputType>().toMatchTypeOf<{ biz: number }>()
  })

  it("should make it possible to resolve the output type for a given job type by using the JobOutput helper", () => {
    type Dispatcher = typeof dispatcher
    type DummyJob1OutputType = JobOutput<Dispatcher, "dummyJob1">
    type DummyJob2OutputType = JobOutput<Dispatcher, "dummyJob2">

    expectTypeOf<DummyJob1OutputType>().resolves.toMatchTypeOf<{ bar: number }>()
    expectTypeOf<DummyJob2OutputType>().resolves.toMatchTypeOf<{ qux: string }>()
  })

  it("should make it possible to resolve the concrete JobHandler type for a given job type by using the JobHandlerType helper", () => {
    type Dispatcher = typeof dispatcher
    type DummyJob1HandlerType = JobHandlerType<Dispatcher, "dummyJob1">
    type DummyJob2HandlerType = JobHandlerType<Dispatcher, "dummyJob2">

    expectTypeOf<DummyJob1HandlerType>().toMatchTypeOf<typeof dummyJob1>()
    expectTypeOf<DummyJob2HandlerType>().toMatchTypeOf<typeof dummyJob2>()
  })

  it("should schedule all asynchronous jobs for execution using QStash", async () => {
    // Given
    const jobInput = { foo: "test", bar: 42.12, bli: false, blab: new Date(Date.UTC(2024, 11, 24)) }
    const jobResponse = { messageId: "mocked-message-id" }
    mockQstashClient.publish.mockResolvedValueOnce(jobResponse)

    // When
    const result = await dispatcher.schedule("dummyJob1", jobInput)

    // Then
    expect(result).toEqual({ jobId: jobResponse.messageId })
    expect(mockQstashClient.publish).toHaveBeenCalledWith({
      url: "http://localhost:3000/api/jobs/dummyJob1",
      body: '{"json":{"foo":"test","bar":42.12,"bli":false,"blab":"2024-12-24T00:00:00.000Z"},"meta":{"values":{"blab":["Date"]}}}',
      headers: { "Content-Type": "application/json" },
    })
  })

  it("should run all synchronous jobs immediately and in-process", async () => {
    // Given
    const jobInput = { biz: 42 }

    // When
    const output = await dispatcher.schedule("dummyJob2", jobInput)

    // Then
    expect(output).toEqual({ output: { qux: "result" } })
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(dummyJob2.handle).toHaveBeenCalledWith(jobInput)
  })

  it("should be able to handle a job and return its output", async () => {
    // Given
    const jobInput = { biz: 123 }

    // When
    const output = await dispatcher.handle("dummyJob2", jobInput)

    // Then
    expect(output).toEqual({ qux: "result" })
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(dummyJob2.handle).toHaveBeenCalledWith(jobInput)
  })
})
