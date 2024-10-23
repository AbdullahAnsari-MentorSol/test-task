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

export type Split<S extends string, D extends string, R extends string[] = []> = S extends `${infer B}${D}${infer A}`
  ? Split<A, D, [...R, B]>
  : [...R, S]

export const split = <T extends string, S extends string>(value: T, separator: S): Split<T, S> =>
  value.split(separator) as Split<T, S>
