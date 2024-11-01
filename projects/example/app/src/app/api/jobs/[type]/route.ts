import { requestHandler } from "@example/jobs"

export const runtime = "nodejs"
export const maxDuration = 60

export const GET = requestHandler
export const POST = requestHandler
