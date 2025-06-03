// import { create } from "zustand"
// import { toast } from "sonner"
// import { getSupportDetailByBusinessId } from "../_api-call/support-api-call"
// import { PostSupportBusinessDetail } from "../_types/types"
// import {
//   getFAQs,
//   createFAQ,
//   updateFAQ,
//   deleteFAQ,
// } from "@/features/faq/api/api"

// // Define valid mobile tab names
// export type TabMapKey = "Contact" | "FAQs" | "Issues" | "Support"

// interface SupportBusinessDetail {
//   id?: string
//   supportBusinessName: string
//   supportEmail: string
//   supportPhone: string
//   supportAddress: string
//   supportGoogleMap: string
//   supportAvailability: Array<{
//     weekDay: string
//     type: "SUPPORT"
//     timeSlots: Array<{
//       type: "WORK" | "BREAK"
//       startTime: string
//       endTime: string
//     }>
//   }>
//   supportHoliday: Array<{
//     holiday: string
//     type: "SUPPORT"
//     date: string
//   }>
//   businessId: string
// }

// interface FAQ {
//   id: string
//   question: string
//   answer: string
//   category: string
//   isActive: boolean
//   lastUpdatedById: string
//   createdById: string
// }

// interface SupportTabsState {
//   activeTab: string
//   tabMap: Record<TabMapKey, string>
//   tabs: string[]
//   mTabs: TabMapKey[]
//   setActiveTab: (tab: string) => void
//   handleMobileTabChange: (mobileTab: TabMapKey) => void
//   supportDetail: SupportBusinessDetail | null
//   loading: boolean
//   error: string | null
//   setSupportDetail: (detail: SupportBusinessDetail | null) => void
//   getSupportBusinessDetailById: (businessId: string) => Promise<any>
//   faqs: FAQ[]
//   faqLoading: boolean
//   faqError: string | null
//   deletingFAQId: string | null
//   setFAQs: (faqs: FAQ[]) => void
//   getFAQs: () => Promise<void>
//   createFAQ: (faqData: Omit<FAQ, "id">) => Promise<void>
//   updateFAQ: (id: string, faqData: Omit<FAQ, "id">) => Promise<void>
//   deleteFAQ: (id: string) => Promise<void>
//   refreshFAQs: () => Promise<void>
// }

// // Weekday mapping for form ↔ database conversion
// const weekdayMap: { [key: string]: string } = {
//   Mon: "MONDAY",
//   MONDAY: "Mon",
//   Tue: "TUESDAY",
//   TUESDAY: "Tue",
//   Wed: "WEDNESDAY",
//   WEDNESDAY: "Wed",
//   Thu: "THURSDAY",
//   THURSDAY: "Thu",
//   Fri: "FRIDAY",
//   FRIDAY: "Fri",
//   Sat: "SATURDAY",
//   SATURDAY: "Sat",
//   Sun: "SUNDAY",
//   SUNDAY: "Sun",
// }

// // Transform SupportBusinessDetail to form data
// export const transformSupportDetailForForm = (
//   supportDetail: SupportBusinessDetail
// ) => {
//   const businessHours: any = {}
//   const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
//   days.forEach((day) => {
//     businessHours[day] = { work: [], break: [] }
//   })

//   supportDetail.supportAvailability.forEach((avail) => {
//     const dayKey = weekdayMap[avail.weekDay]
//     if (!dayKey) return
//     const workSlots: [string, string][] = []
//     const breakSlots: [string, string][] = []
//     avail.timeSlots.forEach((slot) => {
//       const slotPair: [string, string] = [slot.startTime, slot.endTime]
//       if (slot.type === "WORK") {
//         workSlots.push(slotPair)
//       } else if (slot.type === "BREAK") {
//         breakSlots.push(slotPair)
//       }
//     })
//     businessHours[dayKey].work = workSlots
//     businessHours[dayKey].break = breakSlots
//   })

//   return {
//     businessName: supportDetail.supportBusinessName,
//     supportEmail: supportDetail.supportEmail,
//     phone: supportDetail.supportPhone,
//     address: supportDetail.supportAddress,
//     googleMap: supportDetail.supportGoogleMap,
//     businessHours,
//     businessDays: supportDetail.supportAvailability.map(
//       (avail) => weekdayMap[avail.weekDay]
//     ),
//     holidays: supportDetail.supportHoliday.map((h) => weekdayMap[h.holiday]),
//   }
// }

