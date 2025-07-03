import { z } from "zod";
// import { VideoProvider } from "../types"; // If you have an enum

export const meetingSchema = z.object({
  id: z.string().optional(),
  serviceId: z.string().min(1, "Service ID is required"),
  appointmentId: z.string().optional(),
  startTime: z.string().min(1, "Start time is required"), // ISO date string
  endTime: z.string().min(1, "End time is required"),     // ISO date string
  bookedByName: z.string().min(1, "Booker name is required"),
  bookedByEmail: z.string().email("Invalid email"),
  bookerTimezone: z.string().optional(),
  comment: z.any().optional(),
  videoUrl: z.string().url("Invalid video URL").optional(),
  videoProvider: z.string().optional(), // Or z.nativeEnum(VideoProvider).optional()
  slug: z.string().optional(),

});