// import { create } from "zustand"
// import { toast } from "sonner"
// import {
//   getReminder,
//   getReminderById,
//   createReminder,
//   updateReminder,
//   deleteReminder,
// } from "@/features/reminder/api/api"
// import {
//   getAnnouncement,
//   createAnnouncement,
//   updateAnnouncement,
//   deleteAnnouncement,
// } from "@/features/announcement-offer/api/api"
// import { Reminder, AnnouncementOrOffer } from "@/data/structure"

// // Standardized API response type
// interface ApiCallReturnType {
//   data?: any
//   success: boolean
//   message?: string
//   error?: string
// }

// interface NotificationState {
//   activeTab: string
//   onActiveTab: (tab: string) => void
//   reminderTab: string
//   onReminderTab: (tab: string) => void
//   announcementTab: string
//   onAnnouncementTab: (tab: string) => void
//   reminders: Reminder[]
//   announcements: AnnouncementOrOffer[]
//   loading: boolean
//   isRefreshing: boolean
//   hasFetched: boolean
//   error: string | null
//   router: string
//   fetchReminders: (isManualRefresh?: boolean) => Promise<void>
//   getReminderById: (id: string) => Promise<Reminder | null>
//   createReminder: (
//     data: any
//   ) => Promise<{ success: boolean; message?: string; errorMessage?: string }>
//   updateReminder: (
//     id: string,
//     data: any
//   ) => Promise<{ success: boolean; message?: string; errorMessage?: string }>
//   deleteReminder: (
//     id: string
//   ) => Promise<{ success: boolean; message?: string; errorMessage?: string }>
//   fetchAnnouncements: (isManualRefresh?: boolean) => Promise<void>
//   createAnnouncement: (
//     data: any
//   ) => Promise<{ success: boolean; message?: string; errorMessage?: string }>
//   updateAnnouncement: (
//     id: string,
//     data: any
//   ) => Promise<{ success: boolean; message?: string; errorMessage?: string }>
//   deleteAnnouncement: (
//     id: string
//   ) => Promise<{ success: boolean; message?: string; errorMessage?: string }>
//   getFilteredReminders: () => Reminder[]
//   getFilteredAnnouncements: () => AnnouncementOrOffer[]
// }

// // Centralized error handling utility
// const handleApiError = (
//   error: any,
//   defaultMessage: string,
//   set: (state: Partial<NotificationState>) => void,
//   showToast: boolean = true
// ): { success: boolean; errorMessage: string } => {
//   const errorMessage = error instanceof Error ? error.message : defaultMessage
//   console.error(`${defaultMessage}:`, error)
//   set({ error: errorMessage })
//   if (showToast) {
//     toast.error(errorMessage, { id: "notification-error" })
//   }
//   return { success: false, errorMessage }
// }

// export const useNotificationStore = create<NotificationState>((set, get) => ({
//   activeTab: "Reminder",
//   reminderTab: "Reminder",
//   announcementTab: "All",
//   reminders: [],
//   announcements: [],
//   loading: true,
//   isRefreshing: false,
//   hasFetched: false,
//   error: null,
//   router: "/notifications",

//   onActiveTab: (tab: string) => set({ activeTab: tab }),
//   onReminderTab: (tab: string) => set({ reminderTab: tab }),
//   onAnnouncementTab: (tab: string) => set({ announcementTab: tab }),

//   fetchReminders: async (isManualRefresh = false) => {
//     const { hasFetched } = get()
//     if (!isManualRefresh && hasFetched) {
//       set({ loading: false })
//       return
//     }
//     try {
//       set({ [isManualRefresh ? "isRefreshing" : "loading"]: true, error: null })
//       const response: ApiCallReturnType = await getReminder()
//       console.log("fetchReminders: Response >>>>=", response)