// // Transform Business to form data
// export const transformBusinessDataForSupportDetail = (business: any) => {
//   const businessHours: any = {}
//   const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
//   days.forEach((day) => {
//     businessHours[day] = { work: [], break: [] }
//   })

//   business.businessAvailability.forEach((avail: any) => {
//     const dayKey = weekdayMap[avail.weekDay]
//     if (!dayKey) return
//     const workSlots: [string, string][] = []
//     const breakSlots: [string, string][] = []
//     avail.timeSlots.forEach((slot: any) => {
//       const slotPair: [string, string] = [slot.startTime, slot.endTime]
//       if (slot.type === "WORK") {
//         workSlots.push(slotPair)
//       } else if (slot.type === "BREAK") {
//         breakSlots.push(slotPair)
//       }
//     })
//     businessHours[dayKey].work = workSlots
//     businessHours[dayKey].break = breakSlots
//   })

//   return {
//     businessName: business.name,
//     supportEmail: business.email,
//     phone: business.phone,
//     address: business.address[0]?.street || "",
//     googleMap: business.address[0]?.googleMap || "",
//     businessHours,
//     businessDays: business.businessAvailability.map(
//       (avail: any) => weekdayMap[avail.weekDay]
//     ),
//     holidays: business.holiday.map((h: any) => weekdayMap[h.holiday]),
//   }
// }

// // Transform form data to PostSupportBusinessDetail
// export const transformFormDataForSupportDetail = (
//   formData: any
// ): PostSupportBusinessDetail => {
//   const {
//     businessName,
//     supportEmail,
//     phone,
//     address,
//     googleMap,
//     businessHours,
//     businessDays,
//     holidays,
//     businessId,
//   } = formData

//   const supportAvailability = businessDays.map((day: string) => {
//     const hours = businessHours[day] || { work: [], break: [] }
//     const timeSlots = [
//       ...hours.work.map(([startTime, endTime]: [string, string]) => ({
//         type: "WORK" as const,
//         startTime,
//         endTime,
//       })),
//       ...hours.break.map(([startTime, endTime]: [string, string]) => ({
//         type: "BREAK" as const,
//         startTime,
//         endTime,
//       })),
//     ]

//     return {
//       weekDay: weekdayMap[day] || day,
//       type: "SUPPORT" as const,
//       timeSlots,
//     }
//   })

//   const supportHoliday = holidays.map((day: string) => ({
//     holiday: weekdayMap[day] || day,
//     type: "SUPPORT" as const,
//     date: "",
//   }))

//   return {
//     supportBusinessName: businessName,
//     supportEmail,
//     supportPhone: phone,
//     supportAddress: address,
//     supportGoogleMap: googleMap,
//     supportAvailability,
//     supportHoliday,
//     businessId,
//   }
// }

