import {
  getBusinessById,
  getBusinesses,
} from "../../../app/(admin)/business-settings/_api-call/business-api-call"

// Set business detail dynamically

export const businessId = "cmbfcqfal0025vdgkgj6d2n0a"

export const business = await getBusinessById(businessId)
console.log(business, "Business Data in Action")

type TimeSlotType = "WORK" | "BREAK"

interface TimeSlot {
  startTime: string // ISO
  endTime: string // ISO
  type: TimeSlotType
}

interface BusinessAvailability {
  weekDay: string // MONDAY, TUESDAY...
  type: string // e.g. "GENERAL"

  timeSlots: TimeSlot[]
}

interface Holiday {
  type: string
  date: string // ISO
  holiday: string
}

interface FormData {
  businessDays: string[] // ["Mon", "Tue", ...]
  businessHours: Record<string, { work: string[][]; break: string[][] }>
  holidays: string[] // ["Sat", "Sun"]
  timeZone: string
}

type Address = {
  street: string
  city: string
  country: string
  zipCode: string
  state: string
  googleMap: string
}

type Business = {
  id: string | null
  name: string
  industry: string
  email: string
  phone: string
  website: string
  businessRegistrationNumber: string
  status: string

  address: Address[]
}

function convertToISO(day: string, time: string): string {
  // Pick any fixed date, adjust to local time
  const baseDate = new Date() // default base
  const daysMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const dayIndex = daysMap.indexOf(day)
  const date = new Date(baseDate)
  date.setDate(baseDate.getDate() + ((dayIndex - baseDate.getDay() + 7) % 7))
  const [hourMin, period] = time.split(" ")
  let [hour, minute] = hourMin.split(":").map(Number)
  if (period === "PM" && hour < 12) hour += 12
  if (period === "AM" && hour === 12) hour = 0
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

// Converting form data into API strucutre
export function transformFormData(
  formData: FormData,
  existingAvailability: BusinessAvailability[],
  businessId: string,
  type: string = "GENERAL"
): {
  businessAvailability: BusinessAvailability[]
  holiday: Holiday[]
} {
  const updatedAvailabilityMap: Record<string, BusinessAvailability> = {}

  // Map for full weekday names
  const dayMap: { [key: string]: string } = {
    Mon: "MONDAY",
    Tue: "TUESDAY",
    Wed: "WEDNESDAY",
    Thu: "THURSDAY",
    Fri: "FRIDAY",
    Sat: "SATURDAY",
    Sun: "SUNDAY",
  }

  // Loop through the business hours and process each day
  for (const [day, { work, break: breaks }] of Object.entries(
    formData.businessHours
  )) {
    const weekDay = dayMap[day] || day.toUpperCase() // Convert to full weekday name

    const timeSlots: TimeSlot[] = []

    // If both work and breaks are empty, skip this day
    if (work.length === 0 && breaks.length === 0) {
      continue
    }

    // Add work time slots
    work.forEach(([start, end]) => {
      timeSlots.push({
        type: "WORK", // Ensure the type is "WORK"
        startTime: convertToISO(weekDay, start),
        endTime: convertToISO(weekDay, end),
      })
    })

    // Add break time slots
    breaks.forEach(([start, end]) => {
      timeSlots.push({
        type: "BREAK", // Ensure the type is "BREAK"
        startTime: convertToISO(weekDay, start),
        endTime: convertToISO(weekDay, end),
      })
    })

    // Create or update the availability for the current weekday
    updatedAvailabilityMap[weekDay] = {
      weekDay,
      type,
      timeSlots: timeSlots.map((slot) => ({
        ...slot,
      })),
    }
  }

  // Create the businessAvailability array by filtering out days with no time slots
  const businessAvailability = Object.values(updatedAvailabilityMap).filter(
    (availability) => availability.timeSlots.length > 0
  )

  // Map holidays to full weekday names and convert them to ISO date
  const holiday = formData.holidays.map((day) => {
    const fullDay = dayMap[day] || day.toUpperCase() // Convert to full weekday name
    return {
      type,
      date: convertToISO(fullDay, "12:00 AM"),
      holiday: fullDay,
    }
  })

  return {
    businessAvailability,
    holiday,
  }
}
// convert the data into the businss setting form format
export function transformBusinessData(dataToEdit: any): Business {
  const timestamp = new Date().toISOString()
  const id = businessId

  return {
    id: id,
    name: dataToEdit.businessName || "",
    industry: dataToEdit.industry || "",
    email: dataToEdit.email || "",
    phone: dataToEdit.phone || "",
    website: dataToEdit.website || "",
    businessRegistrationNumber: dataToEdit.registrationNumber || "",
    status: dataToEdit.visibility || "",
    address: [
      {
        street: dataToEdit.street || "",
        city: dataToEdit.city || "",
        country: dataToEdit.country || "",
        zipCode: dataToEdit.zipCode || "",
        state: dataToEdit.state || "",
        googleMap: dataToEdit.googleMap || "",
      },
    ],
  }
}

// convert the api data into businessAvailability formState data
export function formatBusinessDetails(data: any) {
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const dayMap: Record<string, string> = {
    MONDAY: "Mon",
    TUESDAY: "Tue",
    WEDNESDAY: "Wed",
    THURSDAY: "Thu",
    FRIDAY: "Fri",
    SATURDAY: "Sat",
    SUNDAY: "Sun",
  }

  const businessDays =
    data?.businessAvailability?.map((availability: any) => {
      return dayMap[availability.weekDay]
    }) || []

  const holidays =
    data?.holiday?.map((holiday: any) => {
      return dayMap[holiday.holiday]
    }) || []

  const businessHours: Record<string, { work: string[][]; break: string[][] }> =
    {}

  // Initialize all days with empty work/break arrays
  daysOfWeek?.forEach((day) => {
    businessHours[day] = { work: [], break: [] }
  })

  // Fill businessHours from timeSlots
  data?.businessAvailability?.forEach((availability: any) => {
    const day = dayMap[availability.weekDay]
    if (availability.timeSlots && Array.isArray(availability.timeSlots)) {
      availability.timeSlots.forEach((slot: any) => {
        const startTime = convertTo12HourFormat(slot.startTime)
        const endTime = convertTo12HourFormat(slot.endTime)

        if (slot.type === "WORK") {
          businessHours[day].work.push([startTime, endTime])
        } else if (slot.type === "BREAK") {
          businessHours[day].break.push([startTime, endTime])
        }
      })
    }
  })

  return {
    timeZone: "", // you can fill timezone from data if available
    businessDays,
    holidays,
    availabilityMode: "default", // you can customize this if needed
    businessHours,
  }
}

// Helper function to format time to "hh:mm AM/PM"function convertTo12HourFormat(isoTime: string): string {

function convertTo12HourFormat(isoTime: string): string {
  const date = new Date(isoTime) // Automatically local time

  let hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? "PM" : "AM"

  hours = hours % 12
  hours = hours ? hours : 12

  const paddedHours = hours < 10 ? `0${hours}` : `${hours}`
  const paddedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`

  return `${paddedHours}:${paddedMinutes} ${ampm}`
}
