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

import superjson from "superjson"
import { describe, expect, it, vi } from "vitest"
import { z } from "zod"

import { JobDispatcher } from "./dispatcher"
import { createRequestHandler } from "./request-handler"

vi.mock("@upstash/qstash/nextjs", () => ({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  verifySignatureAppRouter: vi.fn().mockImplementation((handler) => handler),
}))

describe("createRequestHandler", () => {
  const mockJobHandler = {
    metadata: {
      type: "testJob",
      description: "Test Job",
      synchronous: false,
    },
    inputSchema: z.object({
      foo: z.string(),
    }),
    handle: vi.fn().mockResolvedValue({ bar: 42 }),
  }

  const mockJobDispatcher = new JobDispatcher([mockJobHandler], {
    qstashToken: "testToken",
    baseUrl: "http://localhost/api/jobs",
  })

  const requestHandler = createRequestHandler(mockJobDispatcher)

  it("should handle a job request successfully", async () => {
    const mockRequest = new Request("http://localhost/api/jobs/testJob", {
      method: "POST",
      body: superjson.stringify({ foo: "test" }),
      headers: {
        "Content-Type": "application/json",
      },
    })

    const response = await requestHandler(mockRequest)
    const jsonResponse = await response.json()

    expect(response.status).toBe(200)
    expect(jsonResponse).toEqual({ json: { bar: 42 } })
    expect(mockJobHandler.handle).toHaveBeenCalledWith({ foo: "test" })
  })

  it("should return an error response for invalid job type", async () => {
    const mockRequest = new Request("http://localhost/api/jobs/invalidJob", {
      method: "POST",
      body: superjson.stringify({ foo: "test" }),
      headers: {
        "Content-Type": "application/json",
      },
    })

    const response = await requestHandler(mockRequest)
    const jsonResponse = await response.json()

    expect(response.status).toBe(500)
    expect(jsonResponse).toEqual({ json: { error: "Handler for job type invalidJob not found" } })
  })

  it("should return an error response for invalid input", async () => {
    const mockRequest = new Request("http://localhost/api/jobs/testJob", {
      method: "POST",
      body: superjson.stringify({ foo: 123 }), // Invalid input
      headers: {
        "Content-Type": "application/json",
      },
    })

    const response = await requestHandler(mockRequest)
    const jsonResponse = (await response.json()) as { json: { error: string } }

    expect(response.status).toBe(500)
    expect(jsonResponse.json.error).toContain("invalid_type")
  })

  it("should return an error response for handler failure", async () => {
    const error = new Error("Handler failed")
    mockJobHandler.handle.mockRejectedValueOnce(error)

    const mockRequest = new Request("http://localhost/api/jobs/testJob", {
      method: "POST",
      body: superjson.stringify({ foo: "test" }),
      headers: {
        "Content-Type": "application/json",
      },
    })

    const response = await requestHandler(mockRequest)
    const jsonResponse = await response.json()

    expect(response.status).toBe(500)
    expect(jsonResponse).toEqual({ json: { error: "Handler failed" } })
  })
})
