// import { BusinessAvailability } from "@/features/business-detail/types/types"
// import { Holiday } from "@/features/business-detail/types/types"

// export interface PostSupportBusinessDetail {
//   id?: string
//   supportBusinessName: string
//   supportEmail: string
//   supportPhone: string
//   supportAddress: string
//   supportGoogleMap?: string
//   supportAvailability: BusinessAvailability[] // Separate availability for support
//   supportHoliday: Holiday[] // Separate holidays for support
//   businessId: string
// }

// app/(admin)/support/_types/types.ts
export interface PostSupportBusinessDetail {
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
    date: string | null
  }>
  businessId: string
}
