import { create } from "zustand"
import { Appointment } from "@prisma/client"
import {
  getAppointments,
  createAppointment,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  PostAppoinmentData,
} from "@/app/admin/appointment/_api-call/appoinment-api-call"
import { toast } from "sonner"
import { isSameDay } from "date-fns"
import { AppointmentStatus } from "../_types/appoinment"

// Standardized API response type
interface ApiCallReturnType {
  data?: any
  success: boolean
  message?: string
  error?: string
}

interface AppointmentState {
  activeTab: string
  appointments: Appointment[]
  loading: boolean
  isRefreshing: boolean
  hasFetched: boolean
  error: string | null
  router: string
  onActiveTab: (tab: string) => void
  fetchAppointments: (isManualRefresh?: boolean) => Promise<void>
  createAppointment: (
    data: PostAppoinmentData
  ) => Promise<{ success: boolean; message?: string; errorMessage?: string }>
  getAppointmentById: (id: string) => Promise<Appointment | null>
  updateAppointment: (
    id: string,
    data: PostAppoinmentData
  ) => Promise<{ success: boolean; message?: string; errorMessage?: string }>
  deleteAppointment: (
    id: string
  ) => Promise<{ success: boolean; message?: string; errorMessage?: string }>
  getFilteredAppointments: () => Appointment[]
}

