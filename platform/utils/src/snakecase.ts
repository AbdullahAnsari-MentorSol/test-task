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

import { snakeCase as snakeCaseLodash } from "lodash-es"

type RemovePrefix<Prefix extends string, S extends string> = S extends `${Prefix}${infer U}`
  ? RemovePrefix<Prefix, U>
  : S
type RemoveSuffix<Suffix extends string, S extends string> = S extends `${infer U}${Suffix}`
  ? RemoveSuffix<Suffix, U>
  : S

type RemoveBoth<P extends string, S extends string> = RemovePrefix<P, RemoveSuffix<P, S>>

type ExtractNumber<S extends string, WAS_NUMBER extends boolean = false> = S extends `${infer T}${infer U}`
  ? T extends `${number}`
    ? `${WAS_NUMBER extends true ? "" : "_"}${T}${ExtractNumber<U, true>}`
    : `${WAS_NUMBER extends true ? "_" : ""}${T}${ExtractNumber<U, false>}`
  : S

type UpperCase =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z"

type InteranlSnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? T extends "_" | "-"
    ? `_${InteranlSnakeCase<RemovePrefix<"-" | "_", U>>}`
    : `${T extends UpperCase ? "_" : ""}${Lowercase<T>}${InteranlSnakeCase<U>}`
  : S

export type SnakeCase<S extends string> = InteranlSnakeCase<Uncapitalize<RemoveBoth<"_" | "-", ExtractNumber<S>>>>

export const snakeCase = <T extends string>(str: T) => snakeCaseLodash(str) as unknown as SnakeCase<T>
