// "use client"

// import { useForm, FormProvider, useFieldArray } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { z } from "zod"
// import { Button } from "@/components/ui/button"
// import InputField from "@/components/custom-form-fields/input-field"
// import SelectField from "@/components/custom-form-fields/select-field"
// import {
//   Building2,
//   Briefcase,
//   Mail,
//   Phone,
//   Globe,
//   MapPin,
//   Map,
//   FileText,
//   Upload,
//   Image,
//   Eye,
//   LocateFixed,
//   MapPinHouse,
//   Pin,
//   MapPinned,
// } from "lucide-react"
// import FileUploadField from "@/components/custom-form-fields/image-upload"
// import { useEffect, useState } from "react"
// import {
//   business,
//   businessId,
//   transformBusinessData,
//   transformFormData,
// } from "../action/action"
// import { getBusinessById } from "../api/api"

// const industryOptions = [
//   { label: "Salon & Spa", value: "Salon & Spa" },
//   { label: "Medical & Health", value: "Medical & Health" },
//   { label: "Automotive Services", value: "Automotive Services" },
//   { label: "Home Repair & Maintenance", value: "Home Repair & Maintenance" },
//   { label: "Fitness & Wellness", value: "Fitness & Wellness" },
//   { label: "Education & Training", value: "Education & Training" },
//   { label: "Legal & Consulting", value: "Legal & Consulting" },
//   { label: "IT Services", value: "IT Services" },
// ]

// const visibilityOptions = [
//   { label: "Active", value: "ACTIVE" },
//   { label: "Inactive", value: "INACTIVE" },
//   { label: "Pending", value: "PENDING" },
//   { label: "Suspended", value: "SUSPENDED" },
// ]

// const addressSchema = z.object({
//   city: z.string().min(1, "City is required"),
//   street: z.string().min(1, "Street is required"),
//   state: z.string().min(1, "State is required"),
//   zipCode: z.string().min(1, "ZIP code is required"),
//   country: z.string().min(1, "Country is required"),
//   googleMap: z.string().optional(),
// })

// const schema = z.object({
//   businessName: z.string().min(1, "Business name is required"),
//   industry: z.string().min(1, "Industry selection is required"),
//   email: z.string().email("Invalid email address").min(1, "Email is required"),
//   phone: z.string().min(1, "Phone number is required"),
//   website: z.string().optional(),
//   city: z.string().min(1, "City is required"),
//   street: z.string().min(1, "Street is required"),
//   state: z.string().min(1, "State is required").optional(),
//   zipCode: z.string().min(1, "ZIP code is required"),
//   country: z.string().min(1, "Country is required"),
//   googleMap: z.string().optional(),
//   registrationNumber: z
//     .string()
//     .min(1, "Business registration number is required"),
//   taxId: z.any().optional(),
//   logo: z.any().refine((file) => file !== null, "Business logo is required"),
//   visibility: z.string().min(1, "Visibility selection is required"),
//   // This allows an array of address objects
// })

// interface BusinessDetailFormProps {
//   setActiveTab: (tabName: string) => void
//   setBusinessData: (businessData: any) => void
// }

// const BusinessDetailForm = ({
//   setActiveTab,
//   setBusinessData,
// }: BusinessDetailFormProps) => {
//   const [isLoading, setIsLoading] = useState(true)
//   const [addressLength, setaddressLength] = useState(0)
//   const form = useForm({
//     defaultValues: {
//       businessName: "",
//       industry: "",
//       email: "",
//       phone: "",
//       website: "",
//       city: "",
//       street: "",
//       state: "",
//       zipCode: "",
//       country: "",
//       googleMap: "",
//       registrationNumber: "",
//       taxId: null,
//       logo: null,
//       visibility: "",
//     },
//     resolver: zodResolver(schema),
//   })
//   const { control, reset } = form

//   // Inside your useEffect where you fetch data
//   useEffect(() => {
//     const fetchBusinessDetails = async () => {
//       try {
//         const business = await getBusinessById(businessId)
//         const dataToEdit = business

