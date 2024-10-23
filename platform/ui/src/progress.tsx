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

"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "."

export const ProgressRoot = ProgressPrimitive.Root
export const ProgressIndicator = ProgressPrimitive.Indicator

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

const ProgressWithDuration = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  Omit<React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>, "value"> & { duration: number }
>(({ className, max = 100, duration, ...props }, ref) => {
  const [width, setWidth] = React.useState(0)
  React.useEffect(() => {
    setWidth(max)
  }, [max])

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn("relative h-1 w-full overflow-hidden rounded-full bg-primary/20", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-primary transition-all ease-linear"
        style={{ transitionDuration: `${duration}ms`, transform: `translateX(-${max - width}%)` }}
      />
    </ProgressPrimitive.Root>
  )
})

export { Progress, ProgressWithDuration }
