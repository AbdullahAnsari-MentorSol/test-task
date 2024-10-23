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

/**
 * Returns the union of two arrays, determining by the result of calling the provided function on each element.
 * The order of result values is determined by the order they occur in the first array.
 *
 * @param fn - The function to apply to each element of the arrays.
 * @param arrays - The arrays to process.
 * @returns The new array of unique values.
 *
 * @example
 * ```ts
 * unionBy(({id}) => id, [{id: 1, name: 'foo'}, {id: 2, name: 'bar'}], [{id: 2, name: 'baz'}, {id: 3, name: 'qux'}])
 * // => [{id: 1, name: 'foo'}, {id: 2, name: 'baz'}, {id: 3, name: 'qux'}]
 * ```
 */
export const unionBy = <T>(fn: (e: T) => unknown, ...arrays: T[][]): T[] => {
  const map = new Map<unknown, T>()

  for (const array of arrays) {
    for (const item of array) {
      map.set(fn(item), item)
    }
  }

  return Array.from(map.values())
}
