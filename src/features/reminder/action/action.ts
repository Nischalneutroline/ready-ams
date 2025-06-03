import { getServices } from "@/features/service/api/api"
import { getReminder, getReminderById } from "../api/api"
import { getAnnouncementOrOfferById } from "@/db/announcement-offer"
import { getAnnouncementById } from "@/features/announcement-offer/api/api"
import { ReminderType } from "@/app/admin/appointment/_types/appoinment"

export const serviceOption = await getServices()
export const reminderData = await getReminder()

export const fetchReminderData = async (id: string) => {
  const data = await getReminderById(id)
  return data
}

type RawReminderData = {
  type: string
  subject: string
  description: string
  message: string
  service: string
  sendVia: string[]
  when: string[]
  scheduleDay: string
  scheduleHour: string
  scheduleMinute: string
}

type TransformedReminderData = {
  type: string
  title: string
  description: string
  message: string
  services: string[]
  notifications: { method: string }[]
  reminderOffset: {
    sendOffset: string | number | null
    sendBefore: boolean
  }[]
}

const labelToOffset: Record<string, number> = {
  "48 hours before appointment": 2880,
  "24 hours before appointment": 1440,
  "1 hours before appointment": 60,
  "Same day after appointment": 60,
  "1 days after appointment": 1440,
  "2 days after appointment": 2880,
  "15 minutes after missed": 15,
  "1 hour after missed": 60,
  "24 hours after missed": 1440,
  "48 hours after missed": 2880,
  "15 minutes after cancellation": 15,
  "1 hour after cancellation": 60,
  "24 hours after cancellation": 1440,
  "48 hours after cancellation": 2880,
  // "Schedule" ones will be handled separately
}

export function transformReminderPayloadWithOffset(
  data: RawReminderData
): TransformedReminderData {
  const reminderTypeMap: Record<string, ReminderType> = {
    upcoming: ReminderType.REMINDER,
    follow_up: ReminderType.FOLLOW_UP,
    cancellation: ReminderType.CANCELLATION,
    missed: ReminderType.MISSED,
    custom: ReminderType.CUSTOM,
  }
  return {
    type: reminderTypeMap[data.type.toLowerCase()] ?? ReminderType.FOLLOW_UP,
    title: data.subject,
    description: data.description,
    message: data.message,

    services: [data.service],

    notifications: data.sendVia.map((method) => {
      const upper = method.toUpperCase()
      return {
        method: upper === "PUSH NOTIFICATION" ? "PUSH" : upper,
      }
    }),

    // This logic needs to be updated...
    reminderOffset: data.when.map((label) => {
      if (label.toLowerCase().includes("schedule")) {
        const days = Number(data.scheduleDay) || 0
        const hours = Number(data.scheduleHour) || 0
        const minutes = Number(data.scheduleMinute) || 0

        const totalMinutes = days * 24 * 60 + hours * 60 + minutes

        return {
          sendOffset: totalMinutes,
          sendBefore: label.toLowerCase().includes("before"),
        }
      } else {
        return {
          sendOffset: labelToOffset[label] ?? (Number(label) || null),
          sendBefore: label.toLowerCase().includes("before"),
        }
      }
    }),
  }
}

export const fetchRemider = async () => {
  const reminderData = await getReminder()
  return reminderData
}

const offsetToLabel: Record<number, string> = {
  2880: "2 days after appointment",
  1440: "1 days after appointment",
  60: "1 hours after appointment",
  15: "15 minutes after missed",
  0: "Same day after appointment",
}

const methodToSendViaLabel: Record<string, string> = {
  EMAIL: "Email",
  SMS: "SMS",
  PUSH: "Push Notification",
}

export function transformReminderToFormValues(apiData: any) {
  const typeMapReverse: Record<string, string> = {
    [ReminderType.REMINDER]: "Upcoming",
    [ReminderType.FOLLOW_UP]: "Follow-up",
    [ReminderType.CANCELLATION]: "Cancellation",
    [ReminderType.MISSED]: "Missed",
    [ReminderType.CUSTOM]: "Custom",
  }

  // Find if any scheduledAt exists
  const scheduled = apiData.reminderOffset.find((item: any) => item.scheduledAt)

  let scheduleDate = ""
  let scheduleTime = ""

  if (scheduled && scheduled.scheduledAt) {
    const dateObj = new Date(scheduled.scheduledAt)
    scheduleDate = dateObj.toISOString().split("T")[0] // YYYY-MM-DD
    scheduleTime = dateObj.toTimeString().split(":").slice(0, 2).join(":") // HH:MM
  }

  return {
    appointment: "",
    autoDelete: "7 days",
    description: apiData.description || "",
    message: apiData.message || "",
    reminderCategory: "Custom",
    scheduleDate,
    scheduleTime,
    sendVia: apiData.notifications.map(
      (item: { method: string }) =>
        methodToSendViaLabel[item.method] || item.method
    ),
    service: apiData.services?.[0] || "",
    subject: apiData.title || "",
    type: typeMapReverse[apiData.type] ?? "Follow-up",
    when: apiData.reminderOffset.map((offsetItem: any) => {
      if (offsetItem.scheduledAt) {
        return "Schedule Reminder" // you can customize this label
      }
      return offsetToLabel[offsetItem.sendOffset] ?? "Custom Time"
    }),
  }
}

export async function transformAnnouncementData(id: string) {
  const input = await getAnnouncementById(id)
  const mapAudience = {
    APPOINTED_USERS: "Appointments Users",
    CANCELLED_USERS: "Cancelled Users",
    ALL: "All", // in case you add more
  }

  const mapExpiredAt = {
    ONE_DAY: "1 days",
    THREE_DAYS: "3 days",
    SEVEN_DAYS: "7 days",
    THIRTY_DAYS: "30 days",
    NEVER: "Never",
  }

  const mapShowOn = {
    PUSH: "Push Notification",
    EMAIL: "Email",
    SMS: "SMS",
  }

  const scheduledDate = new Date(input.scheduledAt)

  // Formatting time (HH:mm)
  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
    return `${hours}:${minutes}`
  }

  return {
    autoDelete: mapExpiredAt[input.expiredAt] || "7 days",
    description: input.description,
    message: input.message,
    schedule: input.isImmediate ? "Immediate" : "Schedule",
    scheduleDate: scheduledDate,
    scheduleTime: formatTime(scheduledDate),
    showOn: [mapShowOn[input.showOn] || "Push Notification"],
    targetAudience: mapAudience[input.audience] || "Appointments Users",
    title: input.title,
  }
}
