import { format, parseISO } from "date-fns"

export function capitalizeFirstChar(word: string) {
  if (word.length === 0) return word
  return word.charAt(0).toUpperCase() + word.slice(1)
}

export function capitalizeOnlyFirstLetter(str: string) {
  if (!str) return ""
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const getFormErrorMsg = (errors: any, inputName: string) => {
  const message = errors?.[inputName]?.message
  return message ? message.toString() : ""
}

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format appointment date
 * @param selectedDate - ISO date string with time (e.g., "2025-04-20T00:00:00.000Z")
 * @returns Formatted date string (e.g., "20 April 2025")
 */
export const formatAppointmentDate = (selectedDate: string): string => {
  try {
    const date = parseISO(selectedDate)
    return format(date, "dd MMMM yyyy")
  } catch (error) {
    console.error("Error formatting date:", error)
    return ""
  }
}

/**
 * Format appointment time
 * @param selectedTime - ISO date string with time (e.g., "2025-04-16T18:15:00.000Z")
 * @returns Formatted time string (e.g., "06:15 PM")
 */
export const formatAppointmentTime = (selectedTime: string): string => {
  try {
    const time = parseISO(selectedTime)
    return format(time, "hh:mm a")
  } catch (error) {
    console.error("Error formatting time:", error)
    return ""
  }
}

/**
 * Convert ISO date/time to normal date string
 * @param isoDateTime - ISO date/time string (e.g., "2025-05-01T18:15:00.000Z")
 * @returns Formatted date string (e.g., "01 May 2025")
 */
export function isoToNormalDate(isoDateTime: string): string {
  try {
    const date = parseISO(isoDateTime)
    if (isNaN(date.getTime())) {
      throw new Error("Invalid ISO date/time string")
    }
    return format(date, "dd MMMM yyyy")
  } catch (error) {
    console.error("Error converting ISO to normal date:", error)
    return ""
  }
}

/**
 * Convert ISO date/time to normal time string with AM/PM
 * @param isoDateTime - ISO date/time string (e.g., "2025-05-01T18:15:00.000Z")
 * @returns Formatted time string (e.g., "06:15 PM")
 */
export function isoToNormalTime(isoDateTime: string): string {
  try {
    const date = parseISO(isoDateTime)
    if (isNaN(date.getTime())) {
      throw new Error("Invalid ISO date/time string")
    }
    return format(date, "hh:mm a")
  } catch (error) {
    console.error("Error converting ISO to normal time:", error)
    return ""
  }
}

/**
 * Convert normal time string with AM/PM to ISO date/time
 * @param date - Date object or date string (e.g., new Date("2025-05-01") or "2025-05-01")
 * @param time - Time string with AM/PM (e.g., "06:15 PM")
 * @returns ISO date/time string (e.g., "2025-05-01T18:15:00.000Z")
 */
export function normalOrFormTimeToIso(
  date: Date | string,
  time: string
): string {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    if (isNaN(dateObj.getTime())) {
      throw new Error("Invalid date input")
    }

    const [timeStr, meridiem] = time.trim().split(" ")
    const [hours, minutes] = timeStr.split(":").map(Number)
    let hour = hours

    if (meridiem.toUpperCase() === "PM" && hour !== 12) {
      hour += 12
    } else if (meridiem.toUpperCase() === "AM" && hour === 12) {
      hour = 0
    }

    if (isNaN(hour) || isNaN(minutes)) {
      throw new Error("Invalid time format")
    }

    const resultDate = new Date(dateObj)
    resultDate.setHours(hour)
    resultDate.setMinutes(minutes)
    resultDate.setSeconds(0)
    resultDate.setMilliseconds(0)

    return resultDate.toISOString()
  } catch (error) {
    console.error("Error converting normal time to ISO:", error)
    return ""
  }
}

/**
 * Convert normal date to ISO date/time
 * @param date - Date object (e.g., new Date("2025-05-01"))
 * @returns ISO date/time string with time set to midnight (e.g., "2025-05-01T00:00:00.000Z")
 */
export function normalDateToIso(date: Date): string {
  try {
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date input")
    }
    const resultDate = new Date(date)
    resultDate.setHours(0)
    resultDate.setMinutes(0)
    resultDate.setSeconds(0)
    resultDate.setMilliseconds(0)
    return resultDate.toISOString()
  } catch (error) {
    console.error("Error converting normal date to ISO:", error)
    return ""
  }
}
