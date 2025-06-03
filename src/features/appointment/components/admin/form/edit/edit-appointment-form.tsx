// // app/(admin)/appointment-form.tsx
// "use client"

// import { useForm, FormProvider } from "react-hook-form"
// import InputField from "@/components/custom-form-fields/input-field"
// import SelectField from "@/components/custom-form-fields/select-field"
// import TextAreaField from "@/components/custom-form-fields/textarea-field"
// import PhoneInputField from "@/components/custom-form-fields/phone-field"
// import TimePickerField from "@/components/custom-form-fields/time-field"
// import { Button } from "@/components/ui/button"
// import FormHeader from "@/components/admin/form-header"
// import { useParams, useRouter } from "next/navigation"
// import DatePickerField from "@/components/custom-form-fields/date-field"
// import { Mail, SlidersHorizontal, UserPen } from "lucide-react"
// import { getServices } from "@/features/service/api/api"

// import { useEffect, useState } from "react"
// import { Toaster, toast } from "sonner"
// import { AppointmentStatus } from "@/app/admin/appointment/_types/appoinment"
// import {
//   getAppointmentById,
//   updateAppointment,
// } from "@/app/admin/appointment/_api-call/appoinment-api-call"
// import { Service } from "@/app/admin/service/_types/service"



// interface ServiceOption {
//   label: string
//   value: string
// }

// const statusOptions = [
//   { label: "Scheduled", value: AppointmentStatus.SCHEDULED },
//   { label: "Completed", value: AppointmentStatus.COMPLETED },
//   { label: "Missed", value: AppointmentStatus.MISSED },
//   { label: "Cancelled", value: AppointmentStatus.CANCELLED },
//   { label: "Follow Up", value: AppointmentStatus.FOLLOW_UP },
// ]

// const availableTimeSlots = [
//   "09:00 AM",
//   "10:00 AM",
//   "11:00 AM",
//   "12:00 PM",
//   "01:00 PM",
//   "02:00 PM",
//   "03:00 PM",
//   "04:00 PM",
//   "05:00 PM",
// ]

// function convertToISODateTime(date: Date, time: string) {
//   // Create a new date object from the selected date
//   const selectedDate = new Date(date)

//   // Parse the time string (e.g., "02:00 PM")
//   const [timeStr, meridiem] = time.split(" ")
//   const [hours, minutes] = timeStr.split(":")

//   // Convert to 24-hour format
//   let hour = parseInt(hours)
//   if (meridiem === "PM" && hour !== 12) {
//     hour += 12
//   } else if (meridiem === "AM" && hour === 12) {
//     hour = 0
//   }

//   // Set the time components on the selected date
//   selectedDate.setHours(hour)
//   selectedDate.setMinutes(parseInt(minutes))
//   selectedDate.setSeconds(0)
//   selectedDate.setMilliseconds(0)

//   // Return ISO string
//   return selectedDate.toISOString()
// }

// // Example usage
// const formData = {
//   date: "2025-04-26", // Date in YYYY-MM-DD format
//   time: "12:00 PM", // Time in 12-hour format (12-hour clock with AM/PM)
// }

// export default function EditAppointmentForm() {
//   const router = useRouter()
//   const params = useParams()
//   const id = params.id as string
//   const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([])
//   const [isLoading, setIsLoading] = useState(true)

//   interface FormValues {
//     firstName: string
//     lastName: string
//     email: string
//     phone: string
//     service: string
//     date: Date | null
//     time: string
//     message: string
//     status: AppointmentStatus
//   }

//   const form = useForm<FormValues>({
//     defaultValues: {
//       firstName: "",
//       lastName: "",
//       email: "",
//       phone: "",
//       service: "",
//       date: null,
//       time: "",
//       message: "",
//       status: AppointmentStatus.SCHEDULED,
//     },
//   })

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Load both services and appointment data before resetting form
//         const [services, appointment] = await Promise.all([
//           getServices(),
//           id ? getAppointmentById(id) : null,
//         ])

//         // Set service options
//         const options = services.map((service: Service) => ({
//           label: service.title,
//           value: service.id,
//         }))
//         setServiceOptions(options as ServiceOption[])

//         // If we have an appointment to edit, set the form data
//         if (appointment && services) {
//           const [firstName, lastName] = appointment.data?.customerName
//             .trim()
//             .split(" ")
//           const date = new Date(appointment.selectedDate)
//           const timeDate = new Date(appointment.selectedTime)

