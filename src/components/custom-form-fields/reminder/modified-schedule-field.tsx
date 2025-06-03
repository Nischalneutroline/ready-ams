"use client"

import { useFormContext } from "react-hook-form"
import { Checkbox } from "@/components/ui/checkbox"
import { FormControl, FormItem, FormLabel } from "@/components/ui/form"
import { CalendarIcon, ClockIcon } from "lucide-react"
import SelectField from "./select-field"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface ScheduleFieldProps {
  name: string
  label: string
  dayFieldName?: string
  hourFieldName?: string
  minuteFieldName?: string
  dateFieldName?: string
  timeFieldName?: string
}

export const dayOptions = Array.from({ length: 30 }, (_, i) => ({
  label: `${i + 1} day${i + 1 > 1 ? "s" : ""}`,
  value: (i + 1).toString(),
}))
export const hourOptions = Array.from({ length: 24 }, (_, i) => ({
  label: `${i + 1} hour${i + 1 > 1 ? "s" : ""}`,
  value: (i + 1).toString(),
}))
export const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
  label: `${i + 1} minute${i + 1 > 1 ? "s" : ""}`,
  value: (i + 1).toString(),
}))

const ScheduleField = ({
  name,
  label,
  dayFieldName,
  hourFieldName,
  minuteFieldName,
  dateFieldName = "scheduleDate",
  timeFieldName = "scheduleTime",
}: ScheduleFieldProps) => {
  const { watch, setValue, register } = useFormContext()
  const reminderType = watch("type") || "Upcoming"
  const scheduleDays = watch(dayFieldName || "") || ""
  const scheduleHours = watch(hourFieldName || "") || ""
  const scheduleMinutes = watch(minuteFieldName || "") || ""
  const scheduleDate = watch(dateFieldName) || null
  const scheduleTime = watch(timeFieldName) || ""
  const isScheduled = watch(name) ?? false
  const [open, setOpen] = useState(false)

  // Debug logging
  console.log(
    "ScheduleField: reminderType =",
    reminderType,
    typeof reminderType
  )
  console.log("ScheduleField: isScheduled =", isScheduled, typeof isScheduled)
  console.log("ScheduleField: Watched values =", {
    scheduleDays,
    scheduleHours,
    scheduleMinutes,
    scheduleDate,
    scheduleTime,
  })

  // Validate reminderType
  const validReminderTypes = [
    "Upcoming",
    "Follow-up",
    "Cancellation",
    "Missed",
    "Custom",
  ]
  const isValidReminderType =
    typeof reminderType === "string" &&
    validReminderTypes.includes(reminderType)
  if (!isValidReminderType) {
    console.warn(
      `Invalid reminderType: ${reminderType}. Defaulting to "Upcoming".`
    )
  }
  const effectiveReminderType = isValidReminderType ? reminderType : "Upcoming"

  // Determine "before" or "after" based on reminderType
  const timing =
    effectiveReminderType === "Upcoming" || effectiveReminderType === "Custom"
      ? "before"
      : "after"

  const toggleCheckbox = () => {
    const newValue = !isScheduled
    setValue(name, newValue)
    if (!newValue) {
      // Clear fields when unchecking
      if (effectiveReminderType === "Custom") {
        setValue(dateFieldName, null)
        setValue(timeFieldName, "")
      } else {
        setValue(dayFieldName || "", "")
        setValue(hourFieldName || "", "")
        setValue(minuteFieldName || "", "")
      }
    }
  }

  // Format the schedule text
  const scheduleText = () => {
    if (effectiveReminderType === "Custom" && scheduleDate && scheduleTime) {
      const formattedDate = format(new Date(scheduleDate), "PPP")
      return `${formattedDate} at ${scheduleTime}`
    }
    const parts: string[] = []
    if (scheduleDays)
      parts.push(`${scheduleDays} day${Number(scheduleDays) > 1 ? "s" : ""}`)
    if (scheduleHours)
      parts.push(`${scheduleHours} hour${Number(scheduleHours) > 1 ? "s" : ""}`)
    if (scheduleMinutes)
      parts.push(
        `${scheduleMinutes} minute${Number(scheduleMinutes) > 1 ? "s" : ""}`
      )
    return parts.length > 0 ? `${parts.join(", ")} ${timing} appointment` : ""
  }

  return (
    <FormItem className="mt-3">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <FormControl>
            <Checkbox
              id={label}
              checked={isScheduled}
              onCheckedChange={toggleCheckbox}
            />
          </FormControl>
          <FormLabel htmlFor={label}>{label}</FormLabel>
        </div>
        {isScheduled && (
          <div className="flex flex-col gap-4">
            {effectiveReminderType === "Custom" ? (
              <div className="flex flex-wrap gap-4 items-center">
                {/* Date Picker */}
                <div className="flex flex-col gap-2">
                  <FormLabel>Date</FormLabel>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-[240px] justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduleDate ? (
                          format(new Date(scheduleDate), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          scheduleDate ? new Date(scheduleDate) : undefined
                        }
                        onSelect={(date) => {
                          setValue(dateFieldName, date?.toISOString())
                          setOpen(false)
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {/* Time Picker */}
                <div className="flex flex-col gap-2">
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      {...register(timeFieldName)}
                      className="w-[150px]"
                      placeholder="Select time"
                    />
                  </FormControl>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4 items-center">
                <SelectField
                  name={dayFieldName as string}
                  label="Days"
                  placeholder="Select Days"
                  icon={CalendarIcon}
                  options={dayOptions}
                />
                <SelectField
                  name={hourFieldName as string}
                  label="Hours"
                  className="w-[125px] h-[32px]"
                  placeholder="Select Hours"
                  icon={ClockIcon}
                  options={hourOptions}
                />
                <SelectField
                  name={minuteFieldName as string}
                  label="Minutes"
                  className="w-[139px] h-[32px]"
                  placeholder="Select Minutes"
                  icon={ClockIcon}
                  options={minuteOptions}
                />
              </div>
            )}
            {(scheduleDays ||
              scheduleHours ||
              scheduleMinutes ||
              (scheduleDate && scheduleTime)) && (
              <p className="text-sm text-muted-foreground">
                Schedule: {scheduleText()}
              </p>
            )}
          </div>
        )}
      </div>
    </FormItem>
  )
}

export default ScheduleField