//       if (response.success && Array.isArray(response.data)) {
//         const normalizedData = response.data.map((reminder: Reminder) => ({
//           ...reminder,
//         }))
//         console.log("fetchReminders: Fetched reminders =", normalizedData)
//         set({ reminders: normalizedData, hasFetched: true })
//         if (isManualRefresh) {
//           const latestReminder = normalizedData[0]
//           const toastMessage = normalizedData.length
//             ? `Fetched ${normalizedData.length} reminders.${
//                 latestReminder ? ` Latest: ${latestReminder.title}` : ""
//               }`
//             : "No reminders found"
//           toast.success(toastMessage, { id: "fetch-reminders" })
//         }
//       } else {
//         const errorMessage =
//           response.message || response.error || "Failed to load reminders"
//         set({ reminders: [], error: errorMessage })
//         if (isManualRefresh) {
//           toast.error(errorMessage, {
//             id: "fetch-reminders",
//             duration: 3000,
//             description: "Please check the server or try again later.",
//           })
//         }
//       }
//     } catch (error) {
//       handleApiError(error, "Failed to fetch reminders", set, isManualRefresh)
//     } finally {
//       set({ [isManualRefresh ? "isRefreshing" : "loading"]: false })
//     }
//   },

//   getReminderById: async (id: string) => {
//     try {
//       const response: ApiCallReturnType = await getReminderById(id)
//       console.log("getReminderById: Response =", response)
//       if (response.success && response.data) {
//         return {
//           ...response.data,
//           createdAt: new Date(response.data.createdAt),
//           updatedAt: new Date(response.data.updatedAt),
//         }
//       } else {
//         const errorMessage =
//           response.message || response.error || "Failed to fetch reminder"
//         toast.error(errorMessage, { id: "fetch-reminder" })
//         return null
//       }
//     } catch (error) {
//       handleApiError(error, "Failed to fetch reminder", set)
//       return null
//     }
//   },

//   createReminder: async (data: any) => {
//     try {
//       const response: ApiCallReturnType = await createReminder(data)
//       console.log("createReminder: Response =", response)
//       if (response.success && response.data) {
//         await get().fetchReminders(true) // Refresh data after creation
//         toast.success(response.message || "Reminder created successfully", {
//           id: "create-reminder",
//         })
//         return {
//           success: true,
//           message: response.message || "Reminder created successfully",
//         }
//       } else {
//         const errorMessage =
//           response.message || response.error || "Failed to create reminder"
//         toast.error(errorMessage, { id: "create-reminder" })
//         return { success: false, errorMessage }
//       }
//     } catch (error) {
//       return handleApiError(error, "Failed to create reminder", set)
//     }
//   },

//   updateReminder: async (id: string, data: any) => {
//     try {
//       const response: ApiCallReturnType = await updateReminder(id, data)
//       console.log("updateReminder: Response =", response)
//       if (response.success && response.data) {
//         await get().fetchReminders(true) // Refresh data after update
//         toast.success(response.message || "Reminder updated successfully", {
//           id: "update-reminder",
//         })
//         return {
//           success: true,
//           message: response.message || "Reminder updated successfully",
//         }
//       } else {
//         const errorMessage =
//           response.message || response.error || "Failed to update reminder"
//         toast.error(errorMessage, { id: "update-reminder" })
//         return { success: false, errorMessage }
//       }
//     } catch (error) {
//       return handleApiError(error, "Failed to update reminder", set)
//     }
//   },

//   deleteReminder: async (id: string) => {
//     try {
//       const response: ApiCallReturnType = await deleteReminder(id)
//       console.log("deleteReminder: Response =", response)
//       if (response.success) {
//         await get().fetchReminders(true) // Refresh data after deletion
//         toast.success(response.message || "Reminder deleted successfully", {
//           id: "delete-reminder",
//         })
//         return {
//           success: true,
//           message: response.message || "Reminder deleted successfully",
//         }
//       } else {
//         const errorMessage =
//           response.message || response.error || "Failed to delete reminder"
//         toast.error(errorMessage, { id: "delete-reminder" })
//         return { success: false, errorMessage }
//       }
//     } catch (error) {
//       return handleApiError(error, "Failed to delete reminder", set)
//     }
//   },

