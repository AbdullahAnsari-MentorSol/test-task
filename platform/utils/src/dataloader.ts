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

import type { BatchLoadFn, Options } from "dataloader"
import chalk from "chalk"
import DataloaderBase from "dataloader"
import { throttle } from "lodash-es"

export class DataLoader<K, V> extends DataloaderBase<K, V> {
  private lastCallTime = 0
  private debounceTime = 50
  private throttleTime = 5000
  private batchFunctionName: string
  private skippedWarnings = 0

  constructor(batchLoadFn: BatchLoadFn<K, V>, options?: Options<K, V> & { name?: string }) {
    if (process.env.NODE_ENV !== "production")
      super((keys: readonly K[]) => {
        const now = Date.now()
        if (now - this.lastCallTime < this.debounceTime) {
          this.skippedWarnings++
          this.logWarningThrottled(keys)
        }

        this.lastCallTime = now

        return batchLoadFn(keys)
      }, options)
    else super(batchLoadFn, options)
    this.batchFunctionName = options?.name ?? (batchLoadFn.name || "anonymous")
  }

  private logWarning(keys: readonly K[]) {
    const keysInfo = chalk.gray(
      keys.length > 4 ? `[${keys.slice(0, 3).join(",")}, ... ${keys.length - 3} more items]` : `[${keys.join(",")}]`
    )
    const skippedWarningsMessage = this.skippedWarnings > 1 ? chalk.yellow(`${this.skippedWarnings} times`) : "rapidly"

    console.warn(
      chalk.yellow("[WARN]"),
      `DataLoader batch function ${chalk.gray(this.batchFunctionName)} is being called ${skippedWarningsMessage}, which may indicate it is not correctly batched.`,
      `Keys: ${keysInfo}`
    )

    this.skippedWarnings = 0
  }

  private logWarningThrottled = throttle(this.logWarning.bind(this), this.throttleTime, {
    leading: true,
    trailing: true,
  })
}
