import { getBusinessById } from "@/app/(admin)/business-settings/_api-call/business-api-call"
import dayjs from "dayjs"

const weekdayMap: Record<string, string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
  SUNDAY: "Sun",
}

export async function transformBusinessData() {
  const businessId = "cmbfcqfal0025vdgkgj6d2n0a"
  const business = await getBusinessById(businessId)

  if (!business) {
    console.error("Business not found")
    return {} // Return an empty object if business is not found
  }

  console.log("Business Data:", business) // Log the data to check the structure

  const businessHours: Record<
    string,
    { work: [string, string][]; break: [string, string][] }
  > = {}

  const businessDays: string[] = []

  // Safeguard against undefined businessAvailability
  if (business.businessAvailability) {
    business.businessAvailability.forEach((availability: any) => {
      const day = weekdayMap[availability.weekDay]
      const work: [string, string][] = []
      const breakTime: [string, string][] = []

      availability.timeSlots.forEach((slot: any) => {
        const start = dayjs(slot.startTime).format("hh:mm A")
        const end = dayjs(slot.endTime).format("hh:mm A")

        if (slot.type === "WORK") work.push([start, end])
        if (slot.type === "BREAK") breakTime.push([start, end])
      })

      businessHours[day] = {
        work,
        break: breakTime.length ? breakTime : [],
      }

      if (work.length > 0) {
        businessDays.push(day)
      }
    })
  }

  // Safeguard for holidays
  const holidays =
    business?.holiday?.map((h: any) => weekdayMap[h.holiday]) || []

  // Safeguard for address, assuming it could be an array or an object
  const address = business?.address?.[0] || business?.address // Fallback to the address if not an array
  const formattedAddress = `${address?.street || "N/A"}, ${address?.city || "N/A"}, ${address?.country || "N/A"}, ${address?.zipCode || "N/A"}`

  const result = {
    businessName: business?.name || "N/A",
    supportEmail: business?.email || "N/A",
    phone: business?.phone || "N/A",
    address: formattedAddress,
    googleMap: address?.googleMap || "",
    businessHours,
    businessDays,
    holidays,
  }

  return result
}
