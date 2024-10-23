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

import type { ComponentProps } from "react"
import { forwardRef } from "react"
import NextLink from "next/link"

import { cn } from "."

export const Link = forwardRef<HTMLAnchorElement, ComponentProps<typeof NextLink>>(({ className, ...props }, ref) => (
  <NextLink
    className={cn("cursor-pointer text-sm font-medium underline-offset-4 hover:underline", className)}
    {...props}
    ref={ref}
  />
))

Link.displayName = "Link"
