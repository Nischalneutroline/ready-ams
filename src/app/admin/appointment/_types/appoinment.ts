export enum AppointmentStatus {
  SCHEDULED = "SCHEDULED",
  COMPLETED = "COMPLETED",
  MISSED = "MISSED",
  CANCELLED = "CANCELLED",
  FOLLOW_UP = "FOLLOW_UP",
}

// Interface for Appointment
export interface Appointment {
  customerName: string // Required field for the person being booked
  email: string // Required email of the person being booked
  phone: string // Required phone number of the person being booked
  status: AppointmentStatus // Required Appointment Status
  userId?: string // Optional: If the logged-in user is booking for themselves
  bookedById?: string // Optional: Tracks the user who booked for someone else
  serviceId: string // Required: Service ID
  selectedDate: string // Required: ISO string for the appointment date
  selectedTime: string // Required: ISO string for the appointment time
  message?: string // Optional: Message from the user
  isForSelf: boolean // Required: Indicates if the appointment is for the logged-in user or someone else
  createdById: string // Required: ID of the user who created the appointment
  resourceId?: string // Optional: Resource ID for the appointment
  reminderOffsets?: AppointmentReminderOffset[]
}

export interface AxioxResponseType<T> {
  data: { success: boolean; error?: string; message?: string; data: T }
}

// ----- Reminder
// Enum for Reminder Types
export enum ReminderType {
  REMINDER = "REMINDER",
  FOLLOW_UP = "FOLLOW_UP",
  CANCELLATION = "CANCELLATION",
  MISSED = "MISSED",
  CUSTOM = "CUSTOM",
}

// Enum for Notification Methods
export enum NotificationMethod {
  SMS = "SMS",
  EMAIL = "EMAIL",
  PUSH = "PUSH",
}

// Interface for Appointment Reminder Offset
export interface AppointmentReminderOffset {
  id: string
  appointmentId: string
  reminderOffsetId: string
  scheduledAt: string // ISO string
  sent: boolean
}

// Interface for Reminder Offset
export interface ReminderOffset {
  sendOffset: number // Time offset in minutes
  scheduledAt: string // ISO 8601 DateTime string (e.g., "2025-04-02T10:00:00Z")
  sendBefore: boolean // True if sending before appointment, false if after
  sent: boolean
  appointmentOffsets?: AppointmentReminderOffset[]
}

// Interface for Notification
export interface Notification {
  method: NotificationMethod // SMS, EMAIL, or PUSH
}

// Interface for Reminder
export interface Reminder {
  id?: string // Unique ID for the reminder
  type: ReminderType // Type of the reminder (e.g., REMINDER, FOLLOW_UP)
  title: string // Title of the reminder
  description?: string // Optional description of the reminder
  message?: string // Optional custom message for the reminder
  services: string[] // List of service IDs associated with the reminder
  notifications: Notification[] // List of notifications for the reminder
  reminderOffset: ReminderOffset[] // List of offsets to define when reminders are sent
}
