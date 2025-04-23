import { z } from "zod";
import { ReminderType, NotificationMethod } from "../types/types";

// Reminder Offset Schema
const ReminderOffsetSchema = z.object({
  sendOffset: z.number().int().min(1, "Send offset must be greater than 0"),
  scheduledAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Scheduled date must be a valid ISO string",
  }),
  sendBefore: z.boolean(),
});

// Notification Schema
const NotificationSchema = z.object({
  method: z.enum([NotificationMethod.SMS, NotificationMethod.EMAIL, NotificationMethod.PUSH]), // Use z.enum for NotificationMethod
});

// Reminder Schema
export const ReminderSchema = z.object({
  id: z.string(),
  type: z.enum([ReminderType.REMINDER, ReminderType.FOLLOW_UP, ReminderType.CANCELLATION, ReminderType.MISSED, ReminderType.CUSTOM]), // Use z.enum for ReminderType
  title: z.string().min(1, "Title is required"), // Title of the reminder
  description: z.string().optional(), // Optional description
  message: z.string().optional(), // Optional custom message
  services: z.array(z.string()).min(1, "At least one service is required"), // List of service IDs
  notifications: z.array(NotificationSchema), // List of notifications
  reminderOffset: z.array(ReminderOffsetSchema), // List of reminder offsets
});