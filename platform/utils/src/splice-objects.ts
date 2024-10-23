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

type ValueOrArray<T> = T | T[]
type MergedObject = Record<string, ValueOrArray<unknown>>

/**
 * A utility function to merge an array of objects into a single object
 * if object keys are the same and values are arrays, they will be concatenated
 */
export const spliceObjects = (results: MergedObject[]): MergedObject =>
  results.reduce((acc, result) => {
    for (const key in result) {
      const current = acc[key]
      const value = result[key]
      if (Array.isArray(value)) {
        if (Array.isArray(current)) {
          current.push(...(value as unknown[]))
        } else acc[key] = value
      } else {
        acc[key] = value
      }
    }

    return acc
  }, {})
