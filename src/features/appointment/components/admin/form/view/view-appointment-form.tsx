// // app/(admin)/appointment-form.tsx
// "use client";

// import { useForm, FormProvider } from "react-hook-form";
// import InputField from "@/components/custom-form-fields/input-field";
// import SelectField from "@/components/custom-form-fields/select-field";
// import TextAreaField from "@/components/custom-form-fields/textarea-field";
// import PhoneInputField from "@/components/custom-form-fields/phone-field";
// import TimePickerField from "@/components/custom-form-fields/time-field";
// import { Button } from "@/components/ui/button";
// import FormHeader from "@/components/admin/form-header";
// import { useParams, useRouter } from "next/navigation";
// import DatePickerField from "@/components/custom-form-fields/date-field";
// import { Mail, SlidersHorizontal, UserPen } from "lucide-react";
// import { getServices } from "@/features/service/api/api";

// import { useEffect, useState } from "react";
// import { Toaster, toast } from "sonner";
// import { getAppointmentById } from "@/db/appointment";
// import { AppointmentStatus, Service } from "@prisma/client";

// interface ServiceOption {
//   label: string;
//   value: string;
// }

// const statusOptions = [
//   { label: "Scheduled", value: AppointmentStatus.SCHEDULED },
//   { label: "Completed", value: AppointmentStatus.COMPLETED },
//   { label: "Missed", value: AppointmentStatus.MISSED },
//   { label: "Cancelled", value: AppointmentStatus.CANCELLED },
//   { label: "Follow Up", value: AppointmentStatus.FOLLOW_UP },
// ];

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
// ];

// function convertToISODateTime(date: Date, time: string) {
//   // Create a new date object from the selected date
//   const selectedDate = new Date(date);

//   // Parse the time string (e.g., "02:00 PM")
//   const [timeStr, meridiem] = time.split(" ");
//   const [hours, minutes] = timeStr.split(":");

//   // Convert to 24-hour format
//   let hour = parseInt(hours);
//   if (meridiem === "PM" && hour !== 12) {
//     hour += 12;
//   } else if (meridiem === "AM" && hour === 12) {
//     hour = 0;
//   }

//   // Set the time components on the selected date
//   selectedDate.setHours(hour);
//   selectedDate.setMinutes(parseInt(minutes));
//   selectedDate.setSeconds(0);
//   selectedDate.setMilliseconds(0);

//   // Return ISO string
//   return selectedDate.toISOString();
// }

// // Example usage
// const formData = {
//   date: "2025-04-26", // Date in YYYY-MM-DD format
//   time: "12:00 PM", // Time in 12-hour format (12-hour clock with AM/PM)
// };

// export default function ViewAppointmentForm() {
//   const router = useRouter();
//   const params = useParams();
//   const id = params.id as string;
//   const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   interface FormValues {
//     firstName: string;
//     lastName: string;
//     email: string;
//     phone: string;
//     service: string;
//     date: Date | null;
//     time: string;
//     message: string;
//     status: AppointmentStatus;
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
//   });

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch services
//         const servicesResponse = await getServices();
//         if (servicesResponse.success && servicesResponse.data) {
//           const options = servicesResponse.data.map((service: Service) => ({
//             label: service.title,
//             value: service.id,
//           }));
//           setServiceOptions(options);
//         } else {
//           console.error("Failed to fetch services:", servicesResponse.message);
//           toast.error(servicesResponse.message || "Failed to load services");
//         }

//         // Fetch appointment if ID exists
//         if (id) {
//           const appointmentResponse = await getAppointmentById(id);
//           if (appointmentResponse) {
//             const appointment = appointmentResponse;
//             const [firstName, lastName] = appointment.customerName.split(" ");
//             const date = new Date(appointment.selectedDate);
//             const timeDate = new Date(appointment.selectedTime);
//             console.log("Original selectedTime:", appointment.selectedTime);

//             // Get hours and minutes
//             let hours = timeDate.getHours();
//             const minutes = timeDate.getMinutes();
//             const meridiem = hours >= 12 ? "PM" : "AM";

//             // Convert to 12-hour format
//             hours = hours % 12;
//             hours = hours ? hours : 12; // Convert 0 to 12

//             // Format with leading zeros
//             const time = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${meridiem}`;
//             console.log("Available time slots:", availableTimeSlots);
//             console.log("Formatted time for form:", time);
//             form.reset({
//               firstName,
//               lastName,
//               email: appointment.email,
//               phone: appointment.phone,
//               service: appointment.serviceId,
//               date: date,
//               time: time,
//               message: appointment.message || "",
//               status: appointment.status || AppointmentStatus.SCHEDULED,
//             });
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         toast.error("Failed to load appointment data");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, [id, form]);

//   const handleBack = () => {
//     router.push("/appointment");
//   };

//   return (
//     <>
//       {/* <Toaster position="top-center" /> */}
//       <FormHeader
//         title="View Appointment"
//         description="View appointment details"
//       />
//       <FormProvider {...form}>
//         <form className="space-y-5">
//           <div className="grid grid-cols-2 gap-4">
//             <InputField
//               name="firstName"
//               label="First Name"
//               placeholder="John"
//               icon={UserPen}
//               disabled
//             />
//             <InputField
//               name="lastName"
//               label="Last Name"
//               placeholder="Doe"
//               disabled
//               icon={UserPen}
//             />
//           </div>

//           <InputField
//             name="email"
//             label="Email"
//             type="email"
//             placeholder="john@example.com"
//             icon={Mail}
//             disabled
//           />

//           <PhoneInputField
//             name="phone"
//             label="Phone Number"
//             placeholder="Enter your number"
//             icon={UserPen}
//             disabled
//           />
//           <div className="grid grid-cols-2 items-center gap-4">
//             <SelectField
//               name="service"
//               label="Select a Service"
//               options={serviceOptions}
//               icon={SlidersHorizontal}
//               placeholder="Select a service"
//               disabled
//             />
//             <SelectField
//               name="status"
//               label="Status"
//               options={statusOptions}
//               icon={SlidersHorizontal}
//               disabled
//             />
//           </div>

//           <div className="grid grid-cols-2 items-center gap-4">
//             <DatePickerField
//               name="date"
//               label="Appointment Date"
//               placeholder="Pick a date"
//               disabled
//             />
//             <TimePickerField
//               name="time"
//               label="Time"
//               availableTimeSlots={availableTimeSlots}
//               disabled
//             />
//           </div>

//           <TextAreaField name="message" label="Message" disabled />

//           <div className="flex flex-col gap-3 md:flex-row justify-between mt-6">
//             <Button
//               type="button"
//               variant="outline"
//               className="w-full sm:w-auto hover:opacity-95 active:translate-y-0.5 transition-transform duration-200"
//               onClick={handleBack}
//             >
//               ← Back
//             </Button>
//           </div>
//         </form>
//       </FormProvider>
//     </>
//   );
// }
