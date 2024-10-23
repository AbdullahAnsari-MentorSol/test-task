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
import type { DateRange, SelectRangeEventHandler } from "react-day-picker"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import type { ButtonProps } from "./button"
import { cn } from "."
import { Button } from "./button"
import { Calendar } from "./calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

export { type DateRange, type SelectRangeEventHandler } from "react-day-picker"

export const DatePickerWithRange: FC<
  Omit<ButtonProps, "onChange"> & {
    dateRange: DateRange | undefined
    onChange: SelectRangeEventHandler
  }
> = ({ dateRange, onChange, className, ...props }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          {...props}
          id="date"
          variant={"outline"}
          className={cn(
            "w-[300px] justify-start overflow-hidden text-left font-normal",
            !dateRange && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
              </>
            ) : (
              format(dateRange.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={onChange}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}
