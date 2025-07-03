"use client"

import { useForm, FormProvider, useFormContext } from "react-hook-form"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarDays, History, Hourglass, Loader2 } from "lucide-react"
import BusinessHourSelector from "./business-hour-selector"
import AvailabilityTabs from "@/components/custom-form-fields/availability-tabs"
import BusinessDaysField from "@/components/custom-form-fields/business-settings/business-day-field"
import HolidayField from "@/components/custom-form-fields/business-settings/business-holiday-field"
import { toast } from "sonner"
import { timeOptions } from "@/lib/lib"
import {
  transformBusinessDataForForms,
  useBusinessStore,
} from "@/app/(admin)/business-settings/_store/business-store"
import { createBusiness, updateBusiness } from "../_api-call/business-api-call"

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

// Default form values (used as fallback)
const defaultValues = {
  timeZone: "UTC",
  businessDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  holidays: ["Sat", "Sun"],
  availabilityMode: "default",
  businessHours: {
    Mon: {
      work: [["08:00 AM", "08:00 PM"]],
      break: [["12:00 PM", "01:00 PM"]],
    },
    Tue: {
      work: [["09:00 AM", "05:00 PM"]],
      break: [["12:00 PM", "01:00 PM"]],
    },
    Wed: {
      work: [["09:00 AM", "05:00 PM"]],
      break: [["12:00 PM", "01:00 PM"]],
    },
    Thu: {
      work: [["09:00 AM", "05:00 PM"]],
      break: [["12:00 PM", "01:00 PM"]],
    },
    Fri: {
      work: [["09:00 AM", "05:00 PM"]],
      break: [["12:00 PM", "01:00 PM"]],
    },
    Sat: { work: [], break: [] },
    Sun: { work: [], break: [] },
  },
}

// Transform availability data for form
const transformAvailabilityForForm = (availability: any[]) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const businessHours: any = {}
  const validTimes = timeOptions()

  days.forEach((day) => {
    businessHours[day] = { work: [], break: [] }
  })

  availability.forEach((avail) => {
    const dayKey = weekdayMap[avail.weekDay]
    if (!dayKey || !businessHours[dayKey]) {
      console.warn(`Invalid dayKey for weekDay: ${avail.weekDay}`)
      return
    }
    const workSlots: [string, string][] = []
    const breakSlots: [string, string][] = []

    avail.timeSlots.forEach((slot: any) => {
      const startTime = slot.startTime
      const endTime = slot.endTime
      if (!validTimes.includes(startTime) || !validTimes.includes(endTime)) {
        console.warn(`Invalid time slot for ${dayKey}: ${startTime}-${endTime}`)
        return
      }
      const slotPair: [string, string] = [startTime, endTime]
      if (slot.type === "BREAK") {
        breakSlots.push(slotPair)
      } else if (slot.type === "WORK") {
        workSlots.push(slotPair)
      } else {
        console.warn(`Unknown slot type for ${dayKey}: ${slot.type}`)
      }
    })

    const sortByStartTime = (slots: [string, string][]) =>
      slots.sort((a, b) => {
        const timeA = new Date(`1970-01-01 ${a[0]}`)
        const timeB = new Date(`1970-01-01 ${b[0]}`)
        return timeA.getTime() - timeB.getTime()
      })

    businessHours[dayKey].work = sortByStartTime(workSlots)
    businessHours[dayKey].break = sortByStartTime(breakSlots)
  })

  console.log(
    "Transformed businessHours:",
    JSON.stringify(businessHours, null, 2)
  )
  return businessHours
}