//         // Prepare addresses data - ensure it's an array with at least one item
//         const addresses =
//           dataToEdit?.addresses && dataToEdit?.addresses.length > 0
//             ? dataToEdit.addresses
//             : [
//                 {
//                   city: "",
//                   street: "",
//                   state: "",
//                   zipCode: "",
//                   country: "",
//                   googleMap: "",
//                 },
//               ]

//         // Reset the form with all data, including addresses
//         form.reset({
//           businessName: dataToEdit?.name || "",
//           industry: dataToEdit?.industry || "",
//           phone: dataToEdit?.phone || "",
//           email: dataToEdit?.email || "",
//           website: dataToEdit?.website || "",
//           registrationNumber: dataToEdit?.businessRegistrationNumber || "",
//           taxId: dataToEdit?.taxId || null,
//           logo: dataToEdit?.logo || null,
//           visibility: dataToEdit?.status || "",
//           country: dataToEdit?.address?.[0]?.country || "",
//           city: dataToEdit?.address?.[0]?.city || "",
//           street: dataToEdit?.address?.[0]?.street || "",
//           state: dataToEdit?.address?.[0]?.state || "",
//           zipCode: dataToEdit?.address?.[0]?.zipCode || "",
//           googleMap: dataToEdit?.address?.[0]?.googleMap || "",
//         })

//         // Optional: Update some state to track number of addresses
//         setaddressLength(addresses.length)
//       } catch (error) {
//         console.error("Error fetching data:", error)
//         // toast.error("Failed to load business data");
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     fetchBusinessDetails()
//   }, [])

//   const onSubmit = (data: any) => {
//     const updatedData = transformBusinessData(data)
//     const businessUpadtedData = { ...business, ...updatedData }
//     console.log("Business Detail Form submitted:", businessUpadtedData)
//     setBusinessData(businessUpadtedData)
//     setActiveTab("Business Availability")
//   }

//   const onSaveAndExit = () => {
//     console.log("Save and exit clicked")
//   }

//   return (
//     <FormProvider {...form}>
//       <form
//         onSubmit={form.handleSubmit(onSubmit, (errors) =>
//           console.log("Form errors", errors)
//         )}
//         className="space-y-8"
//       >
//         {/* Business Information */}
//         <div className="space-y-4">
//           <h3 className="text-lg font-semibold">Business Information</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <InputField
//               name="businessName"
//               label="Business Name"
//               placeholder="Enter your business name"
//               icon={Building2}
//             />
//             <SelectField
//               name="industry"
//               label="Industry/Category"
//               placeholder="Select Industry Type"
//               options={industryOptions}
//               icon={Briefcase}
//             />
//             <InputField
//               name="email"
//               label="Email"
//               type="email"
//               placeholder="Enter business email address"
//               icon={Mail}
//             />
//             <InputField
//               name="phone"
//               label="Phone Number"
//               type="tel"
//               placeholder="Enter your phone"
//               icon={Phone}
//             />
//             <InputField
//               name="website"
//               label="Website"
//               type="url"
//               placeholder="Your business website URL"
//               icon={Globe}
//               className="md:col-span-2"
//             />
//           </div>
//         </div>

//         {/* Business Address */}
//         <div className="space-y-4">
//           <h3 className="text-lg font-semibold">Business Address</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <InputField
//               name="city"
//               label="City"
//               placeholder="Enter city"
//               icon={MapPinHouse}
//             />
//             <InputField
//               name="street"
//               label="Street"
//               placeholder="Enter street"
//               icon={LocateFixed}
//             />
//             <InputField
//               name="state"
//               label="State"
//               placeholder="Enter State"
//               icon={MapPinned}
//             />
//             <InputField
//               name="zipCode"
//               label="ZIP Code"
//               placeholder="Enter ZIP code"
//               icon={Pin}
//             />
//             <InputField
//               name="country"
//               label="Country"
//               placeholder="Enter Country"
//               icon={MapPin}
//             />
//             <InputField
//               name="googleMap"
//               label="Google Map"
//               type="url"
//               placeholder="Enter google map url"
//               icon={Map}
//             />
//           </div>
//         </div>

