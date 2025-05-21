import {
  BusinessAddress,
  BusinessStatus,
  HolidayType,
  WeekDays,
  AvailabilityType,
  BusinessTimeType,
} from "../types/types"
import { z } from "zod"

/* Zod schema for BusinessTime (Working hours) */
const businessTimeSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  type: z.nativeEnum(BusinessTimeType),
})

// Zod schema for BusinessAvailability (Business availability)
const businessAvailabilitySchema = z.object({
  weekDay: z.nativeEnum(WeekDays),
  type: z.nativeEnum(AvailabilityType),
  timeSlots: z.array(businessTimeSchema),
})

// Zod schema for Holiday (Holidays for business)
const holidaySchema = z.object({
  holiday: z.nativeEnum(WeekDays),
  type: z.nativeEnum(HolidayType),
  date: z.string().optional(),
})

// Zod schema for BusinessAddress
const businessAddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  country: z.string(),
  zipCode: z.string(),
  googleMap: z.string(),
})

// Zod schema for BusinessDetail
export const businessDetailSchema = z.object({
  name: z.string(),
  industry: z.string(),
  email: z.string().email(),
  phone: z.string(),
  website: z.string().url().optional(),
  businessRegistrationNumber: z.string(),
  status: z.nativeEnum(BusinessStatus),
  timeZone: z.string().optional(),
  address: z.array(businessAddressSchema),
  businessAvailability: z.array(businessAvailabilitySchema),
  holiday: z.array(holidaySchema),
  businessOwner: z.string().optional(),
  supportBusinessDetail: z
    .object({
      supportPhone: z.string().optional(),
      supportEmail: z.string().optional(),
    })
    .optional(),
})
