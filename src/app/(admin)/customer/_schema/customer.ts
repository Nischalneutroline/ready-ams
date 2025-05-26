import { z } from "zod"
import { Role } from "../_types/customer"

// Zod schema for Address
export const addressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  zipCode: z.string().min(1, "Zip code is required"),
})

// Zod schema for Role (Enum)
export const roleSchema = z.enum(["USER", "ADMIN", "SUPERADMIN"])

// Zod schema for User
export const userSchema = z.object({
  id: z.string().optional(),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .optional(),
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  role: roleSchema,
  orgId: z.string().optional(),
  isActive: z.boolean().optional().default(true), // Optional, defaults to true
  address: addressSchema.optional(), // Optional address
})
// export const userSchema = z.object({
//   id: z.string().optional(),
//   email: z.string().email("Invalid email format"),
//   password: z
//     .string()
//     .min(6, "Password must be at least 6 characters long")
//     .optional(),
//   name: z.string().min(1, "Name is required"),
//   phone: z.string().optional(),
//   role: roleSchema, // make sure this matches your request exactly
//   orgId: z.string().min(1, "Organization ID is required"),
//   isActive: z.boolean().optional().default(true),
//   address: addressSchema.optional(),
// })

// --- Admin User CRUD
// Validation schemas
export const createSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  phone: z.string().min(1, "Phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  isActive: z.boolean(),
  role: z.nativeEnum(Role),
})

export const updateSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  phone: z.string().min(1, "Phone number is required"),
  password: z.string().optional(),
  isActive: z.boolean(),
  role: z.nativeEnum(Role),
})