// Centralized error handling utility
const handleApiError = (
  error: any,
  defaultMessage: string,
  set: (state: Partial<AppointmentState>) => void,
  showToast: boolean = true
): { success: boolean; errorMessage: string } => {
  const errorMessage = error instanceof Error ? error.message : defaultMessage
  console.error(`${defaultMessage}:`, error)
  set({ error: errorMessage })
  if (showToast) {
    toast.error(errorMessage, { id: "appointment-error" })
  }
  return { success: false, errorMessage }
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  activeTab: "Today",
  appointments: [],
  loading: true,
  isRefreshing: false,
  hasFetched: false,
  error: null,
  router: "/appointment",
  onActiveTab: (tab: string) => set({ activeTab: tab }),

  fetchAppointments: async (isManualRefresh = false) => {
    const { hasFetched } = get()
    if (!isManualRefresh && hasFetched) {
      set({ loading: false })
      return
    }
    try {
      set({ [isManualRefresh ? "isRefreshing" : "loading"]: true, error: null })
      const response: ApiCallReturnType = await getAppointments()
      console.log("fetchAppointments: Response =", response)

      if (response.success && Array.isArray(response.data)) {
        const normalizedData = response.data.map((appt: Appointment) => ({
          ...appt,
          selectedDate: new Date(appt.selectedDate),
          selectedTime: appt.selectedTime,
          status: appt.status as AppointmentStatus,
        }))
        console.log("fetchAppointments: Fetched appointments =", normalizedData)
        set({ appointments: normalizedData, hasFetched: true })
        if (isManualRefresh) {
          const latestAppointment = normalizedData[0]
          const toastMessage = normalizedData.length
            ? `Fetched ${normalizedData.length} appointments.${
                latestAppointment
                  ? ` Latest: ${latestAppointment.customerName} (${latestAppointment.status})`
                  : ""
              }`
            : "No appointments found"
          toast.success(toastMessage, { id: "fetch-appointments" })
        }
      } else {
        const errorMessage =
          response.message || response.error || "Failed to load appointments"
        set({ appointments: [], error: errorMessage })
        if (isManualRefresh) {
          toast.error(errorMessage, {
            id: "fetch-appointments",
            duration: 3000,
            description: "Please check the server or try again later.",
          })
        }
      }
    } catch (error) {
      handleApiError(
        error,
        "Failed to fetch appointments",
        set,
        isManualRefresh
      )
    } finally {
      set({ [isManualRefresh ? "isRefreshing" : "loading"]: false })
    }
  },
  createAppointment: async (postData: PostAppoinmentData) => {
    try {
      const response: ApiCallReturnType = await createAppointment(postData)
      if (response.success && response.data) {
        set((state) => ({
          appointments: [
            {
              ...response.data,
              status: (response.data?.status ||
                "SCHEDULED") as AppointmentStatus,
              selectedDate: new Date(response.data.selectedDate),
              selectedTime: response.data.selectedTime,
              cancelledAt: response.data.cancelledAt || null,
              createdAt: response.data.createdAt || new Date(),
              updatedAt: response.data.updatedAt || new Date(),
            } as Appointment,
            ...state.appointments,
          ],
        }))
        toast.success(response.message || "Appointment created successfully", {
          id: "create-appointment",
        })
        return {
          success: true,
          message: response.message || "Appointment created successfully",
        }
      } else {
        const errorMessage =
          response.message || response.error || "Failed to create appointment"
        toast.error(errorMessage, { id: "create-appointment" })
        return { success: false, errorMessage }
      }
    } catch (error) {
      return handleApiError(error, "Failed to create appointment", set)
    }
  },

  getAppointmentById: async (id) => {
    try {
      const response: ApiCallReturnType = await getAppointmentById(id)
      if (response.success && response.data) {
        return {
          ...response.data,
          selectedDate: new Date(response.data.selectedDate),
          selectedTime: response.data.selectedTime || "",
          status: response.data.status as AppointmentStatus,
        }
      } else {
        const errorMessage =
          response.message || response.error || "Failed to fetch appointment"
        toast.error(errorMessage, { id: "fetch-appointment" })
        return null
      }
    } catch (error) {
      handleApiError(error, "Failed to fetch appointment", set)
      return null
    }
  },

  updateAppointment: async (id, postData) => {
    try {
      const response: ApiCallReturnType = await updateAppointment(id, postData)
      if (response.success && response.data) {
        set((state) => ({
          appointments: state.appointments.map((appt) =>
            appt.id === id
              ? {
                  ...appt,
                  ...response.data,
                  status: (response.data?.status ||
                    appt.status) as AppointmentStatus,
                  selectedDate: new Date(response.data.selectedDate),
                  selectedTime: response.data.selectedTime,
                }
              : appt
          ),
        }))
        toast.success(response.message || "Appointment updated successfully", {
          id: "update-appointment",
        })
        return {
          success: true,
          message: response.message || "Appointment updated successfully",
        }
      } else {
        const errorMessage =
          response.message || response.error || "Failed to update appointment"
        toast.error(errorMessage, { id: "update-appointment" })
        return { success: false, errorMessage }
      }
    } catch (error) {
      return handleApiError(error, "Failed to update appointment", set)
    }
  },

  deleteAppointment: async (id) => {
    try {
      const response: ApiCallReturnType = await deleteAppointment(id)
      if (response.success) {
        set((state) => ({
          appointments: state.appointments.filter((appt) => appt.id !== id),
        }))
        toast.success(response.message || "Appointment deleted successfully", {
          id: "delete-appointment",
        })
        return {
          success: true,
          message: response.message || "Appointment deleted successfully",
        }
      } else {
        const errorMessage =
          response.message || response.error || "Failed to delete appointment"
        toast.error(errorMessage, { id: "delete-appointment" })
        return { success: false, errorMessage }
      }
    } catch (error) {
      return handleApiError(error, "Failed to delete appointment", set)
    }
  },

  getFilteredAppointments: () => {
    const { appointments, activeTab } = get()
    if (!Array.isArray(appointments)) {
      console.warn("appointments is not an array:", appointments)
      return []
    }
    return appointments.filter((item) => {
      const isValidDate =
        item.selectedDate instanceof Date && !isNaN(item.selectedDate.getTime())
      const isValidStatus = Object.values(AppointmentStatus).includes(
        item.status as AppointmentStatus
      )
      if (activeTab === "Today") {
        return isValidDate && isSameDay(item.selectedDate, new Date())
      } else if (activeTab === "Upcoming") {
        return isValidStatus && item.status === AppointmentStatus.SCHEDULED
      } else if (activeTab === "Completed") {
        return isValidStatus && item.status === AppointmentStatus.COMPLETED
      } else if (activeTab === "Missed") {
        return isValidStatus && item.status === AppointmentStatus.MISSED
      } else if (activeTab === "Cancelled") {
        return isValidStatus && item.status === AppointmentStatus.CANCELLED
      }
      return true // 'All' tab
    })
  },
}))
