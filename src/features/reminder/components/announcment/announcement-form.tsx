// "use client"

// import { useForm, FormProvider } from "react-hook-form"
// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"
// import InputField from "@/components/custom-form-fields/input-field"
// import TextAreaField from "@/components/custom-form-fields/textarea-field"
// import RadioGroupField from "@/components/custom-form-fields/reminder/radio-group-field"
// import AnnouncementCheckboxGroupField from "@/components/custom-form-fields/reminder/announcement-checkbox-group-feild"
// import AnnouncementRadioScheduleField from "./radio-schecule-field"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { z } from "zod"
// import {
//   Delete,
//   Megaphone,
//   MessageSquareDot,
//   PenLine,
//   ShieldUser,
// } from "lucide-react"
// import { transformFormToPayload } from "@/features/announcement-offer/action/action"
// import { toast } from "sonner"
// import { useNotificationStore } from "@/app/(admin)/reminders/_store/reminder-store"

// const targetAudienceOptions = ["All", "Appointments Users", "Cancelled Users"]
// const showOnOptions = ["Top Banner", "Push Notification", "Email", "All"]
// const autoDeleteOptions = ["1 days", "3 days", "7 days", "30 days", "Never"]
// const scheduleOptions = ["Immediately", "Schedule"]

// const schema = z
//   .object({
//     title: z.string().min(1, "Title is required"),
//     message: z.string().min(1, "Message is required"),
//     description: z.string().min(1, "Description is required"),
//     targetAudience: z.string().min(1, "Target audience selection is required"),
//     schedule: z.string().min(1, "Schedule option is required"),
//     scheduleDate: z.date().optional(),
//     scheduleTime: z.string().optional(),
//     showOn: z
//       .array(z.string())
//       .min(1, "At least one show on option must be selected"),
//     autoDelete: z.string().min(1, "Auto-delete option is required"),
//   })
//   .superRefine((data, ctx) => {
//     if (data.schedule === "Schedule") {
//       if (!data.scheduleDate) {
//         ctx.addIssue({
//           path: ["scheduleDate"],
//           message: "Schedule date is required",
//           code: z.ZodIssueCode.custom,
//         })
//       }
//       if (!data.scheduleTime) {
//         ctx.addIssue({
//           path: ["scheduleTime"],
//           message: "Schedule time is required",
//           code: z.ZodIssueCode.custom,
//         })
//       }
//     }
//   })

// export default function AnnouncementForm() {
//   const router = useRouter()
//   const { createAnnouncement } = useNotificationStore()
//   const [submitting, setSubmitting] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   const form = useForm({
//     defaultValues: {
//       title: "",
//       message: "",
//       description: "",
//       targetAudience: "All",
//       schedule: "Immediately",
//       scheduleDate: new Date(),
//       scheduleTime: "",
//       showOn: [],
//       autoDelete: "7 days",
//     },
//     resolver: zodResolver(schema),
//   })

//   const { handleSubmit } = form

//   const onSubmit = async (data: any) => {
//     console.log("onSubmit: data before transformation =", data)
//     setSubmitting(true)
//     setError(null)