//         {/* Legal & Compliance */}
//         <div className="space-y-4">
//           <h3 className="text-lg font-semibold">Legal & Compliance</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <InputField
//               name="registrationNumber"
//               label="Business Registration Number"
//               placeholder="Enter Business Registration Number"
//               icon={FileText}
//             />
//             <FileUploadField
//               name="taxId"
//               label="Tax ID / EIN / PAN"
//               placeholder="Upload Tax ID / EIN / PAN document"
//               icon={Upload}
//             />
//           </div>
//         </div>

//         {/* Branding & Visibility */}
//         <div className="space-y-4">
//           <h3 className="text-lg font-semibold">Branding & Visibility</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <FileUploadField
//               name="logo"
//               label="Logo / Business Image"
//               placeholder="Upload Business Logo"
//               icon={Image}
//             />
//             <SelectField
//               name="visibility"
//               label="Visibility (Public/Private)"
//               placeholder="Select Visibility"
//               options={visibilityOptions}
//               icon={Eye}
//             />
//           </div>
//         </div>

//         {/* Buttons */}
//         <div className="flex flex-col md:flex-row gap-4">
//           <Button
//             type="submit"
//             className="w-full bg-blue-600 hover:bg-blue-700"
//           >
//             Proceed
//           </Button>
//           <Button
//             type="button"
//             variant="outline"
//             className="w-full border-gray-400 text-gray-700 hover:bg-gray-100"
//             onClick={onSaveAndExit}
//           >
//             Save and exit
//           </Button>
//         </div>
//       </form>
//     </FormProvider>
//   )
// }

// export default BusinessDetailForm

// "use client"

// import { useForm, FormProvider } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { z } from "zod"
// import { Button } from "@/components/ui/button"
// import InputField from "@/components/custom-form-fields/input-field"
// import SelectField from "@/components/custom-form-fields/select-field"
// import {
//   Building2,
//   Briefcase,
//   Mail,
//   Phone,
//   Globe,
//   MapPin,
//   Map,
//   FileText,
//   Upload,
//   Image,
//   Eye,
//   LocateFixed,
//   MapPinHouse,
//   Pin,
//   MapPinned,
// } from "lucide-react"
// import FileUploadField from "@/components/custom-form-fields/image-upload"
// import { toast } from "sonner"

// // Mock transformBusinessData function (replace with actual implementation)
// export const transformBusinessData = (data: any) => {
//   return {
//     businessName: data.businessName,
//     industry: data.industry,
//     email: data.email,
//     phone: data.phone,
//     website: data.website,
//     city: data.city,
//     street: data.street,
//     state: data.state,
//     zipCode: data.zipCode,
//     country: data.country,
//     googleMap: data.googleMap,
//     registrationNumber: data.registrationNumber,
//     taxId: data.taxId, // File reference or URL
//     logo: data.logo, // File reference or URL
//     visibility: data.visibility,
//   }
// }

// const industryOptions = [
//   { label: "Salon & Spa", value: "Salon & Spa" },
//   { label: "Medical & Health", value: "Medical & Health" },
//   { label: "Automotive Services", value: "Automotive Services" },
//   { label: "Home Repair & Maintenance", value: "Home Repair & Maintenance" },
//   { label: "Fitness & Wellness", value: "Fitness & Wellness" },
//   { label: "Education & Training", value: "Education & Training" },
//   { label: "Legal & Consulting", value: "Legal & Consulting" },
//   { label: "IT Services", value: "IT Services" },
// ]

// const visibilityOptions = [
//   { label: "Active", value: "ACTIVE" },
//   { label: "Inactive", value: "INACTIVE" },
//   { label: "Pending", value: "PENDING" },
//   { label: "Suspended", value: "SUSPENDED" },
// ]

