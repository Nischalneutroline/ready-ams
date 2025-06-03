import { Service } from "@/app/admin/service/_types/service"
import { Button } from "@/components/ui/button"
import { Appointment } from "@/data/structure"
import { formatLocalDateTime } from "@/features/appointment/action/action"
import { deleteAppointment } from "@/features/appointment/api/api"
import { getStatusStyles } from "@/features/appointment/lib/lib"

import { getServices } from "@/features/service/api/api"
import { capitalizeFirstChar, capitalizeOnlyFirstLetter } from "@/utils/utils"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu"
import {
  Clock2,
  Eye,
  FilePenLine,
  HandPlatter,
  MoreHorizontal,
  Phone,
  Settings,
  Trash2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import router from "next/router"
import React from "react"

type AppointmentCardProps = {
  appointment: Appointment
}

const serviceData = await getServices()
console.log(serviceData, "serviceData")

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
}: AppointmentCardProps) => {
  const router = useRouter()
  console.log(appointment, "appointment")
  const serviceName = serviceData.find(
    (service: Service) => service.id === appointment.serviceId
  )
  const { bg, dot, text } = getStatusStyles(appointment.status)
  const initials = appointment.customerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
  const avatarUrl = "https://github.com/shadcn.png"
  return (
    <div className="flex items-center gap-2 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition">
      <div className="flex-shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={appointment.customerName}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
            {initials}
          </div>
        )}
      </div>
      {/* This needs to be completed */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-gray-900">
            {appointment.customerName}
          </p>
          <div
            className={`flex gap-2 items-center text-[12px] py-[3px] px-3 rounded-lg ${bg} ${text}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${dot}`}></div>
            {capitalizeOnlyFirstLetter(appointment.status)}
          </div>
        </div>
        <p className="flex items-center gap-2 text-[13px] text-gray-500 truncate">
          <HandPlatter className="w-4 h-4 text-gray-400" />
          {`${serviceName?.title}`}
        </p>
        <p className="flex items-center gap-2 text-[13px] text-gray-500">
          <Clock2 className="w-4 h-4 text-gray-400" />
          {formatLocalDateTime(
            appointment.selectedDate,
            appointment.selectedTime
          )}
        </p>
        <p className="flex items-center gap-2 text-[13px] text-gray-500">
          <Phone className="w-4 h-4 text-gray-400" />
          {appointment.phone}
        </p>
      </div>

      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="flex flex-col bg-white px-4 p-2 gap-2 shadow-md text-sm"
          >
            <DropdownMenuLabel className="flex gap-2 items-center justify-start">
              Action
              <Settings className="h-4 w-4" />
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push(`/customer/view/${appointment.id}`)}
              className="flex gap-2 items-center justify-start"
            >
              <Eye className="h-4 w-4 text-blue-400 " /> View
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/customer/edit/${appointment.id}`)}
              className="flex gap-2 items-center justify-start"
            >
              <FilePenLine className="h-4 w-4 text-green-600" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                deleteAppointment(appointment.id as string)
              }}
              className="flex gap-2 items-center justify-start"
            >
              <Trash2 className="h-4 w-4 text-red-600" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default AppointmentCard
