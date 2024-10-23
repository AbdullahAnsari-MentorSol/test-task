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

import type { ReactNode } from "react"
import type { ExternalToast, PromiseData, PromiseExternalToast, PromiseT, PromiseTResult } from "sonner"
import { useId, useLayoutEffect } from "react"
import { useTheme } from "next-themes"
import { useUnmount } from "react-use"
import { toast as _toast, Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AsyncGeneratorData<ToastNext extends { message: string }, ToastData = any> = PromiseExternalToast & {
  loading?: string | React.ReactNode
  success?: PromiseTResult<ToastData>
  error?: PromiseTResult
  description?: PromiseTResult
  next: PromiseTResult<ToastNext>
  minDuration?: number
  finally?: () => void | Promise<void>
}

const isHttpResponse = (data: unknown): data is Response =>
  !!data &&
  typeof data === "object" &&
  "ok" in data &&
  typeof data.ok === "boolean" &&
  "status" in data &&
  typeof data.status === "number"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const promise = <ToastData,>(promise: PromiseT<ToastData>, data?: PromiseData<ToastData>) => {
  if (!data) {
    // Nothing to show
    return
  }

  const { loading, success, error, description, finally: Finally, ...options } = data

  let id: string | number | undefined = undefined
  if (data.loading !== undefined) {
    id = toast.loading(loading, {
      ...options,
      // @ts-expect-error incorrexct react typyings can be ignored
      description: typeof description === "function" ? description(promise) : description,
    })
  }

  const p = promise instanceof Promise ? promise : promise()

  let shouldDismiss = id !== undefined

  p.then(async (response) => {
    if (isHttpResponse(response) && !response.ok) {
      shouldDismiss = false
      const message = typeof error === "function" ? await error(`HTTP error! status: ${response.status}`) : error

      toast.error(message, {
        id,
        description:
          typeof description === "function" ? await description(`HTTP error! status: ${response.status}`) : description,
      })
    } else if (success !== undefined) {
      shouldDismiss = false
      const message = typeof success === "function" ? await success(response) : success
      toast.success(message, {
        id,
        description: typeof description === "function" ? await description(response) : description,
      })
    }
  })
    .catch(async (err) => {
      if (error !== undefined) {
        shouldDismiss = false
        const message = typeof error === "function" ? await error(err) : error
        toast.error(message, {
          id,
          description: typeof description === "function" ? await description(err) : description,
        })
      }
    })
    .finally(() => {
      if (shouldDismiss) {
        // Toast is still in load state (and will be indefinitely — dismiss it)
        toast.dismiss(id)
        id = undefined
      }

      void Finally?.()
    })

  return id
}

const asyncIterator = async <ToastNext extends { message: string }, ToastData>(
  iteratorPromise:
    | Promise<AsyncGenerator<ToastNext, ToastData, unknown>>
    | AsyncGenerator<ToastNext, ToastData, unknown>,
  data?: AsyncGeneratorData<ToastNext, ToastData>
) => {
  if (!data) {
    return
  }

  let id: string | number | undefined = undefined

  if (data.loading !== undefined) {
    id = toast.loading(data.loading)

    await delay(data.minDuration ?? 1000)
  }

  let shouldDismiss = id !== undefined

  try {
    const iterator = (await iteratorPromise)[Symbol.asyncIterator]()

    let result: IteratorResult<ToastNext, ToastData>
    while (!(result = await iterator.next()).done) {
      if (data.next !== undefined) {
        shouldDismiss = false
        const message = typeof data.next === "function" ? await data.next(result.value) : data.next
        const description =
          typeof data.description === "function" ? await data.description(result.value) : data.description
        toast.loading(message, { id, description })
        await delay(data.minDuration ?? 1000)
      }
    }

    if (data.success !== undefined) {
      shouldDismiss = false
      const message = typeof data.success === "function" ? await data.success(result.value) : data.success
      const description =
        typeof data.description === "function" ? await data.description(result.value) : data.description
      toast.success(message, { id, description })
    }
  } catch (error) {
    console.error(error)
    if (data.error !== undefined) {
      shouldDismiss = false
      const message = typeof data.error === "function" ? await data.error(error) : data.error
      const description = typeof data.description === "function" ? await data.description(error) : data.description
      toast.error(message, { id, description })
    }
  } finally {
    if (shouldDismiss) {
      toast.dismiss(id)
      id = undefined
    }

    data.finally?.()
  }

  return id
}

const toast = Object.assign(_toast, { promise, asyncIterator })

const createToastComponent = (type?: "info" | "success" | "warning" | "error" | "message" | "loading") => {
  const fn = type ? toast[type] : toast
  return ({ children, id, data = {} }: { id?: string; children: ReactNode; data?: ExternalToast }) => {
    const internalId = id ?? useId()

    useLayoutEffect(() => {
      fn(children, { id: internalId, ...data })
    }, [children, data, internalId])

    useUnmount(() => {
      toast.dismiss(internalId)
    })

    return null
  }
}

const BasicToastComponent = createToastComponent()

const Toast = Object.assign(BasicToastComponent, {
  info: createToastComponent("info"),
  success: createToastComponent("success"),
  warning: createToastComponent("warning"),
  error: createToastComponent("error"),
  message: createToastComponent("message"),
  loading: createToastComponent("loading"),
})

export { Toast, Toaster, toast }
