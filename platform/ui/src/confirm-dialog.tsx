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

import type { FC, ReactNode } from "react"
import { useCallback, useState } from "react"
import constate from "constate"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog"

type DialogOptions = {
  title?: string
  description?: string
  cancelLabel?: string
  confirmLabel?: string
}

const [ConfirmProvider, useConfirmDialogContext, useConfirmInternal] = constate(
  () => {
    const [open, setOpen] = useState(false)
    const [options, setOptions] = useState<DialogOptions>({})
    const [resolveReject, setResolveReject] = useState<[() => void, () => void] | null>(null)

    const confirm = useCallback((options: DialogOptions) => {
      setOptions(options)
      setOpen(true)

      return new Promise<void>((resolve, reject) => {
        setResolveReject([resolve, reject])
      })
    }, [])

    const handleCancel = useCallback(() => {
      if (resolveReject) {
        resolveReject[1]()
      }
      setOpen(false)
    }, [resolveReject])

    const handleConfirm = useCallback(() => {
      if (resolveReject) {
        resolveReject[0]()
      }
      setOpen(false)
    }, [resolveReject])

    return {
      open,
      options,
      confirm,
      handleCancel,
      handleConfirm,
    }
  },
  (value) => value,
  (value) => value.confirm
)

const ConfirmDialog: FC = () => {
  const { open, options, handleCancel, handleConfirm } = useConfirmDialogContext()

  if (!open) return null

  return (
    <AlertDialog open={open} onOpenChange={handleCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{options.title ?? "Confirm"}</AlertDialogTitle>
          <AlertDialogDescription>{options.description ?? "Are you sure you want to proceed?"}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>{options.cancelLabel ?? "Cancel"}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleConfirm}>
            {options.confirmLabel ?? "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
/**
 * Provider component that wraps your application to allow to use the `useConfirm` hook.
 */
export const ConfirmDialogProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ConfirmProvider>
      <ConfirmDialog />
      {children}
    </ConfirmProvider>
  )
}

/**
 * Hook to trigger a confirmation dialog.
 *
 * This hook can be used to trigger a confirmation dialog with customizable options.
 * It returns a promise that resolves when the user confirms the action and rejects if the user cancels.
 *
 * @example
 * ```typescript
 * import { useConfirm } from '@kreios/ui/confirm-dialog';
 *
 * const MyComponent = () => {
 *   const confirm = useConfirm();
 *
 *   const handleDelete = async () => {
 *     try {
 *       await confirm({
 *         title: 'Delete Item',
 *         description: 'Are you sure you want to delete this item?',
 *         cancelLabel: 'Cancel',
 *         confirmLabel: 'Delete',
 *       });
 *       // Proceed with deletion logic
 *     } catch {
 *       // Handle cancel action
 *     }
 *   };
 *
 *   return <button onClick={handleDelete}>Delete</button>;
 * };
 * ```
 *
 * @returns A function to trigger the confirmation dialog.
 */
export const useConfirm = useConfirmInternal
