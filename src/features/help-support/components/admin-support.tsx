// "use client";

// import { useState } from "react";
// import { useForm, FormProvider } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import InputField from "@/components/custom-form-fields/input-field";
// import TextAreaField from "@/components/custom-form-fields/textarea-field";
// import SelectField from "@/components/custom-form-fields/select-field";
// import {
//   User,
//   Mail,
//   Phone,
//   List,
//   Minus,
//   FileText,
//   Paperclip,
//   AlertTriangle,
//   CheckCircle,
//   AlertTriangleIcon,
//   Plus,
//   MinusIcon,
//   ListIcon,
//   User2,
// } from "lucide-react";
// import FileUploadField from "@/components/custom-form-fields/image-upload";
// import { createTicket } from "../api/api";

// const schema = z.object({
//   fullName: z.string().min(1, "Full name is required"),
//   email: z.string().email("Invalid email address").min(1, "Email is required"),
//   phone: z.string().min(1, "Phone number is required"),
//   issueCategory: z.string().min(1, "Issue category is required"),
//   subject: z.string().min(1, "Subject is required"),
//   description: z.string().min(1, "Description is required"),
//   priorityLevel: z.string().min(1, "Priority level is required"),
//   attachment: z.instanceof(File).optional(),
// });

// const issueCategoryOptions = [
//   { value: "GENERAL", label: "General Inquiry" },
//   { value: "TECHNICAL", label: "Technical Issue" },
//   { value: "BILLING", label: "Billing Question" },
//   { value: "SUPPORT", label: "Support" },
//   { value: "SECURITY", label: "Security" },
//   { value: "MAINTENANCE", label: "Maintenance" },
//   { value: "FEEDBACK", label: "Feedback" },
// ];

// const priorityLevelOptions = [
//   { value: "LOW", label: "Low" },
//   { value: "MEDIUM", label: "Medium" },
//   { value: "HIGH", label: "High" },
//   { value: "URGENT", label: "Urgent" },
// ];

// const AdminSupportForm = () => {
//   const [submitted, setSubmitted] = useState(false);
//   const [fileName, setFileName] = useState<string | null>(null);

//   const form = useForm({
//     defaultValues: {
//       fullName: "",
//       email: "",
//       phone: "",
//       issueCategory: "",
//       subject: "",
//       description: "",
//       priorityLevel: "",
//       attachment: undefined,
//     },
//     resolver: zodResolver(schema),
//   });

//   const onSubmit = async (data: any) => {
//     const { issueCategory, subject, description, priorityLevel, attachment } =
//       data;

//     const updatedData = {
//       userType: "ADMIN",
//       subject,
//       ticketDescription: description,
//       category: issueCategory,
//       priority: priorityLevel,
//       status: "OPEN",
//       assignedTo: "",
//       resolutionDescription: "",
//       proofFiles: attachment ? attachment.name : "",
//       initiatedById: "cm9gu8ms60000vdg0zdnsxb6z",
//       userId: "cm9gu8ms60000vdg0zdnsxb6z",
//     };
//     console.log("Admin Support Form submitted:", updatedData);
//     await createTicket(updatedData);
//     setSubmitted(true);
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       form.setValue("attachment", file);
//       setFileName(file.name);
//     }
//   };

//   if (submitted) {
//     return (
//       <div className="text-center space-y-4 h-full">
//         <h3 className="text-2xl font-bold flex items-center justify-center gap-2">
//           <CheckCircle className="size-6 text-green-500" />
//           Thank You for Reaching Out!
//         </h3>
//         <p className="text-gray-600">
//           Your request has been received! Our support team will review it and
//           get back to you as soon as possible. 🚀
//         </p>
//         <p className="text-gray-600">
//           If urgent, please check your email or contact support directly. We
//           appreciate your patience and are here to help! 😊
//         </p>
//         <p className="text-gray-600">
//           Got questions? We’re here to help! Reach out to us anytime. 🚀
//         </p>
//       </div>
//     );
//   }

//   return (
//     <FormProvider {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//         <div className="space-y-4">
//           <InputField
//             name="fullName"
//             label="Full Name"
//             placeholder="Admin Name"
//             icon={User}
//           />
//           <InputField
//             name="email"
//             label="Email"
//             type="email"
//             placeholder="Admin/Company Email"
//             icon={Mail}
//           />
//           <InputField
//             name="phone"
//             label="Phone Number"
//             type="tel"
//             placeholder="Phone Number"
//             icon={Phone}
//           />
//           <SelectField
//             name="issueCategory"
//             label="Issue Category"
//             placeholder="Select reminder type"
//             options={issueCategoryOptions}
//             icon={ListIcon}
//           />
//           <InputField
//             name="subject"
//             label="Subject"
//             placeholder="Enter subject | issue"
//             icon={MinusIcon}
//           />
//           <TextAreaField
//             name="description"
//             label="Description"
//             placeholder="Details about the service for users to view....."
//             icon={FileText}
//           />
//           {/* <div>
//             <div className="flex items-center gap-2">
//               <Paperclip className="size-4 text-gray-500" />
//               <Label>Attachment (if any)</Label>
//             </div>
//             <div className="mt-2">
//               <Button
//                 type="button"
//                 variant="outline"
//                 className="flex items-center gap-2"
//                 onClick={() => document.getElementById("attachment")?.click()}
//               >
//                 Plus
//                 Upload Supporting Document
//               </Button>
//               <input
//                 id="attachment"
//                 type="file"
//                 className="hidden"
//                 onChange={handleFileChange}
//               />
//               {fileName && (
//                 <p className="mt-2 text-sm text-gray-500">
//                   Selected file: {fileName}
//                 </p>
//               )}
//             </div>
//           </div> */}

