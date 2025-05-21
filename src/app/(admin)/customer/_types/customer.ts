export interface Address {
  street: string
  city: string
  country: string
  zipCode: string
}

export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
  SUPERADMIN = "SUPERADMIN",
}

export interface User {
  id: string
  email: string // Required
  password: string // Required
  name: string // Required
  phone?: string // Optional
  role: Role // Required
  isActive?: boolean // Optional, defaults to true
  address?: Address // Optional
  createdAt: Date
  lastActiveAt: Date
  updatedAt: Date
}
export interface loggedInUser {
  id: string
  email: string // Require
  name: string // Required
  phone?: string // Optional
  role: Role // Required
  address?: Address // Optional
}

export interface ApiReturnType<T = any> {
  data?: T
  success: boolean
  message?: string
  error?: string
}
export interface AxiosResponseType<T> {
  data: { success: boolean; error?: string; message?: string; data: T }
}
