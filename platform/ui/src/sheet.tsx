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

import type { Scope } from "@radix-ui/react-context"
import type { VariantProps } from "class-variance-authority"
import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { createDialogScope } from "@radix-ui/react-dialog"
import { Cross2Icon } from "@radix-ui/react-icons"
import { cva } from "class-variance-authority"

import type { Prettify } from "@kreios/utils/types/prettify"

import { cn } from "."

type ScopedProps<P> = Prettify<P & { __scopeSheet?: Scope }>
const useDialogScope = createDialogScope()

type DialogProps = React.ComponentPropsWithoutRef<typeof SheetPrimitive.Root>
type SheetProps = Omit<DialogProps, "modal">

const Sheet: React.FC<SheetProps> = (props: ScopedProps<SheetProps>) => {
  const { __scopeSheet, ...SheetProps } = props
  const dialogScope = useDialogScope(__scopeSheet)
  return <SheetPrimitive.Root {...dialogScope} {...SheetProps} modal={true} />
}

Sheet.displayName = "Sheet"

type SheetTriggerProps = React.ComponentPropsWithoutRef<typeof SheetPrimitive.Trigger>

const SheetTrigger = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Trigger>, SheetTriggerProps>(
  (props: ScopedProps<SheetTriggerProps>, ref) => {
    const { __scopeSheet, ...triggerProps } = props
    const dialogScope = useDialogScope(__scopeSheet)
    return <SheetPrimitive.Trigger {...dialogScope} {...triggerProps} ref={ref} />
  }
)

SheetTrigger.displayName = "SheetTrigger"

type SheetCloseProps = React.ComponentPropsWithoutRef<typeof SheetPrimitive.Close>

const SheetClose = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Close>, SheetCloseProps>(
  (props: ScopedProps<SheetCloseProps>, ref) => {
    const { __scopeSheet, ...closeProps } = props
    const dialogScope = useDialogScope(__scopeSheet)
    return <SheetPrimitive.Close {...dialogScope} {...closeProps} ref={ref} />
  }
)

SheetClose.displayName = "SheetClose"

type SheetPortalProps = React.ComponentPropsWithoutRef<typeof SheetPrimitive.Portal>

const SheetPortal: React.FC<SheetPortalProps> = (props: ScopedProps<SheetPortalProps>) => {
  const { __scopeSheet, ...portalProps } = props
  const dialogScope = useDialogScope(__scopeSheet)
  return <SheetPrimitive.Portal {...dialogScope} {...portalProps} />
}

SheetPortal.displayName = "SheetPortal"

type SheetOverlayProps = React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>

const SheetOverlay = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Overlay>, SheetOverlayProps>(
  ({ className, __scopeSheet, ...props }: ScopedProps<SheetOverlayProps>, ref) => {
    const dialogScope = useDialogScope(__scopeSheet)
    return (
      <SheetPrimitive.Overlay
        className={cn(
          "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          className
        )}
        {...dialogScope}
        {...props}
        ref={ref}
      />
    )
  }
)
SheetOverlay.displayName = "SheetOverlay"

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Content>, SheetContentProps>(
  ({ side = "right", className, children, __scopeSheet, ...props }: ScopedProps<SheetContentProps>, ref) => {
    const dialogScope = useDialogScope(__scopeSheet)
    return (
      <SheetPortal>
        <SheetOverlay />
        <SheetPrimitive.Content
          {...dialogScope}
          ref={ref}
          className={cn(sheetVariants({ side }), className)}
          {...props}
        >
          {children}
          <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
            <Cross2Icon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </SheetPrimitive.Content>
      </SheetPortal>
    )
  }
)
SheetContent.displayName = "SheetContent"

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
)
SheetFooter.displayName = "SheetFooter"

type SheetTitleProps = React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>

const SheetTitle = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Title>, SheetTitleProps>(
  ({ className, __scopeSheet, ...props }: ScopedProps<SheetTitleProps>, ref) => {
    const dialogScope = useDialogScope(__scopeSheet)
    return (
      <SheetPrimitive.Title
        {...dialogScope}
        ref={ref}
        className={cn("text-lg font-semibold text-foreground", className)}
        {...props}
      />
    )
  }
)
SheetTitle.displayName = "SheetTitle"

type SheetDescriptionProps = React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>

const SheetDescription = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Description>, SheetDescriptionProps>(
  ({ className, __scopeSheet, ...props }: ScopedProps<SheetDescriptionProps>, ref) => {
    const dialogScope = useDialogScope(__scopeSheet)
    return (
      <SheetPrimitive.Description
        {...dialogScope}
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
      />
    )
  }
)
SheetDescription.displayName = "SheetDescription"

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
}
