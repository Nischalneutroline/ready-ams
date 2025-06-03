"use client"

import { useFormContext } from "react-hook-form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { CalendarDays, LucideIcon, Plus, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"

// Helper functions
import { timeOptions, toMin } from "@/lib/lib"

// Default break slot
const defaultBreak: [string, string] = ["12:00 PM", "01:00 PM"]

// Type definitions
type TimeSlot = [string, string]
type BusinessHours = Record<string, { work: TimeSlot[]; break: TimeSlot[] }>
type SlotType = "work" | "break"

interface BusinessHourSelectorProps {
  name: string
  icon?: LucideIcon
}

const BusinessHourSelector = ({
  name,
  icon: Icon = CalendarDays,
}: BusinessHourSelectorProps) => {
  const { watch, setValue } = useFormContext()
  const businessDays: string[] = watch("businessDays") || []
  const holidays: string[] = watch("holidays") || []
  const businessHours: BusinessHours = watch(name) || {}
  const [activeDay, setActiveDay] = useState(businessDays[0] || "")

  /**
   * Checks if a time is within a slot's range (inclusive start, exclusive end)
   * @param time Time to check
   * @param slot Slot to check against
   * @returns True if time is within the slot
   */
  const isTimeInSlot = (time: string, slot: TimeSlot): boolean => {
    if (!time || !slot[0] || !slot[1]) return false
    const timeVal = toMin(time)
    const startVal = toMin(slot[0])
    const endVal = toMin(slot[1])
    return timeVal >= startVal && timeVal < endVal
  }

  /**
   * Checks if a time matches a slot's start time
   * @param time Time to check
   * @param slot Slot to check against
   * @returns True if time matches the slot's start
   */
  const isTimeSlotStart = (time: string, slot: TimeSlot): boolean => {
    return time === slot[0]
  }

  /**
   * Checks if a time matches a slot's end time
   * @param time Time to check
   * @param slot Slot to check against
   * @returns True if time matches the slot's end
   */
  const isTimeSlotEnd = (time: string, slot: TimeSlot): boolean => {
    return time === slot[1]
  }

  /**
   * Gets available times for a slot, filtering out invalid times
   * @param afterTime Previous slot's end time or current start time
   * @param oppositeSlots Slots of the opposite type
   * @param type Slot type ("work" or "break")
   * @param isEnd Whether selecting end time
   * @returns Array of available times
   */
  const getAvailableTimes = (
    afterTime: string | undefined,
    oppositeSlots: TimeSlot[],
    type: SlotType,
    isEnd: boolean = false
  ): string[] => {
    let options = [...timeOptions()]
    if (afterTime && options.includes(afterTime)) {
      const index = options.indexOf(afterTime)
      // For end times, exclude start time and earlier
      // For start times, include previous end time
      options = isEnd ? options.slice(index + 1) : options.slice(index)
    }

    if (type === "work") {
      options = options.filter((time) => {
        return !oppositeSlots.some((slot) => {
          if (isEnd) {
            return isTimeInSlot(time, slot) || isTimeSlotEnd(time, slot)
          }
          return isTimeSlotStart(time, slot) || isTimeInSlot(time, slot)
        })
      })
    } else if (type === "break" && oppositeSlots.length > 0) {
      options = options.filter((time) => {
        return !oppositeSlots.some(
          (slot) => time === slot[0] || time === slot[1]
        )
      })
    }

    return options
  }

  /**
   * Checks if a time option should be disabled for a work slot
   * @param time Time to check
   * @param breakSlots Break slots
   * @param isEnd Whether checking for end time
   * @param referenceTime Current start time (for end) or previous end time (for start)
   * @returns True if the time should be disabled
   */
  const isWorkTimeDisabled = (
    time: string,
    breakSlots: TimeSlot[],
    isEnd: boolean,
    referenceTime: string
  ): boolean => {
    // For end times, disable times before or equal to start time
    // For start times, disable times before previous end time
    if (
      referenceTime &&
      toMin(time) <= (isEnd ? toMin(referenceTime) : toMin(referenceTime) - 1)
    ) {
      return true
    }
    // Disable break start times and times within break ranges for start time
    // Disable break end times and times within break ranges for end time
    return breakSlots.some((slot) => {
      if (isEnd) {
        return isTimeInSlot(time, slot) || isTimeSlotEnd(time, slot)
      }
      return isTimeSlotStart(time, slot) || isTimeInSlot(time, slot)
    })
  }

  /**
   * Checks if a time option should be disabled for a break slot
   * @param time Time to check
   * @param workSlots Work slots
   * @param isEnd Whether checking for end time
   * @param referenceTime Current start time (for end) or previous end time (for start)
   * @returns True if the time should be disabled
   */
  const isBreakTimeDisabled = (
    time: string,
    workSlots: TimeSlot[],
    isEnd: boolean,
    referenceTime: string
  ): boolean => {
    // For end times, disable times before or equal to start time
    // For start times, disable times before previous end time
    if (
      referenceTime &&
      toMin(time) <= (isEnd ? toMin(referenceTime) : toMin(referenceTime) - 1)
    ) {
      return true
    }
    // Disable work start and end times
    return workSlots.some((slot) => time === slot[0] || time === slot[1])
  }

  /**
   * Handles changes to a slot's start or end time
   */
  const handleChange = (
    day: string,
    index: number,
    type: SlotType,
    position: "start" | "end",
    value: string
  ) => {
    const updated: BusinessHours = { ...businessHours }
    const slots = [...(updated[day]?.[type] || [])]
    const current = slots[index] || ["", ""]

    if (position === "start") current[0] = value
    else current[1] = value

    slots[index] = current
    updated[day] = { ...updated[day], [type]: slots }
    setValue(name, updated, { shouldValidate: true })
  }

  /**
   * Adds a new slot
   */
  const addSlot = (day: string, type: SlotType) => {
    const updated: BusinessHours = { ...businessHours }
    const prevSlots = updated[day]?.[type] || []
    const oppositeType = type === "work" ? "break" : "work"
    const oppositeSlots = updated[day]?.[oppositeType] || []
    const prevEnd = prevSlots[prevSlots.length - 1]?.[1] || timeOptions()[0]

    const availableStart = getAvailableTimes(
      prevEnd,
      oppositeSlots,
      type,
      false
    )

    if (availableStart.length === 0) {
      // Silently return since dropdowns prevent invalid selections
      return
    }

    const newStart = availableStart[0]
    updated[day] = {
      ...updated[day],
      [type]: [...prevSlots, [newStart, ""]],
    }
    setValue(name, updated, { shouldValidate: true })
  }

  /**
   * Removes a slot
   */
  const removeSlot = (day: string, type: SlotType, index: number) => {
    const updated: BusinessHours = { ...businessHours }
    updated[day][type] = updated[day][type].filter(
      (_: any, i: number) => i !== index
    )
    setValue(name, updated, { shouldValidate: true })
  }

  // Initialize default break slots and update active day
  useEffect(() => {
    const updated: BusinessHours = { ...businessHours }
    let hasChanges = false

    businessDays.forEach((day: string) => {
      if (!updated[day]) {
        updated[day] = { work: [], break: [defaultBreak] }
        hasChanges = true
      } else if (!updated[day].break || updated[day].break.length === 0) {
        updated[day].break = [defaultBreak]
        hasChanges = true
      }
    })

    if (hasChanges) {
      setValue(name, updated, { shouldValidate: true })
    }

    if (!businessDays.includes(activeDay) && businessDays.length > 0) {
      setActiveDay(businessDays[0])
    }
  }, [businessDays, businessHours, setValue, name, activeDay])

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        {Icon && <Icon className="size-5 text-gray-500" />}
        <Label className="text-lg font-semibold">Business Hours/Day</Label>
      </div>

      {/* Tabs for selecting active day */}
      <div className="flex items-center gap-3">
        <CalendarDays className="size-6 text-gray-500" />
        <div className="flex gap-2 flex-wrap">
          {businessDays
            .filter((day: string) => !holidays.includes(day))
            .map((day: string) => (
              <Button
                key={day}
                type="button"
                variant={activeDay === day ? "default" : "outline"}
                onClick={() => setActiveDay(day)}
                className={cn(
                  "px-4 min-w-[80px] rounded-full",
                  activeDay === day
                    ? "bg-blue-600 text-white shadow-[inset_0px_2px_4px_0px_#001F5280]"
                    : "border-gray-300 hover:bg-gray-100"
                )}
              >
                {day}
              </Button>
            ))}
        </div>
      </div>

      {/* Break and Work slots in a single column */}
      <div className="space-y-6">
        {(["break", "work"] as const).map((type) => {
          const isWork = type === "work"
          const label = isWork ? "Work Hours 🛠️" : "Break Hours ☕"
          const slots = businessHours[activeDay]?.[type] || []
          const oppositeType = isWork ? "break" : "work"
          const oppositeSlots = businessHours[activeDay]?.[oppositeType] || []

          return (
            <div
              key={type}
              className={cn(
                "space-y-3 p-4 rounded-lg",
                isWork ? "bg-gray-50" : "bg-blue-50"
              )}
            >
              <Label className="text-base font-medium">{label}</Label>
              <div className="flex flex-col gap-3">
                {slots.map((slot: TimeSlot, idx: number) => {
                  const prevEnd = idx > 0 ? slots[idx - 1][1] : undefined
                  const availableStart = getAvailableTimes(
                    prevEnd,
                    oppositeSlots,
                    type,
                    false
                  )
                  const availableEnd = getAvailableTimes(
                    slot[0],
                    oppositeSlots,
                    type,
                    true
                  )

                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-4 justify-start"
                    >
                      {/* Start Time */}
                      <Select
                        value={slot[0]}
                        onValueChange={(val) =>
                          handleChange(activeDay, idx, type, "start", val)
                        }
                      >
                        <SelectTrigger className="w-40 border-gray-300">
                          <SelectValue placeholder="Start Time" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {timeOptions().map((t) => (
                            <SelectItem
                              key={t}
                              value={t}
                              disabled={
                                isWork
                                  ? isWorkTimeDisabled(
                                      t,
                                      oppositeSlots,
                                      false,
                                      prevEnd || timeOptions()[0]
                                    )
                                  : isBreakTimeDisabled(
                                      t,
                                      oppositeSlots,
                                      false,
                                      prevEnd || timeOptions()[0]
                                    )
                              }
                            >
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* End Time */}
                      <div className="relative">
                        <Select
                          value={slot[1]}
                          onValueChange={(val) =>
                            handleChange(activeDay, idx, type, "end", val)
                          }
                        >
                          <SelectTrigger className="w-40 border-gray-300">
                            <SelectValue placeholder="End Time" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {timeOptions().map((t) => (
                              <SelectItem
                                key={t}
                                value={t}
                                disabled={
                                  isWork
                                    ? isWorkTimeDisabled(
                                        t,
                                        oppositeSlots,
                                        true,
                                        slot[0]
                                      )
                                    : isBreakTimeDisabled(
                                        t,
                                        oppositeSlots,
                                        true,
                                        slot[0]
                                      )
                                }
                              >
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Trash icon */}
                        {(idx > 0 || (type === "break" && idx >= 0)) && (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removeSlot(activeDay, type, idx)}
                            className="absolute -right-10 top-1/2 transform -translate-y-1/2"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* Add slot button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addSlot(activeDay, type)}
                  className="text-sm gap-2 w-32 border-gray-300 hover:bg-gray-100"
                >
                  <Plus className="w-4 h-4" />
                  Add {type === "work" ? "Work" : "Break"} Slot
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BusinessHourSelector
