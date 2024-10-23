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
import type { DayPickerSingleProps } from "react-day-picker"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import type { ButtonProps } from "./button"
import { cn } from "."
import { Button } from "./button"
import { Calendar } from "./calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

export { type DateRange, type SelectSingleEventHandler } from "react-day-picker"

export const DatePicker: FC<
  Omit<ButtonProps, "onChange"> & {
    value: Date | undefined
    onChange: NonNullable<DayPickerSingleProps["onSelect"]>
  }
> = ({ value, onChange, className, ...props }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("w-[240px] pl-3 text-left font-normal", !value && "text-muted-foreground", className)}
          {...props}
        >
          {value ? format(value, "PPP") : <span>Pick a date</span>}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar initialFocus mode="single" selected={value} onSelect={onChange} />
      </PopoverContent>
    </Popover>
  )
}
