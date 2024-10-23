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

/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { Prettify } from "./types/prettify"

type NotUndefined<T> = T extends undefined ? never : T

export type Mapper<T extends Record<string, unknown>> = {
  [K in keyof T]: (input: NotUndefined<T[K]>) => unknown
}

export type Mapped<T extends Mapper<Record<string, unknown>>> = Partial<{
  [K in keyof T]: ReturnType<T[K]>
}>

export const createMapper =
  <T extends Record<string, unknown>>(obj: T) =>
  <M extends Mapper<T>>(map: M) =>
    Object.fromEntries(
      Object.entries(obj)
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        .filter(([key, value]) => value !== undefined && map[key] !== undefined)
        // @ts-expect-error
        .map(([key, value]) => [key, map[key](value)])
      // @ts-expect-error
    ) as Prettify<Mapped<M>>
