// "use client"

// import { useEffect, useState } from "react"
// import { useForm, FormProvider } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { z } from "zod"
// import { Button } from "@/components/ui/button"
// import InputField from "@/components/custom-form-fields/input-field"
// import SelectField from "@/components/custom-form-fields/select-field"
// import {
//   User,
//   Mail,
//   UserCheck,
//   Lock,
//   Eye,
//   EyeOff,
//   ShieldCheck,
//   ShieldAlert,
// } from "lucide-react"
// import PhoneField from "@/components/custom-form-fields/phone-field"
// import {
//   Customer,
//   getCoustomersById,
//   getCustomers,
//   updateCustomer,
// } from "@/features/customer/api/api"
// import { toast, Toaster } from "sonner"
// import { useParams, useRouter } from "next/navigation"
// import ToggleSwitch from "@/components/custom-form-fields/toggle-switch"

// type FormData = {
//   fullName: string
//   email: string
//   phone: string
//   role: string
//   password: string
//   isActive: boolean
// }

// interface CustomerFormProps {
//   onSubmit: (data: FormData) => void
// }

// // Validation schema for create mode
// const createSchema = z.object({
//   fullName: z.string().min(1, "Full name is required"),
//   email: z.string().email("Invalid email address").min(1, "Email is required"),
//   phone: z.string().min(1, "Phone number is required"),
//   role: z.string().min(1, "Role is required"),
//   password: z.string().min(1, "Password is required"),
//   isActive: z.boolean(),
// })

// const roleOptions = [
//   { value: "USER", label: "Customer" },
//   { value: "ADMIN", label: "Admin" },
//   { value: "STAFF", label: "Staff" },
// ]

// const ViewCustomerForm = () => {
//   const router = useRouter()
//   const params = useParams()
//   const id = params.id as string
//   const [showPassword, setShowPassword] = useState(false)
//   const [isLoading, setIsLoading] = useState(true)

//   // Initialize form with create schema
//   const form = useForm<FormData>({
//     resolver: zodResolver(createSchema),
//     defaultValues: {
//       fullName: "",
//       email: "",
//       phone: "95129871987391",
//       role: "",
//       password: "",
//       isActive: false,
//     },
//   })
//   // fetch the cusotmer data
//   useEffect(() => {
//     const fetchCustomer = async () => {
//       try {
//         const customer = await getCoustomersById(id)
//         // Ensure role is in uppercase and matches our options
//         const validRole = customer.role?.toUpperCase()
//         const isValidRole = roleOptions.some((opt) => opt.value === validRole)

//         if (!isValidRole) {
//           console.error("Invalid role received:", customer.role)
//           toast.error("Invalid role received from server")
//           return
//         }

//         form.reset({
//           fullName: customer.name,
//           email: customer.email,
//           phone: customer.phone,
//           role: validRole,
//           password: customer.password,
//           isActive: customer.isActive,
//         })
//       } catch (error) {
//         console.error("Error fetching data:", error)
//         toast.error("Failed to load appointment data")
//       } finally {
//         setIsLoading(false)
//       }
//     }
//     fetchCustomer()
//   }, [])

//   // Handle form submission
//   const onSubmit = async (formData: FormData) => {
//     try {
//       const customerData: Omit<Customer, "id"> = {
//         name: formData.fullName,
//         email: formData.email,
//         phone: formData.phone,
//         role: formData.role,
//         password: formData.password,
//         isActive: formData.isActive,
//       }
//       console.log(customerData, "appointmentData")
//       if (!id) {
//         throw new Error("Appointment ID is required for updating")
//       }

//       const response = await updateCustomer(id, customerData)

//       if (response) {
//         toast.success("Customer updated successfully!")
//         router.push("/customer")
//       }
//     } catch (error) {
//       console.error("Error updating customer:", error)
//       toast.error("Failed to update customer")
//     }
//   }

//   const handleBack = () => {
//     router.push("/customer")
//   }

//   return (
//     <>
//       {/* <Toaster position="top-center" /> */}
//       <FormProvider {...form}>
//         <form
//           onSubmit={form.handleSubmit(onSubmit)}
//           className="space-y-6 h-full"
//         >
//           <div className="space-y-4">
//             <InputField
//               name="fullName"
//               label="Full Name"
//               placeholder="Enter Service Name"
//               icon={User}
//               disabled
//             />
//             <InputField
//               name="email"
//               label="Email"
//               type="email"
//               placeholder="Enter Email Address"
//               icon={Mail}
//               disabled
//             />
//             <PhoneField name="phone" label="Phone" disabled />

//             <SelectField
//               name="role"
//               label="Role"
//               placeholder="Select a Role"
//               options={roleOptions}
//               icon={UserCheck}
//               disabled
//             />
//             <ToggleSwitch
//               name="isActive"
//               label="Active"
//               icon={<ShieldAlert className="size-4 text-gray-500" />}
//               disabled
//             />

//             <div className="relative">
//               <InputField
//                 name="password"
//                 label="Password"
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Enter Password"
//                 icon={Lock}
//                 disabled
//               />
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="sm"
//                 className="absolute right-1 top-6 rounded-full"
//                 onClick={() => setShowPassword(!showPassword)}
//                 aria-label={showPassword ? "Hide password" : "Show password"}
//               >
//                 {showPassword ? (
//                   <EyeOff className="size-4 text-gray-500" />
//                 ) : (
//                   <Eye className="size-4 text-gray-500" />
//                 )}
//               </Button>
//             </div>
//           </div>

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
//   )
// }

// export default ViewCustomerForm
