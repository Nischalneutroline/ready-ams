// import { getBaseUrl } from "@/lib/baseUrl"
// import axios from "axios"

// const api = axios.create({
//   baseURL: getBaseUrl(),
//   headers: {
//     "Content-Type": "application/json",
//   },
// })
// console.log(api.defaults.baseURL)
// export interface AppointmentData {
//   id?: string
//   customerName: string
//   email: string
//   phone: string
//   serviceId: string
//   selectedDate: string
//   selectedTime: string
//   message?: string
//   userId?: string
//   isForSelf?: boolean
//   bookedById?: string
//   createdById?: string
//   status?: string
// }

// export async function getAppointments() {
//   try {
//     const { data } = await api.get("/api/appointment")
//     return data
//   } catch (error) {
//     console.error("Error fetching appointments:", error)
//     return []
//   }
// }
