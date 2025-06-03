import { PostSupportBusinessDetail } from "@/app/admin/support/_types/types"

// Enum for Business Status
export enum BusinessStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING",
  SUSPENDED = "SUSPENDED",
}

export enum WeekDays {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  THURSDAY = "THURSDAY",
  WEDNESDAY = "WEDNESDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

// Enum for AvailabilityType
export enum AvailabilityType {
  GENERAL = "GENERAL",
  SUPPORT = "SUPPORT",
}

// Enum for HolidayType
export enum HolidayType {
  GENERAL = "GENERAL",
  SUPPORT = "SUPPORT",
}

// Enum for BusinessTimeType
export enum BusinessTimeType {
  WORK = "WORK",
  BREAK = "BREAK",
}
// Interface for BusinessTime (Working hours)
export interface BusinessTime {
  id: string
  type: BusinessTimeType
  startTime: string // ISO string for start time
  endTime: string // ISO string for end time
}

// Interface for BusinessAvailability (Business availability)
export interface BusinessAvailability {
  id?: string
  weekDay: WeekDays // Day of the week
  type: AvailabilityType // Either GENERAL or SUPPORT
  timeSlots: BusinessTime[] // List of working hours for that day
}

// Interface for Holiday (Holidays for business)
export interface Holiday {
  id: string
  holiday: WeekDays // Day of the week
  type: HolidayType // Either GENERAL or SUPPORT
  date?: string // Optional specific date for holiday (if needed)
}

// Interface for BusinessAddress (Address for branches of the business)
export interface BusinessAddress {
  id: string
  street: string
  city: string
  country: string
  zipCode: string
  googleMap: string // Google Map URL for the address
}

export interface BusinessDetail {
  id: string
  name: string // Business name
  industry: string // Industry the business operates in
  email: string // Business email
  phone: string // Business phone number
  website?: string // Optional website link
  businessRegistrationNumber: string // Unique registration number
  status: BusinessStatus // Status of the business (Active, Pending, etc.)
  address: BusinessAddress[] // Addresses for the business branches
  businessAvailability: BusinessAvailability[] // General availability for the business
  holiday: Holiday[] // General holidays for the business

// Here post service is used fixewd it with serviceBusinessdetail and another postservicebusinessdetail
  supportBusinessDetail?: PostSupportBusinessDetail // Optional support business details
}
