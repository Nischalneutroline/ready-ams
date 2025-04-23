import { z } from "zod";

// Time Slot Schema
const TimeSlotSchema = z.object({
  id: z.string().uuid(),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid ISO date format for startTime",
  }),
  endTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid ISO date format for endTime",
  }),
});

// Support Availability Schema
const SupportAvailabilitySchema = z.object({
  id: z.string().uuid(),
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
  timeSlots: z.array(TimeSlotSchema).min(1, "At least one time slot is required"),
});

// Support Holiday Schema
const SupportHolidaySchema = z.object({
  id: z.string().uuid(),
  holiday: z.string(),
  type: z.literal("SUPPORT"), // Only "SUPPORT" type allowed
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid ISO date format for holiday date",
  }),
});

// Main SupportBusinessDetail Schema
export const SupportBusinessDetailSchema = z.object({
  supportBusinessName: z.string().min(1, "Business name is required"),
  supportEmail: z.string().email("Invalid email format"),
  supportPhone: z.string().min(10, "Invalid phone number"),
  supportAddress: z.string().min(1, "Address is required"),
  supportGoogleMap: z.string().url().optional(),
  supportAvailability: z.array(SupportAvailabilitySchema),
  supportHoliday: z.array(SupportHolidaySchema),
  businessId: z.string().uuid(),
});