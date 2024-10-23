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

import type { VariantProps } from "class-variance-authority"
import * as React from "react"
import { cva } from "class-variance-authority"

import { colorIsDark } from "@kreios/utils/color"

import { cn } from "."

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  color?: string
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(({ className, variant, color, style, ...props }, ref) => {
  const mergedStyle = style || color ? { ...style, "--color": color } : style

  return (
    <div
      style={mergedStyle}
      ref={ref}
      className={cn(
        badgeVariants({ variant }),
        !!color && `hover:bg-[var(--color)]/80 bg-[var(--color)] ${colorIsDark(color) ? "text-white" : "text-black"}`,
        className
      )}
      {...props}
    />
  )
})

export { Badge, badgeVariants }