// const schema = z.object({
//   businessName: z.string().min(1, "Business name is required"),
//   industry: z.string().min(1, "Industry selection is required"),
//   email: z.string().email("Invalid email address").min(1, "Email is required"),
//   phone: z.string().min(1, "Phone number is required"),
//   website: z.string().optional(),
//   city: z.string().min(1, "City is required"),
//   street: z.string().min(1, "Street is required"),
//   state: z.string().min(1, "State is required").optional(),
//   zipCode: z.string().min(1, "ZIP code is required"),
//   country: z.string().min(1, "Country is required"),
//   googleMap: z.string().optional(),
//   registrationNumber: z
//     .string()
//     .min(1, "Business registration number is required"),
//   taxId: z.any().optional(),
//   logo: z
//     .any()
//     // .refine((file) => file !== null, "Business logo is required")
//     .optional(),
//   visibility: z.string().min(1, "Visibility selection is required"),
// })

// interface BusinessDetailFormProps {
//   setActiveTab: (tabName: string) => void
//   setBusinessData: (businessData: any) => void
//   businessData?: any
// }

// const BusinessDetailForm = ({
//   setActiveTab,
//   setBusinessData,
//   businessData,
// }: BusinessDetailFormProps) => {
//   const form = useForm({
//     defaultValues: {
//       businessName: businessData?.businessName || "",
//       industry: businessData?.industry || "",
//       email: businessData?.email || "",
//       phone: businessData?.phone || "",
//       website: businessData?.website || "",
//       city: businessData?.city || "",
//       street: businessData?.street || "",
//       state: businessData?.state || "",
//       zipCode: businessData?.zipCode || "",
//       country: businessData?.country || "",
//       googleMap: businessData?.googleMap || "",
//       registrationNumber: businessData?.registrationNumber || "",
//       taxId: businessData?.taxId || null,
//       logo: businessData?.logo || null,
//       visibility: businessData?.visibility || "",
//     },
//     resolver: zodResolver(schema),
//   })

//   const onSubmit = (data: any) => {
//     const updatedData = transformBusinessData(data)
//     setBusinessData(updatedData)
//     setActiveTab("Business hour & Availability")
//     toast.success("Business details saved! Proceed to set availability.")
//   }

//   const onSaveAndExit = () => {
//     toast.info("Save and exit clicked. Data not persisted.")
//     // Optionally, save to local storage or API
//   }

//   return (
//     <FormProvider {...form}>
//       <form
//         onSubmit={form.handleSubmit(onSubmit, (errors) => {
//           console.log("Form errors", errors)
//           toast.error("Please fix the form errors before proceeding.")
//         })}
//         className="space-y-8"
//       >
//         {/* Business Information */}
//         <div className="space-y-4">
//           <h3 className="text-lg font-semibold">Business Information</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <InputField
//               name="businessName"
//               label="Business Name"
//               placeholder="Enter your business name"
//               icon={Building2}
//             />
//             <SelectField
//               name="industry"
//               label="Industry/Category"
//               placeholder="Select Industry Type"
//               options={industryOptions}
//               icon={Briefcase}
//             />
//             <InputField
//               name="email"
//               label="Email"
//               type="email"
//               placeholder="Enter business email address"
//               icon={Mail}
//             />
//             <InputField
//               name="phone"
//               label="Phone Number"
//               type="tel"
//               placeholder="Enter your phone"
//               icon={Phone}
//             />
//             <InputField
//               name="website"
//               label="Website"
//               type="url"
//               placeholder="Your business website URL"
//               icon={Globe}
//               className="md:col-span-2"
//             />
//           </div>
//         </div>

//         {/* Business Address */}
//         <div className="space-y-4">
//           <h3 className="text-lg font-semibold">Business Address</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <InputField
//               name="city"
//               label="City"
//               placeholder="Enter city"
//               icon={MapPinHouse}
//             />
//             <InputField
//               name="street"
//               label="Street"
//               placeholder="Enter street"
//               icon={LocateFixed}
//             />
//             <InputField
//               name="state"
//               label="State"
//               placeholder="Enter State"
//               icon={MapPinned}
//             />
//             <InputField
//               name="zipCode"
//               label="ZIP Code"
//               placeholder="Enter ZIP code"
//               icon={Pin}
//             />
//             <InputField
//               name="country"
//               label="Country"
//               placeholder="Enter Country"
//               icon={MapPin}
//             />
//             <InputField
//               name="googleMap"
//               label="Google Map"
//               type="url"
//               placeholder="Enter google map url"
//               icon={Map}
//             />
//           </div>
//         </div>