// Transform form data to API-compatible format
const transformFormDataForApi = (business: any, availabilityData: any) => {
  console.log("availabilityData:", JSON.stringify(availabilityData, null, 2))
  console.log("business:", JSON.stringify(business, null, 2))
  const { businessDays, holidays, businessHours, timeZone } = availabilityData

  const businessDetail = {
    id: business?.id || undefined,
    name: business?.businessName || "",
    industry: business?.industry || "",
    email: business?.email || "",
    phone: business?.phone || "",
    website: business?.website || "",
    businessRegistrationNumber: business?.registrationNumber || "",
    businessOwner: business?.businessOwner || "cmben86we0000vd8gk890533p",
    status: business?.visibility || "PENDING",
    taxId:  business?.taxId, 
    taxIdFileId: business?.taxIdFileId,            
    logo: business?.logo,
    logoFileId: business?.logoFileId,
    timeZone: timeZone || "UTC",
    address: [
      {
        street: business?.street || "",
        city: business?.city || "",
        state: business?.state || "",
        country: business?.country || "",
        zipCode: business?.zipCode || "",
        googleMap: business?.googleMap || "",
      },
    ],
  }

  const businessAvailability = businessDays.flatMap((day: string) => {
    const hours = businessHours[day] || { work: [], break: [] }
    const slots = [
      ...hours.work.map((slot: [string, string]) => ({
        type: "WORK",
        startTime: slot[0],
        endTime: slot[1],
      })),
      ...hours.break.map((slot: [string, string]) => ({
        type: "BREAK",
        startTime: slot[0],
        endTime: slot[1],
      })),
    ]

    const sortByStartTime = (slots: any[]) =>
      slots.sort((a, b) => {
        const timeA = new Date(`1970-01-01 ${a.startTime}`)
        const timeB = new Date(`1970-01-01 ${b.startTime}`)
        return timeA.getTime() - timeB.getTime()
      })

    return slots.length > 0
      ? [
          {
            weekDay: weekdayMap[day] || day,
            type: "GENERAL",
            timeSlots: sortByStartTime(slots),
          },
        ]
      : []
  })

  const holiday = holidays.map((day: string) => ({
    holiday: weekdayMap[day] || day,
    type: "GENERAL",
    date: "",
  }))

  console.log(
    "API businessAvailability:",
    JSON.stringify(businessAvailability, null, 2)
  )
  return {
    ...businessDetail,
    businessAvailability,
    holiday,
  }
}

interface BusinessSettingsFormProps {
  business?: any
}