// export const useSupportTabsStore = create<SupportTabsState>((set) => ({
//   activeTab: "Contact Information",
//   tabMap: {
//     Contact: "Contact Information",
//     FAQs: "Frequently Asked Questions (FAQs)",
//     Issues: "Customer Support",
//     Support: "Admin Support",
//   },
//   tabs: [
//     "Contact Information",
//     "Frequently Asked Questions (FAQs)",
//     "Customer Support",
//     "Admin Support",
//   ],
//   mTabs: ["Contact", "FAQs", "Issues", "Support"],
//   setActiveTab: (tab) => set({ activeTab: tab }),
//   handleMobileTabChange: (mobileTab) =>
//     set((state) => {
//       const mapped = state.tabMap[mobileTab]
//       return { activeTab: mapped || state.activeTab }
//     }),
//   supportDetail: null,
//   loading: false,
//   error: null,
//   setSupportDetail: (detail) => set({ supportDetail: detail, error: null }),
//   getSupportBusinessDetailById: async (businessId: string) => {
//     set({ loading: true, error: null })
//     try {
//       const res = await getSupportDetailByBusinessId(businessId)
//       console.log("Support detail response:", res)
//       if (res.data) {
//         set({ supportDetail: res.data, loading: false })
//         return { data: res.data, success: true }
//       } else {
//         set({ supportDetail: null, loading: false })
//         return { data: null, success: true }
//       }
//     } catch (error: any) {
//       set({
//         error: error.message || "Failed to fetch support details",
//         loading: false,
//       })
//       toast.error("Failed to fetch support details")
//       return {
//         error,
//         success: false,
//         message: "Failed to fetch support details",
//       }
//     }
//   },
//   faqs: [],
//   faqLoading: false,
//   faqError: null,
//   deletingFAQId: null,
//   setFAQs: (faqs) => set({ faqs, faqError: null }),
//   getFAQs: async () => {
//     set({ faqLoading: true, faqError: null })
//     try {
//       const fetchedFaqs = await getFAQs()
//       console.log("Fetched FAQs:", fetchedFaqs)
//       set({
//         faqs: Array.isArray(fetchedFaqs) ? fetchedFaqs : [],
//         faqLoading: false,
//         faqError: null,
//       })
//     } catch (error: any) {
//       set({
//         faqs: [],
//         faqError: error.message || "Failed to fetch FAQs",
//         faqLoading: false,
//       })
//       toast.error("Failed to fetch FAQs")
//     }
//   },
//   createFAQ: async (faqData) => {
//     set({ faqLoading: true, faqError: null })
//     try {
//       const createdFAQ = await createFAQ({ id: "", ...faqData })
//       console.log("Created FAQ:", createdFAQ)
//       set((state) => ({
//         faqs: [createdFAQ.faq, ...state.faqs],
//         faqLoading: false,
//         faqError: null,
//       }))
//       toast.success("FAQ created successfully!")
//     } catch (error: any) {
//       set({
//         faqError: error.message || "Failed to create FAQ",
//         faqLoading: false,
//       })
//       toast.error("Failed to create FAQ")
//     }
//   },
//   updateFAQ: async (id, faqData) => {
//     set({ faqLoading: true, faqError: null })
//     try {
//       const updatedFAQ = await updateFAQ(id, faqData)
//       console.log("Updated FAQ:", updatedFAQ)
//       set((state) => ({
//         faqs: state.faqs.map((faq) => (faq.id === id ? updatedFAQ.faq : faq)),
//         faqLoading: false,
//         faqError: null,
//       }))
//       toast.success("FAQ updated successfully!")
//     } catch (error: any) {
//       set({
//         faqError: error.message || "Failed to update FAQ",
//         faqLoading: false,
//       })
//       toast.error("Failed to update FAQ")
//     }
//   },
//   deleteFAQ: async (id) => {
//     if (id.startsWith("temp-")) {
//       set({
//         faqError: "Cannot delete FAQ: Still processing creation",
//         faqLoading: false,
//       })
//       toast.error("Cannot delete FAQ: Still processing creation")
//       return
//     }
//     set({ faqLoading: true, faqError: null, deletingFAQId: id })
//     let deletedFAQ: FAQ | undefined
//     set((state) => {
//       deletedFAQ = state.faqs.find((faq) => faq.id === id)
//       return {
//         faqs: state.faqs.filter((faq) => faq.id !== id),
//         faqLoading: true,
//         deletingFAQId: id,
//       }
//     })
//     try {
//       await deleteFAQ(id)
//       console.log("Deleted FAQ ID:", id)
//       set({ faqLoading: false, deletingFAQId: null })
//       toast.success("FAQ deleted successfully!")
//     } catch (error: any) {
//       set((state) => ({
//         faqs: deletedFAQ ? [deletedFAQ, ...state.faqs] : state.faqs,
//         faqError: error.message || "Failed to delete FAQ",
//         faqLoading: false,
//         deletingFAQId: null,
//       }))
//       toast.error("Failed to delete FAQ")
//     }
//   },
//   refreshFAQs: async () => {
//     set({ faqLoading: true, faqError: null })
//     try {
//       const fetchedFaqs = await getFAQs()
//       console.log("Refreshed FAQs:", fetchedFaqs)
//       set({
//         faqs: Array.isArray(fetchedFaqs) ? fetchedFaqs : [],
//         faqLoading: false,
//         faqError: null,
//       })
//     } catch (error: any) {
//       set({
//         faqs: [],
//         faqError: error.message || "Failed to refresh FAQs",
//         faqLoading: false,
//       })
//       toast.error("Failed to refresh FAQs")
//     }
//   },
// }))

import { create } from "zustand"
import { toast } from "sonner"
import { getSupportDetailByBusinessId } from "../_api-call/support-api-call"
import { PostSupportBusinessDetail } from "../_types/types"
import {
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} from "@/features/faq/api/api"
import { createTicket } from "@/features/help-support/api/api"

