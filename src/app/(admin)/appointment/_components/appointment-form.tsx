"use client"

import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import InputField from "@/components/custom-form-fields/input-field"
import SelectField from "@/components/custom-form-fields/select-field"
import TextAreaField from "@/components/custom-form-fields/textarea-field"
import PhoneInputField from "@/components/custom-form-fields/phone-field"
import TimePickerField from "@/components/custom-form-fields/time-field"
import { Button } from "@/components/ui/button"
import FormHeader from "@/components/admin/form-header"
import { useRouter, useParams } from "next/navigation"
import DatePickerField from "@/components/custom-form-fields/date-field"
import { Mail, SlidersHorizontal, UserPen } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import {
  isoToNormalTime,
  normalOrFormTimeToIso,
  normalDateToIso,
} from "@/utils/utils"
import { useAppointmentStore } from "@/app/(admin)/appointment/_store/appointment-store"
import { useServiceStore } from "@/app/(admin)/service/_store/service-store"
import LoadingSpinner from "@/components/loading-spinner"
import { PostAppoinmentData } from "../_api-call/appoinment-api-call"
// import { AppointmentStatus } from "../_types/appoinment-response"
import { AppointmentStatus } from "../_types/appoinment"

interface ServiceOption {
  label: string
  value: string
}

// Define the form schema using Zod
const appointmentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  phone: z.string().min(1, "Phone number is required"),
  service: z.string().min(1, "Service is required"),
  date: z.date({ required_error: "Date is required" }), // shadcn Calendar outputs a Date object
  time: z.string().min(1, "Time is required"),
  message: z.string().optional(),
})

type FormData = z.infer<typeof appointmentSchema>

const availableTimeSlots = [
  "09:00 AM",
  "10:00 AM",
  "10:35 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
]

