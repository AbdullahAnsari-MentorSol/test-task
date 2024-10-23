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

import type { Split } from "./split"
import type { Prettify } from "./types/prettify"
import { capitalize } from "./capitilize"
import { split } from "./split"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Join<T extends any[], U extends string | number> = T extends [infer F, ...infer R]
  ? R["length"] extends 0
    ? `${F & string}`
    : `${F & string}${U}${Join<R, U>}`
  : never

type CapitalizeWords<T extends string[]> = {
  [K in keyof T]: T[K] extends string ? Capitalize<T[K]> : T[K]
}

/**
 * Capitalizes each word in a hyphen-separated string.
 *
 * @param {string} str - The hyphen-separated string to be capitalized.
 * @returns {string} The string with each word capitalized and hyphens replaced by spaces.
 *
 * @example
 * // returns "Hello World"
 * capitalizeWords("hello-world")
 */
export const capitalizeWords = <T extends string>(str: T): Prettify<Join<CapitalizeWords<Split<T, "-">>, " ">> =>
  split(str, "-")
    .map((word) => capitalize(word))
    .join(" ") as unknown as Prettify<Join<CapitalizeWords<Split<T, "-">>, " ">>