//   fetchAnnouncements: async (isManualRefresh = false) => {
//     const { hasFetched } = get()
//     if (!isManualRefresh && hasFetched) {
//       set({ loading: false })
//       return
//     }
//     try {
//       set({ [isManualRefresh ? "isRefreshing" : "loading"]: true, error: null })
//       const response: ApiCallReturnType = await getAnnouncement()
//       console.log("fetchAnnouncements: Response >>>>=", response)

//       if (response.success && Array.isArray(response.data)) {
//         const normalizedData = response.data.map(
//           (announcement: AnnouncementOrOffer) => ({
//             ...announcement,
//             scheduledAt: new Date(announcement.scheduledAt),
//             expiredAt: announcement.expiredAt,
//           })
//         )
//         console.log(
//           "fetchAnnouncements: Fetched announcements =",
//           normalizedData
//         )
//         set({ announcements: normalizedData, hasFetched: true })
//         if (isManualRefresh) {
//           const latestAnnouncement = normalizedData[0]
//           const toastMessage = normalizedData.length
//             ? `Fetched ${normalizedData.length} announcements.${
//                 latestAnnouncement ? ` Latest: ${latestAnnouncement.title}` : ""
//               }`
//             : "No announcements found"
//           toast.success(toastMessage, { id: "fetch-announcements" })
//         }
//       } else {
//         const errorMessage =
//           response.message || response.error || "Failed to load announcements"
//         set({ announcements: [], error: errorMessage })
//         if (isManualRefresh) {
//           toast.error(errorMessage, {
//             id: "fetch-announcements",
//             duration: 3000,
//             description: "Please check the server or try again later.",
//           })
//         }
//       }
//     } catch (error) {
//       handleApiError(
//         error,
//         "Failed to fetch announcements",
//         set,
//         isManualRefresh
//       )
//     } finally {
//       set({ [isManualRefresh ? "isRefreshing" : "loading"]: false })
//     }
//   },

//   createAnnouncement: async (data: any) => {
//     try {
//       const response: ApiCallReturnType = await createAnnouncement(data)
//       console.log("createAnnouncement: Response =", response)
//       if (response.success && response.data) {
//         await get().fetchAnnouncements(true) // Refresh data after creation
//         toast.success(response.message || "Announcement created successfully", {
//           id: "create-announcement",
//         })
//         return {
//           success: true,
//           message: response.message || "Announcement created successfully",
//         }
//       } else {
//         const errorMessage =
//           response.message || response.error || "Failed to create announcement"
//         toast.error(errorMessage, { id: "create-announcement" })
//         return { success: false, errorMessage }
//       }
//     } catch (error) {
//       return handleApiError(error, "Failed to create announcement", set)
//     }
//   },

//   updateAnnouncement: async (id: string, data: any) => {
//     try {
//       const response: ApiCallReturnType = await updateAnnouncement(id, data)
//       console.log("updateAnnouncement: Response =", response)
//       if (response.success && response.data) {
//         await get().fetchAnnouncements(true) // Refresh data after update
//         toast.success(response.message || "Announcement updated successfully", {
//           id: "update-announcement",
//         })
//         return {
//           success: true,
//           message: response.message || "Announcement updated successfully",
//         }
//       } else {
//         const errorMessage =
//           response.message || response.error || "Failed to update announcement"
//         toast.error(errorMessage, { id: "update-announcement" })
//         return { success: false, errorMessage }
//       }
//     } catch (error) {
//       return handleApiError(error, "Failed to update announcement", set)
//     }
//   },

//   deleteAnnouncement: async (id: string) => {
//     try {
//       const response: ApiCallReturnType = await deleteAnnouncement(id)
//       console.log("deleteAnnouncement: Response =", response)
//       if (response.success) {
//         await get().fetchAnnouncements(true) // Refresh data after deletion
//         toast.success(response.message || "Announcement deleted successfully", {
//           id: "delete-announcement",
//         })
//         return {
//           success: true,
//           message: response.message || "Announcement deleted successfully",
//         }
//       } else {
//         const errorMessage =
//           response.message || response.error || "Failed to delete announcement"
//         toast.error(errorMessage, { id: "delete-announcement" })
//         return { success: false, errorMessage }
//       }
//     } catch (error) {
//       return handleApiError(error, "Failed to delete announcement", set)
//     }
//   },

