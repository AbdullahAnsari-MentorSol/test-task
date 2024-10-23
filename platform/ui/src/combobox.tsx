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

import type { FC } from "react"
import { useState } from "react"
import { CheckIcon, ChevronsUpDown } from "lucide-react"

import type { ButtonProps } from "./button"
import { cn } from "."
import { Button } from "./button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandLoading } from "./command"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

interface ComboboxProps {
  options: { value: string; label: string }[]
  value: { value: string; label: string } | null
  loading?: boolean
  onChange: (value: { value: string; label: string } | null) => void
  label: string
  shouldFilter?: boolean
  variant?: ButtonProps["variant"]
  className?: string
  indicatorIcon?: React.ElementType
  search?: string
  onSearchChange?: (search: string) => void
}

export const Combobox: FC<ComboboxProps> = ({
  className,
  options: choices,
  variant = "outline",
  search,
  onSearchChange,
  value,
  onChange,
  loading,
  label,
  shouldFilter,
  indicatorIcon: IndicatorIcon = ChevronsUpDown,
}) => {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          role="combobox"
          className={cn("justify-between", !value && "text-muted-foreground", className)}
        >
          {value?.label ?? <>Select {label}</>}
          <IndicatorIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command label={label} shouldFilter={shouldFilter}>
          <CommandInput value={search} onValueChange={onSearchChange} placeholder={`Search ${label}...`} />
          <CommandList>
            {loading === true && <CommandLoading />}
            <CommandEmpty>No {label} found.</CommandEmpty>

            <CommandGroup>
              {choices.map((option) => (
                <CommandItem
                  value={option.label}
                  key={option.value}
                  onSelect={() => {
                    onChange(option)
                    setOpen(false)
                  }}
                >
                  <CheckIcon
                    className={cn("mr-2 h-4 w-4", option.value === value?.value ? "opacity-100" : "opacity-0")}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
