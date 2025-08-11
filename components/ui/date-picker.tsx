"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/utils/style/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  light?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled = false,
  light = false
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-10 text-sm",
            !value && "text-muted-foreground",
            light && "bg-white border-gray-300 text-gray-900 hover:bg-gray-50",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          "w-auto p-0",
          light && "bg-white border-gray-200"
        )} 
        align="start"
      >
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          disabled={{ after: new Date() }} // Disable future dates for DOB
          initialFocus
          className={light ? "text-gray-900" : ""}
        />
      </PopoverContent>
    </Popover>
  )
}