//   getFilteredReminders: () => {
//     const { reminders, reminderTab } = get()
//     console.log("getFilteredReminders: reminders =====", reminders)
//     if (!Array.isArray(reminders)) {
//       console.warn("reminders is not an array:", reminders)
//       return []
//     }
//     return reminders.filter((item) => {
//       if (reminderTab === "Reminder") {
//         return item.type === "REMINDER"
//       } else if (reminderTab === "Follow up") {
//         return item.type === "FOLLOW_UP"
//       } else if (reminderTab === "Cancellation") {
//         return item.type === "CANCELLATION"
//       } else if (reminderTab === "Missed") {
//         return item.type === "MISSED"
//       } else if (reminderTab === "Custom") {
//         return item.type === "CUSTOM"
//       }
//       return item.type === "REMINDER"
//     })
//   },

//   getFilteredAnnouncements: () => {
//     const { announcements, announcementTab } = get()
//     console.log("getFilteredAnnouncements: announcements =====", announcements)
//     if (!Array.isArray(announcements)) {
//       console.warn("announcements is not an array:", announcements)
//       return []
//     }
//     return announcements.filter((item) => {
//       const now = new Date().getTime()
//       const scheduledTime = new Date(item.scheduledAt).getTime()
//       const expiryDuration = (() => {
//         switch (item.expiredAt) {
//           case "ONE_DAY":
//             return 1 * 24 * 60 * 60 * 1000
//           case "THREE_DAYS":
//             return 3 * 24 * 60 * 60 * 1000
//           case "SEVEN_DAYS":
//             return 7 * 24 * 60 * 60 * 1000
//           default:
//             return 0
//         }
//       })()
//       const expiryTime = scheduledTime + expiryDuration

//       switch (announcementTab) {
//         case "Sent":
//           return scheduledTime <= now && now <= expiryTime
//         case "Scheduled":
//           return scheduledTime > now
//         case "Expired":
//           return now > expiryTime
//         case "All":
//         default:
//           return true
//       }
//     })
//   },
// }))

