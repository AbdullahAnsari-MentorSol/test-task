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

export type Entries<T> = {
  [K in keyof T]: [K, T[K]]
}[keyof T][]

/**
 * Typesafe Object.entries
 */
export const entries = <T extends Record<string | number | symbol, unknown>>(o: T) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
  Object.entries(o as any) as Entries<T>