// Define valid mobile tab names
export type TabMapKey = "Contact" | "FAQs" | "Issues" | "Support"

interface SupportBusinessDetail {
  id?: string
  supportBusinessName: string
  supportEmail: string
  supportPhone: string
  supportAddress: string
  supportGoogleMap: string
  supportAvailability: Array<{
    weekDay: string
    type: "SUPPORT"
    timeSlots: Array<{
      type: "WORK" | "BREAK"
      startTime: string
      endTime: string
    }>
  }>
  supportHoliday: Array<{
    holiday: string
    type: "SUPPORT"
    date: string
  }>
  businessId: string
}

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  isActive: boolean
  lastUpdatedById: string
  createdById: string
}

interface Ticket {
  userType: string
  subject: string
  ticketDescription: string
  category: string
  priority: string
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
  assignedTo: string
  resolutionDescription: string
  proofFiles: string
  initiatedById: string
  userId: string
}

interface SupportTabsState {
  activeTab: string
  tabMap: Record<TabMapKey, string>
  tabs: string[]
  mTabs: TabMapKey[]
  setActiveTab: (tab: string) => void
  handleMobileTabChange: (mobileTab: TabMapKey) => void
  supportDetail: SupportBusinessDetail | null
  loading: boolean
  error: string | null
  setSupportDetail: (detail: SupportBusinessDetail | null) => void
  getSupportBusinessDetailById: (businessId: string) => Promise<any>
  faqs: FAQ[]
  faqLoading: boolean
  faqError: string | null
  deletingFAQId: string | null
  setFAQs: (faqs: FAQ[]) => void
  getFAQs: () => Promise<void>
  createFAQ: (faqData: Omit<FAQ, "id">) => Promise<void>
  updateFAQ: (id: string, faqData: Omit<FAQ, "id">) => Promise<void>
  deleteFAQ: (id: string) => Promise<void>
  refreshFAQs: () => Promise<void>
  ticketSubmitted: boolean
  ticketLoading: boolean
  ticketError: string | null
  createTicket: (ticketData: Ticket) => Promise<void>
  resetTicketState: () => void
}

// Weekday mapping for form ↔ database conversion
const weekdayMap: { [key: string]: string } = {
  Mon: "MONDAY",
  MONDAY: "Mon",
  Tue: "TUESDAY",
  TUESDAY: "Tue",
  Wed: "WEDNESDAY",
  WEDNESDAY: "Wed",
  Thu: "THURSDAY",
  THURSDAY: "Thu",
  Fri: "FRIDAY",
  FRIDAY: "Fri",
  Sat: "SATURDAY",
  SATURDAY: "Sat",
  Sun: "SUNDAY",
  SUNDAY: "Sun",
}

// Transform SupportBusinessDetail to form data
// Transform SupportBusinessDetail to form data
export const transformSupportDetailForForm = (
  supportDetail: SupportBusinessDetail
) => {
  const businessHours: any = {}
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  days.forEach((day) => {
    businessHours[day] = { work: [], break: [] }
  })

  supportDetail.supportAvailability.forEach((avail) => {
    const dayKey = weekdayMap[avail.weekDay]
    if (!dayKey) return
    const workSlots: [string, string][] = []
    const breakSlots: [string, string][] = []
    avail.timeSlots.forEach((slot) => {
      const slotPair: [string, string] = [slot.startTime, slot.endTime]
      if (slot.type === "WORK") {
        workSlots.push(slotPair)
      } else if (slot.type === "BREAK") {
        breakSlots.push(slotPair)
      }
    })
    businessHours[dayKey].work = workSlots
    businessHours[dayKey].break = breakSlots
  })

  return {
    businessName: supportDetail.supportBusinessName || "",
    supportEmail: supportDetail.supportEmail || "",
    phone: supportDetail.supportPhone || "",
    address: supportDetail.supportAddress || "",
    googleMap: supportDetail.supportGoogleMap || "",
    businessHours,
    businessDays: supportDetail.supportAvailability.map(
      (avail) => weekdayMap[avail.weekDay]
    ) || ["Mon", "Tue", "Wed", "Thu", "Fri"],
    holidays:
      supportDetail.supportHoliday.map((h) => weekdayMap[h.holiday]) || [],
  }
}