//           // Get hours and minutes
//           let hours = timeDate.getHours()
//           const minutes = timeDate.getMinutes()
//           const meridiem = hours >= 12 ? "PM" : "AM"

//           // Convert to 12-hour format
//           hours = hours % 12
//           hours = hours ? hours : 12 // Convert 0 to 12

//           // Format with leading zeros
//           const time = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${meridiem}`

//           // Now that we have both services and appointment data, reset the form
//           form.reset({
//             firstName,
//             lastName,
//             email: appointment.email,
//             phone: appointment.phone,
//             service: appointment.serviceId,
//             date: date,
//             time: time,
//             message: appointment.message || "",
//             status: appointment.status || AppointmentStatus.SCHEDULED,
//           })
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error)
//         // toast.error("Failed to load appointment data")
//       } finally {
//         // toast.success("Successfully updated appointment.")
//         setIsLoading(false)
//       }
//     }

//     fetchData()
//   }, [id, form])

//   const onSubmit = async (formData: FormValues) => {
//     try {
//       const appointmentData: Omit<AppointmentData, "id"> = {
//         customerName: `${formData.firstName} ${formData.lastName}`,
//         email: formData.email,
//         phone: formData.phone,
//         serviceId: formData.service,
//         selectedDate: formData.date?.toISOString() || "",
//         selectedTime: convertToISODateTime(formData.date!, formData.time),
//         message: formData.message,
//         userId: "cm9gu8ms60000vdg0zdnsxb6z",
//         isForSelf: false,
//         bookedById: "cm9gu8ms60000vdg0zdnsxb6z",
//         createdById: "cm9gu8ms60000vdg0zdnsxb6z",
//         status: formData.status,
//       }
//       console.log(appointmentData, "appointmentData")
//       if (!id) {
//         throw new Error("Appointment ID is required for updating")
//       }

//       const response = await updateAppointment(id, AppointmentData)

//       if (response) {
//         toast.success("Appointment updated successfully!")
//         router.push("/appointment")
//       }
//     } catch (error) {
//       console.error("Error updating appointment:", error)
//       toast.error("Failed to update appointment")
//     }
//   }

//   const handleBack = () => {
//     router.push("/appointment")
//   }

//   return (
//     <>
//       <FormHeader
//         title="Enter Appointment Details"
//         description="View and manage your upcoming appointments"
//       />
//       <FormProvider {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 ">
//           <div className="grid grid-cols-2 gap-4">
//             <InputField
//               name="firstName"
//               label="First Name"
//               placeholder="John"
//               icon={UserPen}
//             />
//             <InputField
//               name="lastName"
//               label="Last Name"
//               placeholder="Doe"
//               icon={UserPen}
//             />
//           </div>

//           <InputField
//             name="email"
//             label="Email"
//             type="email"
//             placeholder="john@example.com"
//             icon={Mail}
//           />

//           <PhoneInputField
//             name="phone"
//             label="Phone Number"
//             placeholder="Enter your number"
//           />
//           <div className="grid grid-cols-2 items-center gap-4">
//             <SelectField
//               name="service"
//               label="Select a Service"
//               options={serviceOptions}
//               icon={SlidersHorizontal}
//               placeholder="Select a service"
//             />
//             <SelectField
//               name="status"
//               label="Status"
//               options={statusOptions}
//               icon={SlidersHorizontal}
//             />
//           </div>

//           <div className="grid grid-cols-2 items-center gap-4">
//             <DatePickerField
//               name="date"
//               label="Appointment Date"
//               placeholder="Pick a date"
//             />
//             <TimePickerField
//               name="time"
//               label="Time"
//               availableTimeSlots={availableTimeSlots}
//             />
//           </div>

//           <TextAreaField name="message" label="Message" />

//           <div className="flex flex-col gap-3 md:flex-row justify-between mt-6">
//             <Button
//               type="button"
//               variant="outline"
//               className="w-full sm:w-auto hover:opacity-95 active:translate-y-0.5 transition-transform duration-200"
//               onClick={handleBack}
//             >
//               ← Back
//             </Button>
//             <Button
//               type="submit"
//               className="w-full sm:w-auto hover:opacity-95 active:translate-y-0.5 transition-transform duration-200"
//             >
//               Book Appointment
//             </Button>
//           </div>
//         </form>
//       </FormProvider>
//     </>
//   )
// }
