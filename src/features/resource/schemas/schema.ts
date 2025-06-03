import { z } from "zod";


// Resource Schema
export const ResourceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Resource name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(10, "Invalid phone number"),
  address: z.string().optional(),
  role: z.string().min(1, "Role is required"),
  businessId: z.string(),
  services: z.array(
    z.object({
      id: z.string(),
    })
  ),
  appointments: z
    .array(
      z.object({
        id: z.string(),
      })
    )
    .optional(),
});