//     try {
//       const payload = transformFormToPayload(data)
//       console.log("onSubmit: transformed payload =", payload)
//       const result = await createAnnouncement(payload)
//       console.log("onSubmit: create result =", result)
//       if (result.success) {
//         toast.success("Announcement created successfully!")
//         router.push("/reminders")
//       } else {
//         setError(result.errorMessage || "Failed to create announcement")
//       }
//     } catch (err) {
//       console.error("Failed to create announcement:", err)
//       setError("Failed to create announcement. Please try again.")
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   return (
//     <FormProvider {...form}>
//       <Card className="border-none">
//         <CardContent>
//           {error && (
//             <div className="text-red-500 text-sm text-center mb-4">{error}</div>
//           )}
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//             <div className="space-y-6">
//               {/* Title */}
//               <InputField
//                 name="title"
//                 label="Title"
//                 placeholder="Enter Service Name"
//                 icon={PenLine}
//               />
//               {/* Description Field */}
//               <TextAreaField
//                 name="description"
//                 label="Description"
//                 placeholder="Enter description"
//               />

//               {/* Message */}
//               <TextAreaField
//                 name="message"
//                 label="Message"
//                 placeholder="Details about your service for users to view..."
//               />

//               {/* Target Audience */}
//               <RadioGroupField
//                 name="targetAudience"
//                 label="Target Audience"
//                 options={targetAudienceOptions}
//                 icon={ShieldUser}
//               />

//               <div className="flex flex-col gap-8">
//                 {/* Schedule Announcements */}
//                 <AnnouncementRadioScheduleField
//                   name="schedule"
//                   label="Schedule Announcements"
//                   dateFieldName="scheduleDate"
//                   timeFieldName="scheduleTime"
//                   options={scheduleOptions}
//                   icon={Megaphone}
//                 />

//                 {/* Show On */}
//                 <AnnouncementCheckboxGroupField
//                   name="showOn"
//                   label="Show on"
//                   options={showOnOptions}
//                   icon={MessageSquareDot}
//                 />

//                 {/* Auto Delete */}
//                 <RadioGroupField
//                   name="autoDelete"
//                   label="Auto-delete expired reminder after?"
//                   options={autoDeleteOptions}
//                   icon={Delete}
//                 />
//               </div>

//               <Button
//                 type="submit"
//                 className="w-full bg-blue-600 hover:bg-blue-700"
//                 disabled={submitting}
//                 aria-busy={submitting}
//               >
//                 {submitting ? "Creating..." : "Save"}
//               </Button>
//             </div>
//           </form>
//         </CardContent>
//       </Card>
//     </FormProvider>
//   )
// }

"use client"

import { useForm, FormProvider } from "react-hook-form"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import InputField from "@/components/custom-form-fields/input-field"
import TextAreaField from "@/components/custom-form-fields/textarea-field"
import RadioGroupField from "@/components/custom-form-fields/reminder/radio-group-field"
import AnnouncementCheckboxGroupField from "@/components/custom-form-fields/reminder/announcement-checkbox-group-feild"
import AnnouncementRadioScheduleField from "@/features/reminder/components/announcment/radio-schecule-field"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Delete,
  Megaphone,
  MessageSquareDot,
  PenLine,
  ShieldUser,
} from "lucide-react"
import { transformFormToPayload } from "@/features/announcement-offer/action/action"
import { transformAnnouncementData } from "@/features/reminder/action/action"
import { toast } from "sonner"
import { useNotificationStore } from "@/app/admin/reminders/_store/reminder-store"

const targetAudienceOptions = ["All", "Appointments Users", "Cancelled Users"]
const showOnOptions = ["Top Banner", "Push Notification", "Email", "All"]
const autoDeleteOptions = ["1 days", "3 days", "7 days", "30 days", "Never"]
const scheduleOptions = ["Immediately", "Schedule"]

const schema = z
  .object({
    title: z.string().min(1, "Title is required"),
    message: z.string().min(1, "Message is required"),
    description: z.string().min(1, "Description is required"),
    targetAudience: z.string().min(1, "Target audience selection is required"),
    schedule: z.string().min(1, "Schedule option is required"),
    scheduleDate: z.date().optional(),
    scheduleTime: z.string().optional(),
    showOn: z
      .array(z.string())
      .min(1, "At least one show on option must be selected"),
    autoDelete: z.string().min(1, "Auto-delete option is required"),
  })
  .superRefine((data, ctx) => {
    if (data.schedule === "Schedule") {
      if (!data.scheduleDate) {
        ctx.addIssue({
          path: ["scheduleDate"],
          message: "Schedule date is required",
          code: z.ZodIssueCode.custom,
        })
      }
      if (!data.scheduleTime) {
        ctx.addIssue({
          path: ["scheduleTime"],
          message: "Schedule time is required",
          code: z.ZodIssueCode.custom,
        })
      }
    }
  })

