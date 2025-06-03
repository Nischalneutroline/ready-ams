"use client"

import { useForm, FormProvider } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useState, useCallback, useEffect, useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast, Toaster } from "sonner"
import { Button } from "@/components/ui/button"
import InputField from "@/components/custom-form-fields/input-field"
import TextAreaField from "@/components/custom-form-fields/textarea-field"
import ImageUploadField from "@/components/custom-form-fields/image-upload"
import AvailabilityTabs from "@/components/custom-form-fields/availability-tabs"
import ServiceDaySelector from "@/components/custom-form-fields/serivce/service-day-selector"
import ServiceHoursSelector from "@/components/custom-form-fields/serivce/service-hours-selector"
import ToggleSwitch from "@/components/custom-form-fields/toggle-switch"
import DurationSelect from "@/components/custom-form-fields/duration-select"
import {
  CalendarClock,
  ImageUp,
  ScrollText,
  UserRoundCog,
  Info,
} from "lucide-react"
import ServiceFormSkeleton from "@/features/service/components/skeleton-form"
import { createService, updateService } from "@/features/service/api/api"
import { useBusinessStore } from "@/app/admin/business-settings/_store/business-store"
import Link from "next/link"

// Types
export type WeekDay = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"

export type BusinessAvailability = {
  breaks: Record<WeekDay, [string, string][]>
  holidays: WeekDay[]
}

/**
 * Transforms database business availability and holidays into BusinessAvailability format
 * @param business Business data from database
 * @returns BusinessAvailability object
 */
const transformBusinessAvailability = (business: any): BusinessAvailability => {
  const breaks: Record<WeekDay, [string, string][]> = {
    Mon: [],
    Tue: [],
    Wed: [],
    Thu: [],
    Fri: [],
    Sat: [],
    Sun: [],
  }

  const dayMap: Record<string, WeekDay> = {
    MONDAY: "Mon",
    TUESDAY: "Tue",
    WEDNESDAY: "Wed",
    THURSDAY: "Thu",
    FRIDAY: "Fri",
    SATURDAY: "Sat",
    SUNDAY: "Sun",
  }

  business.businessAvailability?.forEach((avail: any) => {
    const day = dayMap[avail.weekDay]
    if (!day) return
    const dayBreaks: [string, string][] = []
    avail.timeSlots.forEach((slot: any) => {
      if (slot.type === "BREAK") {
        dayBreaks.push([slot.startTime, slot.endTime])
      }
    })
    breaks[day] = dayBreaks
  })

  const holidays: WeekDay[] =
    business.holiday
      ?.map((h: any) => dayMap[h.holiday])
      .filter((day: WeekDay | undefined): day is WeekDay => !!day) || []

  return { breaks, holidays }
}

/**
 * Converts short day to full day for backend
 * @param day Short day (e.g., "Mon")
 * @returns Full day (e.g., "MONDAY")
 */
const toFullDay = (day: WeekDay): string => {
  const map: Record<WeekDay, string> = {
    Mon: "MONDAY",
    Tue: "TUESDAY",
    Wed: "WEDNESDAY",
    Thu: "THURSDAY",
    Fri: "FRIDAY",
    Sat: "SATURDAY",
    Sun: "SUNDAY",
  }
  return map[day]
}

/**
 * Formats availability note
 */
const formatAvailabilityNote = (): string => {
  return "Holidays and break times are set in Business Availability. Update in Business Settings > Business Availability."
}

// Form schema for validation
const formSchema = z.object({
  serviceName: z.string().min(1, "Service name is required"),
  description: z.string().min(1, "Description is required"),
  image: z.any().optional(),
  availabilityMode: z.enum(["default", "custom"]),
  serviceDays: z
    .array(z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]))
    .min(1, "At least one service day is required"),
  serviceHours: z.record(
    z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]),
    z
      .array(z.tuple([z.string(), z.string()]))
      .refine(
        (slots) => slots.every(([start, end]) => start && end),
        "All time slots must have start and end times"
      )
  ),
  isAvailable: z.boolean(),
  duration: z.string().regex(/^\d+$/, "Duration must be a number in minutes"),
})

interface Props {
  serviceDetail?: any // Optional service data for editing
}

/**
 * ServiceForm for creating or updating a service
 */