//           <FileUploadField
//             name="attachment"
//             label="Attachment (if any)"
//             icon={Paperclip}
//           />
//           <SelectField
//             name="priorityLevel"
//             label="Priority Level"
//             placeholder="Select priority level"
//             options={priorityLevelOptions}
//             icon={AlertTriangleIcon}
//           />
//         </div>

//         <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
//           Submit
//         </Button>
//       </form>
//     </FormProvider>
//   );
// };

// export default AdminSupportForm;

"use client"

import { useCallback, memo } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import InputField from "@/components/custom-form-fields/input-field"
import TextAreaField from "@/components/custom-form-fields/textarea-field"
import SelectField from "@/components/custom-form-fields/select-field"
import {
  User,
  Mail,
  Phone,
  ListIcon,
  MinusIcon,
  FileText,
  Paperclip,
  AlertTriangleIcon,
  CheckCircle,
} from "lucide-react"
import FileUploadField from "@/components/custom-form-fields/image-upload"
import { useSupportTabsStore } from "@/app/admin/support/_store/support-store"

const schema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  phone: z.string().min(1, "Phone number is required"),
  issueCategory: z.string().min(1, "Issue category is required"),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(1, "Description is required"),
  priorityLevel: z.string().min(1, "Priority level is required"),
  attachment: z.instanceof(File).optional(),
})

const issueCategoryOptions = [
  { value: "GENERAL", label: "General Inquiry" },
  { value: "TECHNICAL", label: "Technical Issue" },
  { value: "BILLING", label: "Billing Question" },
  { value: "SUPPORT", label: "Support" },
  { value: "SECURITY", label: "Security" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "FEEDBACK", label: "Feedback" },
]

const priorityLevelOptions = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
]

const AdminSupportForm = () => {
  const {
    ticketSubmitted,
    ticketLoading,
    ticketError,
    createTicket,
    resetTicketState,
  } = useSupportTabsStore()

  const form = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      issueCategory: "",
      subject: "",
      description: "",
      priorityLevel: "",
      attachment: undefined,
    },
    resolver: zodResolver(schema),
  })

  const { reset, watch } = form
  const attachment = watch("attachment") // Monitor attachment for file name display

  const onSubmit = useCallback(
    async (data: any) => {
      const { issueCategory, subject, description, priorityLevel, attachment } =
        data
      const ticketData = {
        userType: "ADMIN",
        subject,
        ticketDescription: description,
        category: issueCategory,
        priority: priorityLevel,
        status: "OPEN" as const,
        assignedTo: "",
        resolutionDescription: "",
        proofFiles: attachment ? attachment.name : "",
        initiatedById: "cmaf54tao0000mstgofhtes4y", // TODO: Replace with auth context
        userId: "cmaf54tao0000mstgofhtes4y", // TODO: Replace with auth context
      }
      console.log("Admin Support Form submitted:", ticketData)
      await createTicket(ticketData)
      // if (!ticketError) {
      //   reset()
      // }
    },
    [createTicket, reset, ticketError]
  )

  const handleTryAgain = useCallback(() => {
    resetTicketState()
  }, [resetTicketState])

  if (ticketSubmitted) {
    return (
      <div className="text-center space-y-4 h-full">
        <h3 className="text-2xl font-bold flex items-center justify-center gap-2">
          <CheckCircle className="size-6 text-green-500" />
          Thank You for Reaching Out!
        </h3>
        <p className="text-gray-600">
          Your request has been received! Our support team will review it and
          get back to you as soon as possible. 🚀
        </p>
        <p className="text-gray-600">
          If urgent, please check your email or contact support directly. We
          appreciate your patience and are here to help! 😊
        </p>
        <p className="text-gray-600">
          Got another issue?{" "}
          <Button variant="link" onClick={handleTryAgain} className="p-0">
            Submit another ticket
          </Button>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {ticketError && (
        <div className="text-red-600 text-center">
          Error: {ticketError}
          <Button variant="link" onClick={handleTryAgain} className="ml-2">
            Try Again
          </Button>
        </div>
      )}
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <InputField
              name="fullName"
              label="Full Name"
              placeholder="Admin Name"
              icon={User}
            />
            <InputField
              name="email"
              label="Email"
              type="email"
              placeholder="Admin/Company Email"
              icon={Mail}
            />
            <InputField
              name="phone"
              label="Phone Number"
              type="tel"
              placeholder="Phone Number"
              icon={Phone}
            />
            <SelectField
              name="issueCategory"
              label="Issue Category"
              placeholder="Select issue category"
              options={issueCategoryOptions}
              icon={ListIcon}
            />
            <InputField
              name="subject"
              label="Subject"
              placeholder="Enter subject | issue"
              icon={MinusIcon}
            />
            <TextAreaField
              name="description"
              label="Description"
              placeholder="Details about the issue..."
              icon={FileText}
            />
            <div>
              <FileUploadField
                name="attachment"
                label="Attachment (if any)"
                icon={Paperclip}
              />
              {attachment && (
                <p className="mt-2 text-sm text-gray-500">
                  Selected file: {attachment.name}
                </p>
              )}
            </div>
            <SelectField
              name="priorityLevel"
              label="Priority Level"
              placeholder="Select priority level"
              options={priorityLevelOptions}
              icon={AlertTriangleIcon}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={ticketLoading}
          >
            {ticketLoading ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </FormProvider>
    </div>
  )
}

export default memo(AdminSupportForm)
