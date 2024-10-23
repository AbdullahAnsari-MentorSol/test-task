import { createJobRunnerCommand } from "@kreios/jobs"

import { dispatcher } from "./index"

const program = createJobRunnerCommand(dispatcher)
program.parse()
