// src/components/admin/appointment-form-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton"

export function AppointmentFormSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      {" "}
      {/* Added animate-pulse */}
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      {/* Form Fields Skeleton */}
      <div className="space-y-5">
        {/* First/Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4 mb-1" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4 mb-1" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Input */}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/5 mb-1" /> {/* Label */}
          <Skeleton className="h-10 w-full" /> {/* Input */}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4 mb-1" /> {/* Label */}
          <Skeleton className="h-10 w-full" /> {/* Input */}
        </div>

        {/* Service */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4 mb-1" /> {/* Label */}
          <Skeleton className="h-10 w-full" /> {/* Select */}
        </div>

        {/* Date/Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/3 mb-1" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Date Picker */}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/3 mb-1" /> {/* Label */}
            <Skeleton className="h-10 w-full" /> {/* Time Picker */}
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4 mb-1" /> {/* Label */}
          <Skeleton className="h-24 w-full" /> {/* Text Area */}
        </div>
      </div>
      {/* Buttons Skeleton */}
      <div className="flex flex-col gap-3 md:flex-row justify-between mt-6">
        <Skeleton className="h-10 w-full md:w-24" /> {/* Back Button */}
        <Skeleton className="h-10 w-full md:w-40" /> {/* Submit Button */}
      </div>
    </div>
  )
}