export default function ServiceForm({ serviceDetail }: Props) {
  const { selectedBusiness, fetchBusinessById, hasFetched, loading, error } =
    useBusinessStore()
  const [fetchAttempted, setFetchAttempted] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const router = useRouter()

  // Determine if in edit mode
  const isEditMode = !!serviceDetail
  const businessId = selectedBusiness?.id

  // Fetch business if not available and we have a business ID
  useEffect(() => {
    if (
      !selectedBusiness &&
      !hasFetched &&
      !loading &&
      !fetchAttempted &&
      businessId
    ) {
      console.log(
        `ServiceForm: Triggering fetchBusinessById for ID: ${businessId}`
      )
      setFetchAttempted(true)
      fetchBusinessById(businessId)
    }
  }, [
    selectedBusiness,
    hasFetched,
    loading,
    fetchAttempted,
    fetchBusinessById,
    businessId,
  ])

  // Transform business availability
  const businessAvailability = useMemo(
    () =>
      selectedBusiness ? transformBusinessAvailability(selectedBusiness) : null,
    [selectedBusiness]
  )

  const days: WeekDay[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  // Dynamically set default serviceDays and serviceHours
  const defaultServiceDays = useMemo(() => {
    if (isEditMode && serviceDetail?.serviceAvailability) {
      const serviceDays = serviceDetail.serviceAvailability
        .map((avail: any) => {
          const dayMap: Record<string, WeekDay> = {
            MONDAY: "Mon",
            TUESDAY: "Tue",
            WEDNESDAY: "Wed",
            THURSDAY: "Thu",
            FRIDAY: "Fri",
            SATURDAY: "Sat",
            SUNDAY: "Sun",
          }
          return dayMap[avail.weekDay]
        })
        .filter((day: WeekDay) => day)
      return serviceDays.length > 0
        ? serviceDays
        : days.filter((day) => !businessAvailability?.holidays.includes(day))
    }
    return businessAvailability
      ? days.filter((day) => !businessAvailability.holidays.includes(day))
      : []
  }, [businessAvailability, isEditMode, serviceDetail])

  const defaultServiceHours = useMemo(() => {
    if (isEditMode && serviceDetail?.serviceAvailability) {
      const serviceHours = days.reduce(
        (acc, day) => {
          const fullDay = toFullDay(day)
          const availability = serviceDetail.serviceAvailability.find(
            (avail: any) => avail.weekDay === fullDay
          )
          if (availability) {
            const timeSlots = availability.timeSlots.map(
              (slot: any) => [slot.startTime, slot.endTime] as [string, string]
            )
            return { ...acc, [day]: timeSlots }
          }
          return { ...acc, [day]: [] }
        },
        {} as Record<WeekDay, [string, string][]>
      )
      return serviceHours
    }
    return businessAvailability
      ? days.reduce(
          (acc, day) => ({
            ...acc,
            [day]: businessAvailability.holidays.includes(day)
              ? []
              : [["09:00 AM", "05:00 PM"]],
          }),
          {} as Record<WeekDay, [string, string][]>
        )
      : {}
  }, [businessAvailability, isEditMode, serviceDetail])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serviceName: isEditMode ? serviceDetail?.title || "" : "",
      description: isEditMode ? serviceDetail?.description || "" : "",
      image: null,
      availabilityMode: "default",
      serviceDays: defaultServiceDays,
      serviceHours: defaultServiceHours,
      isAvailable: isEditMode ? serviceDetail?.status === "ACTIVE" : true,
      duration: isEditMode
        ? serviceDetail?.estimatedDuration?.toString() || ""
        : "",
    },
  })

  // Update form defaults when businessAvailability or serviceDetail changes
  useEffect(() => {
    form.reset({
      serviceName: isEditMode ? serviceDetail?.title || "" : "",
      description: isEditMode ? serviceDetail?.description || "" : "",
      image: null,
      availabilityMode: "default",
      serviceDays: defaultServiceDays,
      serviceHours: defaultServiceHours,
      isAvailable: isEditMode ? serviceDetail?.status === "ACTIVE" : true,
      duration: isEditMode
        ? serviceDetail?.estimatedDuration?.toString() || ""
        : "",
    })
  }, [form, defaultServiceDays, defaultServiceHours, isEditMode, serviceDetail])

  /**
   * Handles form submission
   */
  const onSubmit = useCallback(
    async (data: z.infer<typeof formSchema>) => {
      if (!businessId) {
        toast.error("No business selected", { id: "service-error" })
        return
      }

      try {
        setSubmitLoading(true)
        const serviceData = {
          id: serviceDetail?.id,
          title: data.serviceName,
          description: data.description,
          estimatedDuration: parseInt(data.duration),
          status: data.isAvailable ? "ACTIVE" : "INACTIVE",
          serviceAvailability: data.serviceDays.map((day) => ({
            weekDay: toFullDay(day),
            timeSlots: (data.serviceHours[day] || []).map(
              ([startTime, endTime]) => ({
                startTime,
                endTime,
              })
            ),
          })),
          businessDetailId: businessId,
        }

        console.log("ServiceForm: onSubmit: serviceData =", serviceData)

        if (isEditMode) {
          const { success, message } = await updateService(
            serviceDetail.id,
            serviceData
          )
          if (success) {
            toast.success("Service updated successfully", {
              id: "update-service",
            })
            router.push("/service")
          } else {
            toast.error(message || "Failed to update service", {
              id: "update-service",
            })
          }
        } else {
          const { success, message } = await createService(serviceData)
          if (success) {
            toast.success("Service created successfully", {
              id: "create-service",
            })
            router.push("/service")
          } else {
            toast.error(message || "Failed to create service", {
              id: "create-service",
            })
          }
        }
      } catch (error) {
        let errorMessage = "Failed to process service"
        if (error instanceof Error) {
          errorMessage = error.message
        } else if (typeof error === "object" && error !== null) {
          console.error("ServiceForm: onSubmit: Non-Error object =", error)
          errorMessage =
            error.message || JSON.stringify(error) || "Unknown error"
        }
        console.error("ServiceForm: onSubmit: Error =", error)
        toast.error(errorMessage, {
          id: isEditMode ? "update-service" : "create-service",
        })
      } finally {
        setSubmitLoading(false)
      }
    },
    [router, businessId, isEditMode, serviceDetail]
  )

  const handleBack = useCallback(() => {
    router.push("/service")
  }, [router])

  // Show skeleton during initial load
  if (loading || !hasFetched) {
    return <ServiceFormSkeleton />
  }

  // Show error or no business message
  if (error || !selectedBusiness || !businessAvailability) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6">
        <h2 className="text-3xl font-bold">
          {error ? "Error Loading Business" : "No Business Selected"}
        </h2>
        <p className="text-muted-foreground">
          {error
            ? `An error occurred: ${typeof error === "string" ? error : JSON.stringify(error)}`
            : "Please select or create a business before adding a service."}
        </p>
        <Button asChild>
          <Link href="/business-settings">Business Settings</Link>
        </Button>
      </div>
    )
  }

  return (
    <FormProvider {...form}>
      <Toaster position="top-right" />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          <InputField
            name="serviceName"
            label="Service Name"
            icon={UserRoundCog}
          />
          <TextAreaField
            name="description"
            label="Description"
            icon={ScrollText}
          />
          <ImageUploadField name="image" label="Cover Picture" icon={ImageUp} />
          <AvailabilityTabs name="availabilityMode" icon={CalendarClock} />
          <div className="flex items-start gap-2 rounded-md bg-muted/50 py-2 px-3 text-xs text-muted-foreground max-w-md">
            <Info className="size-4 mt-0.5 flex-shrink-0" />
            <p>{formatAvailabilityNote()}</p>
          </div>
          <ServiceDaySelector
            name="serviceDays"
            businessAvailability={businessAvailability}
          />
          <ServiceHoursSelector
            name="serviceHours"
            businessBreaks={businessAvailability.breaks}
          />
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <ToggleSwitch name="isAvailable" label="Availability" />
            <DurationSelect name="duration" label="Duration:" />
          </div>
        </div>
        <div className="flex flex-col gap-3 md:flex-row justify-between mt-6">
          <Button
            disabled={submitLoading}
            type="button"
            variant="outline"
            className="w-full sm:w-auto hover:opacity-95 active:translate-y-0.5 transition-transform duration-200"
            onClick={handleBack}
          >
            ← Back
          </Button>
          <Button
            disabled={submitLoading || !businessId}
            type="submit"
            className="w-full sm:w-auto hover:opacity-95 active:translate-y-0.5 transition-transform duration-200"
          >
            {submitLoading
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
                ? "Update Service"
                : "Create Service"}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
