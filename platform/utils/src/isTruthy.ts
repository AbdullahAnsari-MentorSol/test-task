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

import type { Prettify } from "./types/prettify"

export type Truthy<T> = T extends false | "" | 0 | null | undefined ? never : T
/**
 * Type guard to check if a value is truthy
 */
export const isTruthy = <T>(value: T): value is Truthy<T> => Boolean(value)

export type CorrectRequired<T> = {
  [P in keyof T]: NonNullable<T[P]>
}

export type AugmentedRequired<T extends Record<string, unknown>, K extends keyof T = keyof T> = Prettify<
  Omit<T, K> & CorrectRequired<Pick<T, K>>
>

export const isPropertyTruthy =
  <T extends Record<string, unknown>, K extends keyof T = keyof T>(property: K) =>
  // @ts-expect-error - this is a type guard
  (value: T): value is AugmentedRequired<T, K> =>
    isTruthy(value[property])