// Transform Business to form data
export const transformBusinessDataForSupportDetail = (business: any) => {
  console.log("transformBusinessDataForSupportDetail:------", business)
  const businessHours: any = {}
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  days.forEach((day) => {
    businessHours[day] = { work: [], break: [] }
  })

  business.businessAvailability.forEach((avail: any) => {
    const dayKey = weekdayMap[avail.weekDay]
    if (!dayKey) return
    const workSlots: [string, string][] = []
    const breakSlots: [string, string][] = []
    avail.timeSlots.forEach((slot: any) => {
      const slotPair: [string, string] = [slot.startTime, slot.endTime]
      if (slot.type === "WORK") {
        workSlots.push(slotPair)
      } else if (slot.type === "BREAK") {
        breakSlots.push(slotPair)
      }
    })
    businessHours[dayKey].work = workSlots
    businessHours[dayKey].break = breakSlots
  })

  // Format address with street, city, country, zipCode
  const addressParts = [
    business.address[0]?.street || "",
    business.address[0]?.city || "",
    business.address[0]?.country || "",
    business.address[0]?.zipCode || "",
  ].filter((part) => part.trim() !== "") // Remove empty parts
  const formattedAddress = addressParts.join(", ")

  return {
    businessName: business.name || "",
    supportEmail: business.email || "",
    phone: business.phone || "",
    address: formattedAddress || "",
    googleMap: business.address[0]?.googleMap || "",
    businessHours,
    businessDays: business.businessAvailability?.map(
      (avail: any) => weekdayMap[avail.weekDay]
    ) || ["Mon", "Tue", "Wed", "Thu", "Fri"],
    holidays: business.holiday?.map((h: any) => weekdayMap[h.holiday]) || [],
  }
}

// Transform form data to PostSupportBusinessDetail
export const transformFormDataForSupportDetail = (
  formData: any
): PostSupportBusinessDetail => {
  const {
    businessName,
    supportEmail,
    phone,
    address,
    googleMap,
    businessHours,
    businessDays,
    holidays,
    businessId,
  } = formData

  const supportAvailability = businessDays.map((day: string) => {
    const hours = businessHours[day] || { work: [], break: [] }
    const timeSlots = [
      ...hours.work.map(([startTime, endTime]: [string, string]) => ({
        type: "WORK" as const,
        startTime,
        endTime,
      })),
      ...hours.break.map(([startTime, endTime]: [string, string]) => ({
        type: "BREAK" as const,
        startTime,
        endTime,
      })),
    ]

    return {
      weekDay: weekdayMap[day] || day,
      type: "SUPPORT" as const,
      timeSlots,
    }
  })

  const supportHoliday = holidays.map((day: string) => ({
    holiday: weekdayMap[day] || day,
    type: "SUPPORT" as const,
    date: "",
  }))

  return {
    supportBusinessName: businessName,
    supportEmail,
    supportPhone: phone,
    supportAddress: address,
    supportGoogleMap: googleMap,
    supportAvailability,
    supportHoliday,
    businessId,
  }
}

