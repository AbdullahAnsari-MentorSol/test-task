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

export async function promiseAllKeyed<T extends readonly [unknown, unknown][]>(values: T) {
  const results = await Promise.all(values.map(([, promise]) => promise))

  return values.map(([key], index) => [key, results[index]]) as {
    -readonly [P in keyof T]: [T[P][0], Awaited<T[P][1]>]
  }
}
