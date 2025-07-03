import { Individual } from "@/features/individual/types/types";

export interface Service {
  id: string
  title: string
   type: ServiceType;
  description: string
  estimatedDuration: number // in minutes
  status?: Status // ACTIVE or INACTIVE
  serviceAvailability?: ServiceAvailability[]
  resourceId?: string
  createdAt: Date
  updatedAt: Date
  businessDetailId: string | null
   individual?: Individual
   imageUrl?: string         
  imageUrlFileId?: string
}

export interface ServiceAvailability {
  weekDay: WeekDays // SUNDAY, MONDAY, etc.
  timeSlots?: ServiceTime[]
}

export interface ServiceTime {
  startTime: string // ISO 8601 Date string
  endTime: string // ISO 8601 Date string
}

export enum Status {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum WeekDays {
  SUNDAY = "SUNDAY",
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
}


export enum ServiceType {
  PHYSICAL = "PHYSICAL",
  VIRTUAL = "VIRTUAL",
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