import { create } from "zustand"
import { toast } from "sonner"
import {
  getReminder,
  getReminderById,
  createReminder,
  updateReminder,
  deleteReminder,
} from "@/features/reminder/api/api"
import {
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "@/features/announcement-offer/api/api"
import { Reminder, AnnouncementOrOffer } from "@/data/structure"

// Standardized API response type
interface ApiCallReturnType {
  data?: any
  success: boolean
  message?: string
  error?: string
}

interface NotificationState {
  activeTab: string
  onActiveTab: (tab: string) => void
  reminderTab: string
  onReminderTab: (tab: string) => void
  announcementTab: string
  onAnnouncementTab: (tab: string) => void
  reminders: Reminder[]
  announcements: AnnouncementOrOffer[]
  loading: boolean
  isRefreshing: boolean
  hasFetched: boolean
  error: string | null
  router: string
  fetchReminders: (isManualRefresh?: boolean) => Promise<void>
  getReminderById: (id: string) => Promise<Reminder | null>
  createReminder: (
    data: any
  ) => Promise<{ success: boolean; message?: string; errorMessage?: string }>
  updateReminder: (
    id: string,
    data: any
  ) => Promise<{ success: boolean; message?: string; errorMessage?: string }>
  deleteReminder: (
    id: string
  ) => Promise<{ success: boolean; message?: string; errorMessage?: string }>
  fetchAnnouncements: (isManualRefresh?: boolean) => Promise<void>
  createAnnouncement: (
    data: any
  ) => Promise<{ success: boolean; message?: string; errorMessage?: string }>
  updateAnnouncement: (
    id: string,
    data: any
  ) => Promise<{ success: boolean; message?: string; errorMessage?: string }>
  deleteAnnouncement: (
    id: string
  ) => Promise<{ success: boolean; message?: string; errorMessage?: string }>
  getFilteredReminders: () => Reminder[]
  getFilteredAnnouncements: () => AnnouncementOrOffer[]
}

// Centralized error handling utility
const handleApiError = (
  error: any,
  defaultMessage: string,
  set: (state: Partial<NotificationState>) => void,
  showToast: boolean = true
): { success: boolean; errorMessage: string } => {
  const errorMessage = error instanceof Error ? error.message : defaultMessage
  console.error(`${defaultMessage}:`, error)
  set({ error: errorMessage })
  if (showToast) {
    toast.error(errorMessage, { id: "notification-error" })
  }
  return { success: false, errorMessage }
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  activeTab: "Reminder",
  reminderTab: "Reminder",
  announcementTab: "Sent",
  reminders: [],
  announcements: [],
  loading: true,
  isRefreshing: false,
  hasFetched: false,
  error: null,
  router: "/reminders",

  onActiveTab: (tab: string) => set({ activeTab: tab }),
  onReminderTab: (tab: string) => set({ reminderTab: tab }),
  onAnnouncementTab: (tab: string) => set({ announcementTab: tab }),

  fetchReminders: async (isManualRefresh = false) => {
    const { hasFetched } = get()
    if (!isManualRefresh && hasFetched) {
      set({ loading: false })
      return
    }
    try {
      set({ [isManualRefresh ? "isRefreshing" : "loading"]: true, error: null })
      const response: ApiCallReturnType = await getReminder()
      console.log("fetchReminders: Response >>>>=", response)

      if (response.success && Array.isArray(response.data)) {
        const normalizedData = response.data.map((reminder: Reminder) => ({
          ...reminder,
        }))
        console.log("fetchReminders: Fetched reminders =", normalizedData)
        set({ reminders: normalizedData, hasFetched: true })
        if (isManualRefresh) {
          const latestReminder = normalizedData[0]
          const toastMessage = normalizedData.length
            ? `Fetched ${normalizedData.length} reminders.${
                latestReminder ? ` Latest: ${latestReminder.title}` : ""
              }`
            : "No reminders found"
          toast.success(toastMessage, { id: "fetch-reminders" })
        }
      } else {
        const errorMessage =
          response.message || response.error || "Failed to load reminders"
        set({ reminders: [], error: errorMessage })
        if (isManualRefresh) {
          toast.error(errorMessage, {
            id: "fetch-reminders",
            duration: 3000,
            description: "Please check the server or try again later.",
          })
        }
      }
    } catch (error) {
      handleApiError(error, "Failed to fetch reminders", set, isManualRefresh)
    } finally {
      set({ [isManualRefresh ? "isRefreshing" : "loading"]: false })
    }
  },

  getReminderById: async (id: string) => {
    try {
      const response: ApiCallReturnType = await getReminderById(id)
      console.log("getReminderById: Response =", response)
      if (response.success && response.data) {
        return {
          ...response.data,
        }
      } else {
        const errorMessage =
          response.message || response.error || "Failed to fetch reminder"
        toast.error(errorMessage, { id: "fetch-reminder" })
        return null
      }
    } catch (error) {
      handleApiError(error, "Failed to fetch reminder", set)
      return null
    }
  },

  createReminder: async (data: any) => {
    try {
      const response: ApiCallReturnType = await createReminder(data)
      console.log("createReminder: Response =", response)
      if (response.success && response.data) {
        set((state) => ({
          reminders: [
            {
              ...response.data,
              createdAt: new Date(response.data.createdAt || new Date()),
              updatedAt: new Date(response.data.updatedAt || new Date()),
            } as Reminder,
            ...state.reminders,
          ],
        }))
        toast.success(response.message || "Reminder created successfully", {
          id: "create-reminder",
        })
        return {
          success: true,
          message: response.message || "Reminder created successfully",
        }
      } else {
        const errorMessage =
          response.message || response.error || "Failed to create reminder"
        toast.error(errorMessage, { id: "create-reminder" })
        return { success: false, errorMessage }
      }
    } catch (error) {
      return handleApiError(error, "Failed to create reminder", set)
    }
  },

  updateReminder: async (id: string, data: any) => {
    try {
      const response: ApiCallReturnType = await updateReminder(id, data)
      console.log("updateReminder: Response =", response)
      if (response.success && response.data) {
        set((state) => ({
          reminders: state.reminders.map((reminder) =>
            reminder.id === id
              ? {
                  ...reminder,
                  ...response.data,
                  createdAt: new Date(response.data.createdAt),
                  updatedAt: new Date(response.data.updatedAt || new Date()),
                }
              : reminder
          ),
        }))
        toast.success(response.message || "Reminder updated successfully", {
          id: "update-reminder",
        })
        return {
          success: true,
          message: response.message || "Reminder updated successfully",
        }
      } else {
        const errorMessage =
          response.message || response.error || "Failed to update reminder"
        toast.error(errorMessage, { id: "update-reminder" })
        return { success: false, errorMessage }
      }
    } catch (error) {
      return handleApiError(error, "Failed to update reminder", set)
    }
  },

  deleteReminder: async (id: string) => {
    try {
      const response: ApiCallReturnType = await deleteReminder(id)
      console.log("deleteReminder: Response =", response)
      if (response.success) {
        set((state) => ({
          reminders: state.reminders.filter((reminder) => reminder.id !== id),
        }))
        toast.success(response.message || "Reminder deleted successfully", {
          id: "delete-reminder",
        })
        return {
          success: true,
          message: response.message || "Reminder deleted successfully",
        }
      } else {
        const errorMessage =
          response.message || response.error || "Failed to delete reminder"
        toast.error(errorMessage, { id: "delete-reminder" })
        return { success: false, errorMessage }
      }
    } catch (error) {
      return handleApiError(error, "Failed to delete reminder", set)
    }
  },

  fetchAnnouncements: async (isManualRefresh = false) => {
    const { hasFetched } = get()
    if (!isManualRefresh && hasFetched) {
      set({ loading: false })
      return
    }
    try {
      set({ [isManualRefresh ? "isRefreshing" : "loading"]: true, error: null })
      const response: ApiCallReturnType = await getAnnouncement()
      console.log("fetchAnnouncements: Response >>>>=", response)

      if (response.success && Array.isArray(response.data)) {
        const normalizedData = response.data.map(
          (announcement: AnnouncementOrOffer) => ({
            ...announcement,
            scheduledAt: new Date(announcement.scheduledAt),
            expiredAt: announcement.expiredAt,
          })
        )
        console.log(
          "fetchAnnouncements: Fetched announcements =",
          normalizedData
        )
        set({ announcements: normalizedData, hasFetched: true })
        if (isManualRefresh) {
          const latestAnnouncement = normalizedData[0]
          const toastMessage = normalizedData.length
            ? `Fetched ${normalizedData.length} announcements.${
                latestAnnouncement ? ` Latest: ${latestAnnouncement.title}` : ""
              }`
            : "No announcements found"
          toast.success(toastMessage, { id: "fetch-announcements" })
        }
      } else {
        const errorMessage =
          response.message || response.error || "Failed to load announcements"
        set({ announcements: [], error: errorMessage })
        if (isManualRefresh) {
          toast.error(errorMessage, {
            id: "fetch-announcements",
            duration: 3000,
            description: "Please check the server or try again later.",
          })
        }
      }
    } catch (error) {
      handleApiError(
        error,
        "Failed to fetch announcements",
        set,
        isManualRefresh
      )
    } finally {
      set({ [isManualRefresh ? "isRefreshing" : "loading"]: false })
    }
  },

  createAnnouncement: async (data: any) => {
    try {
      const response: ApiCallReturnType = await createAnnouncement(data)
      console.log("createAnnouncement: Response =", response)
      if (response.success && response.data) {
        set((state) => ({
          announcements: [
            {
              ...response.data,
              scheduledAt: new Date(response.data.scheduledAt || new Date()),
              expiredAt: response.data.expiredAt,
            } as AnnouncementOrOffer,
            ...state.announcements,
          ],
        }))
        toast.success(response.message || "Announcement created successfully", {
          id: "create-announcement",
        })
        return {
          success: true,
          message: response.message || "Announcement created successfully",
        }
      } else {
        const errorMessage =
          response.message || response.error || "Failed to create announcement"
        toast.error(errorMessage, { id: "create-announcement" })
        return { success: false, errorMessage }
      }
    } catch (error) {
      return handleApiError(error, "Failed to create announcement", set)
    }
  },

  updateAnnouncement: async (id: string, data: any) => {
    try {
      const response: ApiCallReturnType = await updateAnnouncement(id, data)
      console.log("updateAnnouncement: Response =", response)
      if (response.success && response.data) {
        set((state) => ({
          announcements: state.announcements.map((announcement) =>
            announcement.id === id
              ? {
                  ...announcement,
                  ...response.data,
                  scheduledAt: new Date(response.data.scheduledAt),
                  expiredAt: response.data.expiredAt,
                }
              : announcement
          ),
        }))
        toast.success(response.message || "Announcement updated successfully", {
          id: "update-announcement",
        })
        return {
          success: true,
          message: response.message || "Announcement updated successfully",
        }
      } else {
        const errorMessage =
          response.message || response.error || "Failed to update announcement"
        toast.error(errorMessage, { id: "update-announcement" })
        return { success: false, errorMessage }
      }
    } catch (error) {
      return handleApiError(error, "Failed to update announcement", set)
    }
  },

  deleteAnnouncement: async (id: string) => {
    try {
      const response: ApiCallReturnType = await deleteAnnouncement(id)
      console.log("deleteAnnouncement: Response =", response)
      if (response.success) {
        set((state) => ({
          announcements: state.announcements.filter(
            (announcement) => announcement.id !== id
          ),
        }))
        toast.success(response.message || "Announcement deleted successfully", {
          id: "delete-announcement",
        })
        return {
          success: true,
          message: response.message || "Announcement deleted successfully",
        }
      } else {
        const errorMessage =
          response.message || response.error || "Failed to delete announcement"
        toast.error(errorMessage, { id: "delete-announcement" })
        return { success: false, errorMessage }
      }
    } catch (error) {
      return handleApiError(error, "Failed to delete announcement", set)
    }
  },

  getFilteredReminders: () => {
    const { reminders, reminderTab } = get()
    console.log("getFilteredReminders: reminders =====", reminders)
    if (!Array.isArray(reminders)) {
      console.warn("reminders is not an array:", reminders)
      return []
    }
    return reminders.filter((item) => {
      if (reminderTab === "Reminder") {
        return item.type === "REMINDER"
      } else if (reminderTab === "Follow up") {
        return item.type === "FOLLOW_UP"
      } else if (reminderTab === "Cancellation") {
        return item.type === "CANCELLATION"
      } else if (reminderTab === "Missed") {
        return item.type === "MISSED"
      } else if (reminderTab === "Custom") {
        return item.type === "CUSTOM"
      }
      return item.type === "REMINDER"
    })
  },

  getFilteredAnnouncements: () => {
    const { announcements, announcementTab } = get()
    console.log("getFilteredAnnouncements: announcements =====", announcements)
    if (!Array.isArray(announcements)) {
      console.warn("announcements is not an array:", announcements)
      return []
    }
    return announcements.filter((item) => {
      const now = new Date().getTime()
      const scheduledTime = new Date(item.scheduledAt).getTime()
      const expiryDuration = (() => {
        switch (item.expiredAt) {
          case "ONE_DAY":
            return 1 * 24 * 60 * 60 * 1000
          case "THREE_DAYS":
            return 3 * 24 * 60 * 60 * 1000
          case "SEVEN_DAYS":
            return 7 * 24 * 60 * 60 * 1000
          default:
            return 0
        }
      })()
      const expiryTime = scheduledTime + expiryDuration

      switch (announcementTab) {
        case "Sent":
          return scheduledTime <= now && now <= expiryTime
        case "Scheduled":
          return scheduledTime > now
        case "Expired":
          return now > expiryTime
        case "All":
        default:
          return true
      }
    })
  },
}))
