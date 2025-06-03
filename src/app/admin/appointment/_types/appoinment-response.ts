// // Enum for appointment status, aligned with Prisma schema
// export enum AppointmentStatus {
//   SCHEDULED = "SCHEDULED",
//   COMPLETED = "COMPLETED",
//   MISSED = "MISSED",
//   CANCELLED = "CANCELLED",
//   FOLLOW_UP = "FOLLOW_UP",
// }

// // Interface for the User object, based on Prisma User model and JSON response
// export interface User {
//   id: string
//   email: string
//   name: string
//   phone: string | null // Nullable per Prisma schema
//   createdAt: string // ISO 8601 string
//   updatedAt: string // ISO 8601 string
//   lastActive: string // ISO 8601 string
//   role: "USER" | "ADMIN" | "SUPERADMIN" // From Prisma Role enum
//   isActive: boolean
// }

// // Interface for the Service object, based on Prisma Service model and JSON response
// export interface Service {
//   id: string
//   title: string
//   description: string
//   createdAt: string // ISO 8601 string
//   status: "ACTIVE" | "INACTIVE" // From Prisma Status enum
//   estimatedDuration: number // Duration in minutes
//   businessDetailId: string | null // Nullable per Prisma schema
// }

// // Interface for the Resource object, based on Prisma Resource model
// export interface Resource {
//   id: string
//   name: string
//   email: string
//   phone: string
//   role: string
//   address: string | null // Nullable per Prisma schema
//   businessId: string
//   createdAt: string // ISO 8601 string
//   updatedAt: string // ISO 8601 string
// }

// // Interface for the Appointment object, based on Prisma Appointment model and JSON response
// export interface Appointment {
//   id: string
//   customerName: string
//   email: string
//   phone: string
//   status: AppointmentStatus
//   cancelledAt: string | null // ISO 8601 string or null
//   userId: string | null // Nullable per Prisma schema
//   user: User | null // Nullable per Prisma relation
//   bookedById: string | null // Nullable per Prisma schema
//   bookedBy: User | null // Nullable per Prisma relation
//   serviceId: string
//   service: Service
//   selectedDate: string // ISO 8601 string (e.g., "2025-05-23T00:00:00.000Z")
//   selectedTime: string // ISO 8601 string (e.g., "2025-05-23T00:00:00.000Z")
//   message: string | null // Nullable per Prisma schema
//   isForSelf: boolean
//   createdById: string
//   createdBy: User
//   createdAt: string // ISO 8601 string
//   updatedAt: string // ISO 8601 string
//   resourceId: string | null // Nullable per Prisma schema
//   resource: Resource | null // Nullable per Prisma relation (null in JSON)
// }

// // Interface for the top-level API response
// export interface AppointmentResponse {
//   data: Appointment[]
//   success: boolean
//   message: string
// }
// // Interface for the top-level API response

// export interface AxioxResponseType<T> {
//   data: { success: boolean; error?: string; message?: string; data: T }
// }
