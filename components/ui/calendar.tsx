"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ptBR } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 bg-white rounded-lg select-none", className)}
      locale={ptBR}
      classNames={{
        months: "flex flex-col",
        month: "space-y-4",
        caption: "flex justify-between relative items-center mb-4",
        caption_label: "text-base font-normal lowercase",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 text-zinc-500 hover:text-zinc-900 border-0"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-2",
        head_row: "grid grid-cols-7",
        head_cell: cn(
          "text-center font-normal h-9 relative flex items-center justify-center text-[0.7rem] text-zinc-600",
          "first:text-red-500"
        ),
        row: "grid grid-cols-7",
        cell: cn(
          "text-center relative p-0 focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-zinc-100",
          "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal text-[1rem] aria-selected:opacity-100 hover:bg-zinc-100",
          "[&:first-child]:text-red-500"
        ),
        day_selected: 
          "bg-blue-500 text-white hover:bg-blue-500 hover:text-white focus:bg-blue-500 focus:text-white",
        day_today: "bg-white text-black font-bold",
        day_outside: "text-zinc-400",
        day_disabled: "text-zinc-400",
        day_range_middle:
          "aria-selected:bg-zinc-100 aria-selected:text-zinc-900",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
