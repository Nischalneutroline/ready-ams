import { getBaseUrl } from "@/lib/baseUrl"
import { Appointment } from "@prisma/client"
import axios, { AxiosError } from "axios"

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
})

export interface ApiReturnType {
  data?: any
  success: boolean
  error?: string
  message?: string
}

export interface PostAppoinmentData {
  id?: string
  customerName: string
  email: string
  phone: string
  serviceId: string
  selectedDate: string
  selectedTime: string
  message?: string
  userId?: string
  isForSelf?: boolean
  bookedById?: string
  createdById?: string
  status?: string
}

async function getAppointments(): Promise<{
  data?: Appointment[]
  success: boolean
  error?: string
  message?: string
}> {
  try {
    const {
      data: { data, success, error, message },
    } = (await api.get("/api/appointment")) as ApiReturnType
    return { data, success, message, error }
  } catch (error) {
    console.error("Error fetching appointments:", error)
    if (error instanceof AxiosError) {
      return {
        message: error?.response?.data.error,
        success: false,
        error: error.message,
      }
    }
    return { message: "Failed to fetch appointments", success: false }
  }
}

async function getAppointmentById(id: string): Promise<{
  data?: Appointment
  success: boolean
  error?: string
  message?: string
}> {
  try {
    const {
      data: { data, success, error, message },
    } = (await api.get(`/api/appointment/${id}`)) as ApiReturnType
    return { data, success, message, error }
  } catch (error) {
    if (error instanceof AxiosError) {
      return {
        message: error?.response?.data.error,
        success: false,
        error: error.message,
      }
    }
    return { error: "Failed to fetch appointment by Id", success: false }
  }
}

async function createAppointment(appointmentData: PostAppoinmentData): Promise<{
  data?: Appointment
  success: boolean
  error?: string
  message?: string
}> {
  try {
    const {
      data: { data, success, error, message },
    } = (await api.post("/api/appointment", appointmentData)) as ApiReturnType
    return {
      data,
      success,
      message,
      error,
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      return {
        message: error?.response?.data.error,
        success: false,
        error: error.message,
      }
    }
    return { error: "Failed to create appointment", success: false }
  }
}

async function updateAppointment(
  id: string,
  appointmentData: PostAppoinmentData
): Promise<{
  data?: Appointment
  success: boolean
  error?: string
  message?: string
}> {
  try {
    const {
      data: { data, success, error, message },
    } = (await api.put(`/api/appointment/${id}`, {
      ...appointmentData,
      status: appointmentData.status || "SCHEDULED",
    })) as ApiReturnType
    return { data, success, message, error }
  } catch (error) {
    if (error instanceof AxiosError) {
      return {
        message: error?.response?.data.error,
        success: false,
        error: error.message,
      }
    }
    return { error: "Failed to update appointment", success: false }
  }
}

async function deleteAppointment(
  id: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const {
      data: { data, success, error, message },
    } = (await api.delete(`/api/appointment/${id}`)) as ApiReturnType
    return { success, message, error }
  } catch (error) {
    if (error instanceof AxiosError) {
      return {
        message: error?.response?.data.error,
        success: false,
        error: error.message,
      }
    }
    return { error: "Failed to delete appointment", success: false }
  }
}

export {
  getAppointments,
  createAppointment,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
}