export default function AnnouncementForm() {
  const router = useRouter()
  const { id } = useParams()
  const isEditMode = !!id
  const { createAnnouncement, updateAnnouncement } = useNotificationStore()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      title: "",
      message: "",
      description: "",
      targetAudience: "All",
      schedule: "Immediately",
      scheduleDate: new Date(),
      scheduleTime: "",
      showOn: [],
      autoDelete: "7 days",
    },
    resolver: zodResolver(schema),
  })

  const { handleSubmit, reset } = form

  // Fetch announcement data for edit mode
  useEffect(() => {
    if (isEditMode) {
      async function fetchData() {
        try {
          const transformedData = await transformAnnouncementData(id as string)
          reset({
            title: transformedData.title,
            message: transformedData.message,
            description: transformedData.description,
            targetAudience: transformedData.targetAudience,
            schedule: transformedData.schedule,
            scheduleDate: transformedData.scheduleDate,
            scheduleTime: transformedData.scheduleTime,
            showOn: transformedData.showOn,
            autoDelete: transformedData.autoDelete,
          })
        } catch (err) {
          console.error("Failed to fetch announcement:", err)
          setError("Failed to load announcement. Please try again.")
        }
      }
      fetchData()
    }
  }, [id, isEditMode, reset])

  const onSubmit = async (data: any) => {
    console.log("onSubmit: data before transformation =", data)
    setSubmitting(true)
    setError(null)

    try {
      const payload = transformFormToPayload(data)
      console.log("onSubmit: transformed payload =", payload)
      let result
      if (isEditMode) {
        result = await updateAnnouncement(id as string, payload)
        console.log("onSubmit: update result =", result)
      } else {
        result = await createAnnouncement(payload)
        console.log("onSubmit: create result =", result)
      }
      if (result.success) {
        toast.success(
          isEditMode
            ? "Announcement updated successfully!"
            : "Announcement created successfully!"
        )
        router.push("/reminders")
      } else {
        setError(
          result.errorMessage ||
            `Failed to ${isEditMode ? "update" : "create"} announcement`
        )
      }
    } catch (err) {
      console.error(
        `Failed to ${isEditMode ? "update" : "create"} announcement:`,
        err
      )
      setError(
        `Failed to ${isEditMode ? "update" : "create"} announcement. Please try again.`
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <FormProvider {...form}>
      <Card className="border-none p-4">
        <CardContent>
          {error && (
            <div className="text-red-500 text-sm text-center mb-4">{error}</div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-6">
              {/* Title */}
              <InputField
                name="title"
                label="Title"
                placeholder="Enter Service Name"
                icon={PenLine}
              />
              {/* Description Field */}
              <TextAreaField
                name="description"
                label="Description"
                placeholder="Enter description"
              />

              {/* Message */}
              <TextAreaField
                name="message"
                label="Message"
                placeholder="Details about your service for users to view..."
              />

              {/* Target Audience */}
              <RadioGroupField
                name="targetAudience"
                label="Target Audience"
                options={targetAudienceOptions}
                icon={ShieldUser}
              />

              <div className="flex flex-col gap-8">
                {/* Schedule Announcements */}
                <AnnouncementRadioScheduleField
                  name="schedule"
                  label="Schedule Announcements"
                  dateFieldName="scheduleDate"
                  timeFieldName="scheduleTime"
                  options={scheduleOptions}
                  icon={Megaphone}
                />

                {/* Show On */}
                <AnnouncementCheckboxGroupField
                  name="showOn"
                  label="Show on"
                  options={showOnOptions}
                  icon={MessageSquareDot}
                />

                {/* Auto Delete */}
                <RadioGroupField
                  name="autoDelete"
                  label="Auto-delete expired announcement after?"
                  options={autoDeleteOptions}
                  icon={Delete}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={submitting}
                aria-busy={submitting}
              >
                {submitting
                  ? isEditMode
                    ? "Updating..."
                    : "Creating..."
                  : isEditMode
                    ? "Update"
                    : "Create"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  )
}
