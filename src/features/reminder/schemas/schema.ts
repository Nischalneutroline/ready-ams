import {
  NotificationMethod,
  ReminderType,
} from "@/app/admin/appointment/_types/appoinment"
import { z } from "zod"

//appointmentreminder offset
const AppointmentReminderOffsetSchema = z.object({
  id: z.string().optional(),
  appointmentId: z.string(),
  reminderOffsetId: z.string(),
  scheduledAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Scheduled date must be a valid ISO string",
  }),
  sent: z.boolean(),
})

// Reminder Offset Schema
const ReminderOffsetSchema = z.object({
  id: z.string().optional(),
  sendOffset: z
    .number()
    .int()
    .min(1, "Send offset must be greater than 0")
    .optional(),
  scheduledAt: z.string().optional(),
  sendBefore: z.boolean(),
  appointmentOffsets: z.array(AppointmentReminderOffsetSchema).optional(),
})

// Notification Schema
const NotificationSchema = z.object({
  id: z.string().optional(),
  method: z.enum([
    NotificationMethod.SMS,
    NotificationMethod.EMAIL,
    NotificationMethod.PUSH,
  ]), // Use z.enum for NotificationMethod
})

// Reminder Schema
export const ReminderSchema = z.object({
  id: z.string().optional(),
  type: z.enum([
    ReminderType.REMINDER,
    ReminderType.FOLLOW_UP,
    ReminderType.CANCELLATION,
    ReminderType.MISSED,
    ReminderType.CUSTOM,
  ]), // Use z.enum for ReminderType
  title: z.string().min(1, "Title is required"), // Title of the reminder
  description: z.string().optional(), // Optional description
  message: z.string().optional(), // Optional custom message
  services: z.array(z.string()).min(1, "At least one service is required"), // List of service IDs
  notifications: z.array(NotificationSchema), // List of notifications
  reminderOffset: z.array(ReminderOffsetSchema), // List of reminder offsets
})
