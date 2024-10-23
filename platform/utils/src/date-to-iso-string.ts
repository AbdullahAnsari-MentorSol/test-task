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
 * Formats a date to ISO string.
 * Accepts Date objects, strings, or null/undefined.
 * Returns ISO string or null.
 *
 * @param date - The date to format, which can be a Date object, string, null, or undefined.
 * @returns The ISO string representation of the date, or null if the date is not valid.
 */

export type ISOString = `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`

export function formatDateToIsoString<T extends Date | string | null | undefined>(
  date: T
): T extends Date | ISOString ? ISOString : null {
  if (!date) return null as T extends Date | ISOString ? ISOString : null
  return (date instanceof Date ? date.toISOString() : new Date(date).toISOString()) as T extends Date | ISOString
    ? ISOString
    : null
}

export function getDateFromISOString<T extends ISOString | null | undefined>(
  date: T
): T extends ISOString ? Date : null {
  if (!date) return null as T extends ISOString ? Date : null
  return new Date(date) as T extends ISOString ? Date : null
}