export const useSupportTabsStore = create<SupportTabsState>((set) => ({
  activeTab: "Contact Information",
  tabMap: {
    Contact: "Contact Information",
    FAQs: "Frequently Asked Questions (FAQs)",
    Issues: "Customer Support",
    Support: "Admin Support",
  },
  tabs: [
    "Contact Information",
    "Frequently Asked Questions (FAQs)",
    "Customer Support",
    "Admin Support",
  ],
  mTabs: ["Contact", "FAQs", "Issues", "Support"],
  setActiveTab: (tab) => set({ activeTab: tab }),
  handleMobileTabChange: (mobileTab) =>
    set((state) => {
      const mapped = state.tabMap[mobileTab]
      return { activeTab: mapped || state.activeTab }
    }),
  supportDetail: null,
  loading: false,
  error: null,
  setSupportDetail: (detail) => set({ supportDetail: detail, error: null }),
  getSupportBusinessDetailById: async (businessId: string) => {
    set({ loading: true, error: null })
    try {
      const res = await getSupportDetailByBusinessId(businessId)
      console.log("Support detail response:", res)
      if (res.data) {
        set({ supportDetail: res.data, loading: false })
        return { data: res.data, success: true }
      } else {
        set({ supportDetail: null, loading: false })
        return { data: null, success: true }
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch support details",
        loading: false,
      })
      toast.error("Failed to fetch support details")
      return {
        error,
        success: false,
        message: "Failed to fetch support details",
      }
    }
  },

  // FAQs---------
  faqs: [],
  faqLoading: false,
  faqError: null,
  deletingFAQId: null,
  setFAQs: (faqs) => set({ faqs, faqError: null }),
  getFAQs: async () => {
    set({ faqLoading: true, faqError: null })
    try {
      const fetchedFaqs = await getFAQs()
      console.log("Fetched FAQs:", fetchedFaqs)
      set({
        faqs: Array.isArray(fetchedFaqs) ? fetchedFaqs : [],
        faqLoading: false,
        faqError: null,
      })
    } catch (error: any) {
      set({
        faqs: [],
        faqError: error.message || "Failed to fetch FAQs",
        faqLoading: false,
      })
      toast.error("Failed to fetch FAQs")
    }
  },
  createFAQ: async (faqData) => {
    set({ faqLoading: true, faqError: null })
    try {
      const createdFAQ = await createFAQ({ id: "", ...faqData })
      console.log("Created FAQ:", createdFAQ)
      set((state) => ({
        faqs: [createdFAQ, ...state.faqs],
        faqLoading: false,
        faqError: null,
      }))
      toast.success("FAQ created successfully!")
    } catch (error: any) {
      set({
        faqError: error.message || "Failed to create FAQ",
        faqLoading: false,
      })
      toast.error("Failed to create FAQ")
    }
  },
  updateFAQ: async (id, faqData) => {
    set({ faqLoading: true, faqError: null })
    try {
      const updatedFAQ = await updateFAQ(id, faqData)
      console.log("Updated FAQ:", updatedFAQ)
      set((state) => ({
        faqs: state.faqs.map((faq) => (faq.id === id ? updatedFAQ : faq)),
        faqLoading: false,
        faqError: null,
      }))
      toast.success("FAQ updated successfully!")
    } catch (error: any) {
      set({
        faqError: error.message || "Failed to update FAQ",
        faqLoading: false,
      })
      toast.error("Failed to update FAQ")
    }
  },
  deleteFAQ: async (id) => {
    if (id.startsWith("temp-")) {
      set({
        faqError: "Cannot delete FAQ: Still processing creation",
        faqLoading: false,
      })
      toast.error("Cannot delete FAQ: Still processing creation")
      return
    }
    set({ faqLoading: true, faqError: null, deletingFAQId: id })
    let deletedFAQ: FAQ | undefined
    set((state) => {
      deletedFAQ = state.faqs.find((faq) => faq.id === id)
      return {
        faqs: state.faqs.filter((faq) => faq.id !== id),
        faqLoading: true,
        deletingFAQId: id,
      }
    })
    try {
      await deleteFAQ(id)
      console.log("Deleted FAQ ID:", id)
      set({ faqLoading: false, deletingFAQId: null })
      toast.success("FAQ deleted successfully!")
    } catch (error: any) {
      set((state) => ({
        faqs: deletedFAQ ? [deletedFAQ, ...state.faqs] : state.faqs,
        faqError: error.message || "Failed to delete FAQ",
        faqLoading: false,
        deletingFAQId: null,
      }))
      toast.error("Failed to delete FAQ")
    }
  },
  refreshFAQs: async () => {
    set({ faqLoading: true, faqError: null })
    try {
      const fetchedFaqs = await getFAQs()
      console.log("Refreshed FAQs:", fetchedFaqs)
      set({
        faqs: Array.isArray(fetchedFaqs) ? fetchedFaqs : [],
        faqLoading: false,
        faqError: null,
      })
    } catch (error: any) {
      set({
        faqs: [],
        faqError: error.message || "Failed to refresh FAQs",
        faqLoading: false,
      })
      toast.error("Failed to refresh FAQs")
    }
  },
  ticketSubmitted: false,
  ticketLoading: false,
  ticketError: null,

  // Super Admin Ticket --------
  createTicket: async (ticketData) => {
    set({ ticketLoading: true, ticketError: null })
    try {
      const response = await createTicket(ticketData)
      console.log("Created ticket:", response)
      set({ ticketSubmitted: true, ticketLoading: false, ticketError: null })
      toast.success("Ticket created successfully!")
    } catch (error: any) {
      const errorMessage = error.message || "Failed to create ticket"
      set({ ticketError: errorMessage, ticketLoading: false })
      toast.error(`Failed to create ticket: ${errorMessage}`)
    }
  },
  resetTicketState: () => set({ ticketSubmitted: false, ticketError: null }),
}))
