import { z } from "zod"

// Time Slot Schema
const TimeSlotSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["WORK", "BREAK"]),
  startTime: z.string(),
  endTime: z.string(),
})

// Support Availability Schema
const SupportAvailabilitySchema = z.object({
  id: z.string().optional(),
  weekDay: z.enum([
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ]),
  type: z.literal("SUPPORT"), // Only "SUPPORT" type allowed
  timeSlots: z
    .array(TimeSlotSchema)
    .min(1, "At least one time slot is required"),
})

// Support Holiday Schema
const SupportHolidaySchema = z.object({
  id: z.string().optional(),
  holiday: z.string(),
  type: z.literal("SUPPORT"), // Only "SUPPORT" type allowed
  date: z.string().optional(),
})

// Zod schema for BusinessAddress
const supportBusinessAddressSchema = z.object({
  id: z.string().optional(),
  street: z.string(),
  city: z.string(),
  country: z.string(),
  zipCode: z.string(),
  googleMap: z.string().optional(),
})

// Main SupportBusinessDetail Schema
export const SupportBusinessDetailSchema = z.object({
  supportBusinessName: z.string().min(1, "Business name is required"),
  supportEmail: z.string().email("Invalid email format"),
  supportPhone: z.string().min(10, "Invalid phone number"),
  supportAddress: z.string(),
  supportGoogleMap: z.string(),
  supportAvailability: z.array(SupportAvailabilitySchema),
  supportHoliday: z.array(SupportHolidaySchema),
  businessId: z.string(),
})
