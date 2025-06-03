// src/features/service/schemas/schema.ts
import { z } from "zod"
import { Status, WeekDays } from "../_types/service"

export const serviceSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  estimatedDuration: z
    .number()
    .min(1, "Estimated duration must be a positive number"),
  status: z.enum([Status.ACTIVE, Status.INACTIVE]).optional(),
  serviceAvailability: z
    .array(
      z.object({
        weekDay: z.enum([
          WeekDays.SUNDAY,
          WeekDays.MONDAY,
          WeekDays.TUESDAY,
          WeekDays.WEDNESDAY,
          WeekDays.THURSDAY,
          WeekDays.FRIDAY,
          WeekDays.SATURDAY,
        ]),
        timeSlots: z
          .array(
            z.object({
              startTime: z.string(),
              endTime: z.string(),
            })
          )
          .optional(),
      })
    )
    .optional(),
  businessDetailId: z.string().min(1, "Business ID is required"),
})
