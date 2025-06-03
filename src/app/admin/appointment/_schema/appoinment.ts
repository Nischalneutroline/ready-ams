import { z } from "zod";
import { AppointmentStatus } from "../_types/appoinment";

export const appointmentSchema = z.object({
  id: z.string().optional(),
  customerName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(10, "Invalid phone number"),
  serviceId: z.string().min(3, "Service ID is required"),
  selectedDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  selectedTime: z.string(),
  message: z.string().optional(),
  isForSelf: z.boolean(),
  createdById: z.string().min(1, "Creator ID is required"),
  status: z.nativeEnum(AppointmentStatus), // Ensures status is from AppointmentStatus enum
  userId: z.string().optional(),
  bookedById: z.string().optional(),
  resourceId: z.string().optional(),
});