//         {/* Legal & Compliance */}
//         <div className="space-y-4">
//           <h3 className="text-lg font-semibold">Legal & Compliance</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <InputField
//               name="registrationNumber"
//               label="Business Registration Number"
//               placeholder="Enter Business Registration Number"
//               icon={FileText}
//             />
//             <FileUploadField
//               name="taxId"
//               label="Tax ID / EIN / PAN"
//               placeholder="Upload Tax ID / EIN / PAN document"
//               icon={Upload}
//             />
//           </div>
//         </div>

//         {/* Branding & Visibility */}
//         <div className="space-y-4">
//           <h3 className="text-lg font-semibold">Branding & Visibility</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <FileUploadField
//               name="logo"
//               label="Logo / Business Image"
//               placeholder="Upload Business Logo"
//               icon={Image}
//             />
//             <SelectField
//               name="visibility"
//               label="Visibility (Public/Private)"
//               placeholder="Select Visibility"
//               options={visibilityOptions}
//               icon={Eye}
//             />
//           </div>
//         </div>

//         {/* Buttons */}
//         <div className="flex flex-col md:flex-row gap-4">
//           <Button
//             type="submit"
//             className="w-full bg-blue-600 hover:bg-blue-700"
//           >
//             Proceed
//           </Button>
//           <Button
//             type="button"
//             variant="outline"
//             className="w-full border-gray-400 text-gray-700 hover:bg-gray-100"
//             onClick={onSaveAndExit}
//           >
//             Save and exit
//           </Button>
//         </div>
//       </form>
//     </FormProvider>
//   )
// }

// export default BusinessDetailForm
// BusinessDetailForm.tsx
"use client"
import { useAuth, useOrganization } from "@clerk/nextjs"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import InputField from "@/components/custom-form-fields/input-field"
import SelectField from "@/components/custom-form-fields/select-field"
import {
  Building2,
  Briefcase,
  Mail,
  Phone,
  Globe,
  MapPin,
  Map,
  FileText,
  Upload,
  Image,
  Eye,
  LocateFixed,
  MapPinHouse,
  Pin,
  MapPinned,
} from "lucide-react"
import FileUploadField from "@/components/custom-form-fields/image-upload"
import { toast } from "sonner"
import { useEffect } from "react"
import { useBusinessStore } from "@/app/(admin)/business-settings/_store/business-store"
import { useUser } from "@clerk/nextjs"
import { getBusinessById } from "../_api-call/business-api-call"
import { business } from "../../../../features/business-detail/action/action"
import { User } from "@clerk/nextjs/server"

export const transformBusinessData = (data: any) => {
  const address = Array.isArray(data.address) ? data.address[0] || {} : {}
  return {
    id: data.id || "",
    businessName: data.name || "",
    industry: data.industry || "",
    email: data.email || "",
    phone: data.phone || "",
    website: data.website || "",
    city: address.city || "",
    street: address.street || "",
    state: address.state || "",
    zipCode: address.zipCode || "",
    country: address.country || "",
    googleMap: address.googleMap || "",
    registrationNumber: data.businessRegistrationNumber || "",
    taxId: data.taxId || null,
    logo: data.logo || null,
    visibility: data.visibility || "",
  }
}
export const transformBusinessDataAfterSubmit = (data: any) => {
  return {
    id: data.id || "",
    businessName: data.businessName || "",
    industry: data.industry || "",
    email: data.email || "",
    phone: data.phone || "",
    website: data.website || "",
    city: data.city || "",
    street: data.street || "",
    state: data.state || "",
    zipCode: data.zipCode || "",
    country: data.country || "",
    googleMap: data.googleMap || "",
    registrationNumber: data.registrationNumber || "",
    taxId: data.taxId || null,
    logo: data.logo || null,
    visibility: data.visibility || "",
  }
}

