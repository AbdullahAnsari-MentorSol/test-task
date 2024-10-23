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

import type { LinkProps } from "next/link"
import type { ComponentProps } from "react"
import { forwardRef } from "react"
import NextLink from "next/link"

import { Button } from "./button"

export const ButtonLink = forwardRef<HTMLAnchorElement, ComponentProps<typeof Button> & LinkProps>(
  (
    {
      href,
      as,
      replace,
      scroll,
      shallow,
      passHref,
      prefetch,
      locale,
      legacyBehavior,
      onMouseEnter,
      onTouchStart,
      onClick,
      children,
      variant = "ghost",
      ...props
    },
    ref
  ) => (
    <Button asChild variant={variant} {...props}>
      <NextLink
        href={href}
        as={as}
        replace={replace}
        scroll={scroll}
        shallow={shallow}
        passHref={passHref}
        prefetch={prefetch}
        locale={locale}
        legacyBehavior={legacyBehavior}
        onMouseEnter={onMouseEnter}
        onTouchStart={onTouchStart}
        onClick={onClick}
        ref={ref}
      >
        {children}
      </NextLink>
    </Button>
  )
)

ButtonLink.displayName = "Link"
