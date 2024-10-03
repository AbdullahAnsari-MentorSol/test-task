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

import { verifySignatureAppRouter } from "@upstash/qstash/nextjs"
import superjson from "superjson"

import type { JobDispatcher, JobHandler, JobInput, JobType } from "./dispatcher"

/**
 * Returns a (Next.js) request handler that can be used to process incoming job requests.
 *
 * @param dispatcher - The job dispatcher instance.
 * @param options - Optional configuration options.
 * @returns The request handler function.
 */
export const createRequestHandler = <THandlers extends readonly JobHandler[]>(
  dispatcher: JobDispatcher<THandlers>,
  options?: { skipSignatureVerification?: boolean }
) => {
  const rawHandler = async (request: Request) => {
    try {
      const jobType = extractJobType(request.url, dispatcher)
      const input = await extractJobInput(request, jobType)
      const output = await dispatcher.handle(jobType, input)
      return createResponse(output, 200)
    } catch (error) {
      return createErrorResponse(error)
    }
  }
  return options?.skipSignatureVerification ? rawHandler : verifySignatureAppRouter(rawHandler)
}

/**
 * Extracts the job type from the request URL.
 *
 * @param url - The request URL.
 * @param dispatcher - The job dispatcher instance.
 * @returns The extracted job type.
 */
const extractJobType = <THandlers extends readonly JobHandler[]>(
  url: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dispatcher: JobDispatcher<THandlers>
): JobType<JobDispatcher<THandlers>> => {
  return new URL(url).pathname.split("/").pop() as JobType<JobDispatcher<THandlers>>
}

/**
 * Extracts the job input from the request body.
 *
 * @param request - The incoming request.
 * @param jobType - The job type to extract input for.
 * @returns The extracted job input.
 */
const extractJobInput = async <THandlers extends readonly JobHandler[]>(
  request: Request,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  jobType: JobType<JobDispatcher<THandlers>>
): Promise<JobInput<JobDispatcher<THandlers>, typeof jobType>> => {
  return superjson.parse(await request.text())
}

/**
 * Creates a successful response with the given output.
 *
 * @param output - The output of the job.
 * @param status - The HTTP status code.
 * @returns The created Response object.
 */
const createResponse = <T>(output: T, status: number): Response => {
  return new Response(superjson.stringify(output), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

/**
 * Creates an error response based on the given error.
 *
 * @param error - The error that occurred.
 * @returns The created Response object.
 */
const createErrorResponse = (error: unknown): Response => {
  const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
  return new Response(superjson.stringify({ error: errorMessage }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  })
}