const industryOptions = [
  { label: "Salon & Spa", value: "Salon & Spa" },
  { label: "Medical & Health", value: "Medical & Health" },
  { label: "Automotive Services", value: "Automotive Services" },
  { label: "Home Repair & Maintenance", value: "Home Repair & Maintenance" },
  { label: "Fitness & Wellness", value: "Fitness & Wellness" },
  { label: "Education & Training", value: "Education & Training" },
  { label: "Legal & Consulting", value: "Legal & Consulting" },
  { label: "IT Services", value: "IT Services" },
]

const visibilityOptions = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Pending", value: "PENDING" },
  { label: "Suspended", value: "SUSPENDED" },
]

const schema = z.object({
  id: z.string().optional(),
  businessName: z.string().min(1, "Business name is required"),
  industry: z.string().min(1, "Industry selection is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  phone: z.string().min(1, "Phone number is required"),
  website: z.string().optional(),
  city: z.string().min(1, "City is required"),
  street: z.string().min(1, "Street is required"),
  state: z.string().optional(),
  zipCode: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
  googleMap: z.string().optional(),
  registrationNumber: z
    .string()
    .min(1, "Business registration number is required"),
  taxId: z.any().optional(),
  logo: z.any().optional(),
  visibility: z.string().min(1, "Visibility selection is required"),
})

interface BusinessDetailFormProps {
  businessData?: any
}

const BusinessDetailForm = ({
  businessData: propBusinessData,
}: BusinessDetailFormProps) => {
  const {
    businessData,
    setBusinessData,
    setSelectedBusiness,
    setActiveTab,
    selectedBusiness,
  } = useBusinessStore()
  const { user } = useUser()

  const { isLoaded, organization }: any = useOrganization()

  // const activeOrganization = fetchBusinessById(organization?.id as string)

  const isUpdateMode = !!selectedBusiness?.id

  // Initialize form with businessData only on mount or when businessData.id changes
  let id
  useEffect(() => {
    if (selectedBusiness?.id) {
      const dataBeforeUpdate = transformBusinessData(selectedBusiness)
      form.reset(dataBeforeUpdate)
    }
  }, [selectedBusiness])

  useEffect(() => {
    const fetchBusiness = async () => {
      if (organization?.id) {
        const orgToUpdate = await getBusinessById(organization?.id)
        console.log(orgToUpdate, "Organization data to update")
        setSelectedBusiness(orgToUpdate.data)
      }
    }
    fetchBusiness()
  }, [organization?.id])

  const defaultValues = isUpdateMode
    ? {
        id: selectedBusiness.id,
        businessName: selectedBusiness.name || "",
        industry: selectedBusiness.industry || "",
        email: selectedBusiness.email || "",
        phone: selectedBusiness.phone || "",
        website: selectedBusiness.website || "",
        city: selectedBusiness.address[0].city || "",
        street: selectedBusiness.address[0].street || "",
        state: selectedBusiness.address[0].state || "",
        zipCode: selectedBusiness.address[0].zipCode || "",
        country: selectedBusiness.address[0].country || "",
        googleMap: selectedBusiness.address[0].googleMap || "",
        registrationNumber: selectedBusiness.businessRegistrationNumber || "",
        taxId: "",
        logo: "",
        visibility: selectedBusiness.status || "",
      }
    : {
        id: "",
        businessName: "",
        industry: "",
        email: "",
        phone: "",
        website: "",
        city: "",
        street: "",
        state: "",
        zipCode: "",
        country: "",
        googleMap: "",
        registrationNumber: "",
        taxId: "",
        logo: "",
        visibility: "",
      }

  const form = useForm({
    defaultValues,
    resolver: zodResolver(schema),
  })

  // Sync form changes to businessData in store
  useEffect(() => {
    const subscription = form.watch((value) => {
      setBusinessData({
        ...businessData,
        ...transformBusinessData(value),
      })
    })
    return () => subscription.unsubscribe()
  }, [form, businessData, setBusinessData])

  const onSubmit = async (data: any) => {
    if (!user) {
      toast.error("Please login to continue")
      return
    }

    // Update business data with organization info
    const updatedData = {
      ...businessData,
      ...transformBusinessDataAfterSubmit(data),
    }
    setBusinessData(updatedData)
    toast.success("Business details saved and organization created!")

    setActiveTab("Business hour & Availability")
  }

  // // Helper function to fetch existing organization
  // const fetchExistingOrganization = async (orgId: string) => {
  //   try {
  //     const orgs = await fetch(`/api/business-detail/${orgId}`)
  //     const orgData = await orgs.json()
  //     return orgData?.data?.[0]
  //   } catch (error) {
  //     console.error("Failed to fetch organizations:", error)
  //     return null
  //   }
  // }

  // // Helper function to update organization
  // const updateOrganization = async (orgId: string, data: any) => {
  //   try {
  //     const response = await fetch(`/api/organizations/${orgId}`, {
  //       method: "PATCH",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(data),
  //     })
  //     if (!response.ok) {
  //       throw new Error("Failed to update organization")
  //     }
  //   } catch (error) {
  //     console.error("Failed to update organization:", error)
  //     throw error
  //   }
  // }
  const onSaveAndExit = () => {
    toast.info("Save and exit clicked. Data not persisted.")
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          toast.error("Please fix the form errors before proceeding.")
        })}
        className="space-y-8"
      >
        {/* Business Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Business Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              name="businessName"
              label="Business Name"
              placeholder="Enter your business name"
              icon={Building2}
            />
            <SelectField
              name="industry"
              label="Industry/Category"
              placeholder="Select Industry Type"
              options={industryOptions}
              icon={Briefcase}
            />
            <InputField
              name="email"
              label="Email"
              type="email"
              placeholder="Enter business email address"
              icon={Mail}
            />
            <InputField
              name="phone"
              label="Phone Number"
              type="tel"
              placeholder="Enter your phone"
              icon={Phone}
            />
            <InputField
              name="website"
              label="Website"
              type="url"
              placeholder="Your business website URL"
              icon={Globe}
              className="md:col-span-2"
            />
          </div>
        </div>

        {/* Business Address */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Business Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              name="city"
              label="City"
              placeholder="Enter city"
              icon={MapPinHouse}
            />
            <InputField
              name="street"
              label="Street"
              placeholder="Enter street"
              icon={LocateFixed}
            />
            <InputField
              name="state"
              label="State"
              placeholder="Enter State"
              icon={MapPinned}
            />
            <InputField
              name="zipCode"
              label="ZIP Code"
              placeholder="Enter ZIP code"
              icon={Pin}
            />
            <InputField
              name="country"
              label="Country"
              placeholder="Enter Country"
              icon={MapPin}
            />
            <InputField
              name="googleMap"
              label="Google Map"
              type="url"
              placeholder="Enter google map url"
              icon={Map}
            />
          </div>
        </div>

        {/* Legal & Compliance */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Legal & Compliance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              name="registrationNumber"
              label="Business Registration Number"
              placeholder="Enter Business Registration Number"
              icon={FileText}
            />
            <FileUploadField
              name="taxId"
              label="Tax ID / EIN / PAN"
              placeholder="Upload Tax ID / EIN / PAN document"
              icon={Upload}
            />
          </div>
        </div>

        {/* Branding & Visibility */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Branding & Visibility</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FileUploadField
              name="logo"
              label="Logo / Business Image"
              placeholder="Upload Business Logo"
              icon={Image}
            />
            <SelectField
              name="visibility"
              label="Visibility (Public/Private)"
              placeholder="Select Visibility"
              options={visibilityOptions}
              icon={Eye}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row gap-4">
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Proceed
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full border-gray-400 text-gray-700 hover:bg-gray-100"
            onClick={onSaveAndExit}
          >
            Save and exit
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

export default BusinessDetailForm