export default function BusinessSettingsForm({
  business: propBusiness,
}: BusinessSettingsFormProps) {
  const { businessData } = useBusinessStore()
  const business = businessData || propBusiness
  console.log(
    "BusinessSettingsForm: Incoming business details:",
    JSON.stringify(business, null, 2)
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { setBusinessData, updateSelectedBusiness } = useBusinessStore()

  const formDefaultValues = {
    timeZone: business?.timeZone || defaultValues.timeZone,
    businessDays: business?.businessDays || defaultValues.businessDays,
    holidays: business?.holidays || defaultValues.holidays,
    availabilityMode:
      business?.availabilityMode || defaultValues.availabilityMode,
    businessHours:
      business?.businessHours ||
      (business?.businessAvailability?.length
        ? transformAvailabilityForForm(business.businessAvailability)
        : defaultValues.businessHours),
  }

  console.log(
    "BusinessSettingsForm: Form default values:",
    JSON.stringify(formDefaultValues, null, 2)
  )
  const form = useForm({
    defaultValues: formDefaultValues,
    resolver: async (data) => {
      const errors: any = {}
      if (!data.timeZone) {
        errors.timeZone = { type: "required", message: "Time zone is required" }
      }
      data.businessDays.forEach((day: string) => {
        if (!data.businessHours[day]?.work?.length) {
          errors.businessHours = {
            type: "required",
            message: `At least one work slot is required for ${day}`,
          }
        }
      })
      return {
        values: Object.keys(errors).length ? {} : data,
        errors,
      }
    },
  })

  const {
    watch,
    reset,
    formState: { errors },
  } = form

  // Initialize form only on mount or when business id changes
  useEffect(() => {
    console.log(
      "BusinessSettingsForm: Resetting form with default values:",
      JSON.stringify(formDefaultValues, null, 2)
    )
    reset(formDefaultValues, { keepDefaultValues: false })
  }, [reset, business?.id])

  // Sync form changes to businessData in store
  useEffect(() => {
    const subscription = watch((value) => {
      console.log(
        "BusinessSettingsForm: Form changed:",
        JSON.stringify(value, null, 2)
      )
      setBusinessData({
        ...business,
        timeZone: value.timeZone,
        businessDays: value.businessDays,
        holidays: value.holidays,
        availabilityMode: value.availabilityMode,
        businessAvailability: transformFormDataForApi(business, value)
          .businessAvailability,
        businessHours: value.businessHours,
      })
    })
    return () => subscription.unsubscribe()
  }, [watch, business, setBusinessData])

  const isUpdateMode = !!business?.id

  const onSubmit = async (data: any) => {
    console.log(
      "BusinessSettingsForm: Form data before transformation:",
      JSON.stringify(data, null, 2)
    )

    if (!business?.businessName) {
      toast.error("Please complete business details first.")
      return
    }

    setIsSubmitting(true)
    try {
      const formattedData = transformFormDataForApi(business, data)
      let response
      if (isUpdateMode) {
        console.log(`Calling updateBusiness with id: ${formattedData.id}`)
        response = await updateBusiness(formattedData.id, formattedData)
      } else {
        console.log("Calling createBusiness")
        response = await createBusiness(formattedData)
      }
      console.log(
        "BusinessSettingsForm: API response:",
        JSON.stringify(response, null, 2)
      )

      if (!response) {
        throw new Error("API response is undefined")
      }

      if (response.data) {
        toast.success(
          isUpdateMode
            ? "Business updated successfully!"
            : "Business created successfully!"
        )
        // Update selectedBusiness with API response
        updateSelectedBusiness(response.data)
        // Update businessData in store
        setBusinessData({
          ...business,
          ...transformBusinessDataForForms(response.data),
        })
        console.log(
          "BusinessSettingsForm: Created businessData:",
          JSON.stringify(businessData, null, 2)
        )
        // Reset form with updated data
        const newFormDefaultValues = {
          ...businessData,
          timeZone: data.timeZone,
          businessDays: data.businessDays,
          holidays: data.holidays,
          availabilityMode: data.availabilityMode,
          businessHours: transformAvailabilityForForm(
            formattedData.businessAvailability
          ),
        }
        reset(newFormDefaultValues)
      } else {
        throw new Error(
          response.message ||
            `Failed to ${isUpdateMode ? "update" : "create"} business`
        )
      }
    } catch (error: any) {
      const errorMessage = error.message || "An unexpected error occurred"
      toast.error(
        `An error occurred while ${isUpdateMode ? "updating" : "submitting"} the form: ${errorMessage}`
      )
      console.error(
        `Error ${isUpdateMode ? "updating" : "submitting"} form:`,
        error
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <AvailabilityTabs name="availabilityMode" icon={CalendarDays} />
        <TimeZoneField name="timeZone" error={errors.timeZone?.message} />
        <BusinessDaysField name="businessDays" holidayFieldName="holidays" />
        <BusinessHourSelector name="businessHours" icon={Hourglass} />
        <HolidayField name="holidays" disableFieldName="businessDays" />
        <div className="flex flex-col gap-4">
          <Button
            type="submit"
            className="bg-blue-500 text-white w-full flex items-center justify-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Submitting...
              </>
            ) : isUpdateMode ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() =>
              toast.info("Save and exit clicked. Data not persisted.")
            }
          >
            Save and Exit
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

const TimeZoneField = ({ name, error }: { name: string; error?: string }) => {
  const { watch, setValue } = useFormContext()
  const value = watch(name)
  return (
    <div className="space-y-1">
      <div className="flex gap-2 items-center">
        <History className="size-4 text-gray-500" />
        <Label>Time Zone</Label>
      </div>
      <Select
        value={value}
        onValueChange={(val) => setValue(name, val, { shouldValidate: true })}
      >
        <SelectTrigger className={`w-full ${error ? "border-red-500" : ""}`}>
          <SelectValue placeholder="Select Time Zone" />
        </SelectTrigger>
        <SelectContent>
          {[
            "UTC",
            "GMT",
            "Asia/Kathmandu",
            "America/New_York",
            "Europe/London",
          ].map((zone) => (
            <SelectItem key={zone} value={zone}>
              {zone}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}