export default function AppointmentForm() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string | undefined
  const isEditMode = !!id

  // Access store methods and router path
  const {
    createAppointment: storeCreateAppointment,
    updateAppointment: storeUpdateAppointment,
    getAppointmentById: storeGetAppointmentById,
    router: appointmentRouter,
  } = useAppointmentStore()

  const {
    services,
    fetchServices,
    loading: isLoadingServices,
    hasFetched: hasFetchedServices,
    serviceOptions: options,
  } = useServiceStore()

  const [isLoadingAppointment, setIsLoadingAppointment] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize react-hook-form with Zod validation
  const form = useForm<FormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      service: "",
      date: undefined,
      time: "",
      message: "",
    },
  })

  // // Fetch services if not already fetched
  // useEffect(() => {
  //   if (!isLoadingServices && !hasFetchedServices) {
  //     fetchServices()
  //   }
  // }, [fetchServices, hasFetchedServices, isLoadingServices])

  // // Transform services into select options
  // const serviceOptions = useMemo<ServiceOption[]>(() => {
  //   if (!Array.isArray(services)) {
  //     console.warn("Services is not an array:", services)
  //     return []
  //   }
  //   return services
  //     .filter((service) => service.status === "ACTIVE")
  //     .map((service) => ({
  //       label: service.title,
  //       value: service.id,
  //     }))
  // }, [services])

  // Fetch services if not already fetched

  let serviceOptions = useMemo(() => options(), [options, services])

  // Fetch appointment data for edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchAppointment = async () => {
        setIsLoadingAppointment(true)
        try {
          const appointment = await storeGetAppointmentById(id)
          if (appointment && appointment.customerName) {
            const date = appointment.selectedDate
            const time = appointment.selectedTime
            const [firstName, ...lastNameParts] = appointment.customerName
              .trim()
              .split(" ")

            form.reset({
              firstName: firstName || "",
              lastName: lastNameParts.join(" ") || "",
              email: appointment.email || "",
              phone: appointment.phone || "",
              service: appointment.serviceId || "",
              date: isNaN(date.getTime()) ? undefined : date,
              time: time || "",
              message: appointment.message || "",
            })
          } else {
            console.warn("Appointment not found for ID:", id)
          }
        } finally {
          setIsLoadingAppointment(false)
        }
      }
      fetchAppointment()
    }
  }, [id, isEditMode, form, storeGetAppointmentById])

  // Handle form submission
  const onSubmit = async (formData: FormData) => {
    console.log("Form data:", formData)
    setIsSubmitting(true)
    try {
      // Transform form data to match PostAppoinmentData
      // Note: shadcn Calendar outputs a Date object for `date`, which is converted to ISO string
      const appointmentData: PostAppoinmentData = {
        customerName: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        serviceId: formData.service,
        selectedDate: formData.date, // Converts Date to ISO string (e.g., "2025-05-06T00:00:00.000Z")
        selectedTime: formData.time, // Converts time to ISO format
        message: formData.message,
        userId: "cmben86we0000vd8gk890533p", // TODO: Replace with dynamic user ID
        isForSelf: false,
        bookedById: "cmben86we0000vd8gk890533p", // TODO: Replace with dynamic bookedById
        createdById: "cmben86we0000vd8gk890533p", // TODO: Replace with dynamic createdById
        status: AppointmentStatus.SCHEDULED, // TODO: Add status dropdown
      }

      // Submit via store (toasts are handled by the store)
      const result =
        isEditMode && id
          ? await storeUpdateAppointment(id, appointmentData)
          : await storeCreateAppointment(appointmentData)

      if (result.success) {
        router.push(appointmentRouter) // Redirect to appointments list
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    router.push(appointmentRouter)
  }

  return (
    <>
      <FormHeader
        title={isEditMode ? "Edit Appointment" : "Enter Appointment Details"}
        description={
          isEditMode
            ? "Update existing appointment details"
            : "View and manage your upcoming appointments"
        }
      />
      {isLoadingAppointment || (isLoadingServices && !hasFetchedServices) ? (
        <div className="flex justify-center items-center py-20 text-muted-foreground">
          {isLoadingAppointment
            ? "Loading appointment..."
            : "Loading services..."}
        </div>
      ) : (
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
            aria-busy={isSubmitting}
          >
            <div className="grid grid-cols-2 gap-4">
              <InputField
                name="firstName"
                label="First Name"
                placeholder="John"
                icon={UserPen}
              />
              <InputField
                name="lastName"
                label="Last Name"
                placeholder="Doe"
                icon={UserPen}
              />
            </div>

            <InputField
              name="email"
              label="Email"
              type="email"
              placeholder="john@example.com"
              icon={Mail}
            />

            <PhoneInputField
              name="phone"
              label="Phone Number"
              placeholder="Enter your number"
            />

            <SelectField
              name="service"
              label="Select a Service"
              options={serviceOptions}
              icon={SlidersHorizontal}
              placeholder={
                isLoadingServices ? "Loading services..." : "Select a service"
              }
              disabled={
                isLoadingServices ||
                (!isLoadingServices && serviceOptions.length === 0)
              }
            />

            {!isLoadingServices &&
              serviceOptions.length === 0 &&
              hasFetchedServices && (
                <p className="text-sm text-muted-foreground text-center">
                  No services currently available.
                </p>
              )}

            <div className="grid grid-cols-2 items-center gap-4">
              <DatePickerField
                name="date"
                label="Appointment Date"
                placeholder="Pick a date"
              />
              <TimePickerField
                name="time"
                label="Appointment Time"
                availableTimeSlots={availableTimeSlots}
              />
            </div>

            <TextAreaField
              name="message"
              label="Additional Notes"
              placeholder="Any special requests?"
            />

            <div className="flex flex-col gap-3 md:flex-row justify-between mt-6">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto hover:opacity-95 active:translate-y-0.5 transition-transform duration-200"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                ← Back
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto hover:opacity-95 active:translate-y-0.5 transition-transform duration-200"
                disabled={
                  isLoadingServices || isLoadingAppointment || isSubmitting
                }
              >
                {isEditMode ? (
                  isSubmitting ? (
                    <LoadingSpinner text="Updating..." />
                  ) : (
                    "Update Appointment"
                  )
                ) : isSubmitting ? (
                  <LoadingSpinner text="Creating..." />
                ) : (
                  "Book Appointment"
                )}
              </Button>
            </div>
          </form>
        </FormProvider>
      )}
    </>
  )
}