import * as React from "react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import "react-day-picker/style.css"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("rdp-custom", className)}
      classNames={{
        ...classNames,
      }}
      style={
        {
          "--rdp-accent-color": "#2563eb",
          "--rdp-accent-background-color": "#2563eb",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}