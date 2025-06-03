import { User } from "@/app/admin/customer/_types/customer"
import { Button } from "@/components/ui/button"

import { deleteCustomer } from "@/features/customer/api/api"
import {
  getActiveStatusStyles,
  getRoleStyles,
} from "@/features/customer/lib/lib"
import { capitalizeOnlyFirstLetter } from "@/utils/utils"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu"
import {
  Eye,
  FilePenLine,
  Mail,
  MailOpen,
  MoreHorizontal,
  Phone,
  Settings,
  Trash2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import router from "next/router"
import React from "react"

type ClientCardProps = {
  customer: User
}

const CustomerCard: React.FC<ClientCardProps> = ({
  customer,
}: ClientCardProps) => {
  const router = useRouter()
  const initials = customer.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
  const avatarUrl = "https://github.com/shadcn.png"

  const { bg, dot, text } = getActiveStatusStyles(customer?.isActive)
  const {
    bg: bgRole,
    dot: dotRole,
    text: textRole,
  } = getRoleStyles(customer.role)
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition">
      <div className="flex-shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={customer.name}
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
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-gray-900">{customer.name}</p>
            <div
              className={`w-[80px] flex gap-2 items-center text-[12px] py-[3px] px-3 rounded-lg ${bgRole} ${textRole}`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${dotRole}`}></div>
              {capitalizeOnlyFirstLetter(customer.role)}
            </div>
          </div>
          <div
            className={`w-[80px] flex gap-2 items-center text-[12px] py-[3px] px-3 rounded-lg ${bg} ${text}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${dot}`}></div>
            {customer.isActive ? "Active" : "Inactive"}
          </div>
        </div>
        <p className="flex items-center gap-2 text-[12px] text-gray-500 truncate">
          <MailOpen className="w-4 h-4 text-gray-400" />
          {customer.email}
        </p>
        <p className="flex items-center gap-2 text-[12px] text-gray-500">
          <Phone className="w-4 h-4 text-gray-400" />
          {customer.phone}
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
              onClick={() => router.push(`/customer/view/${customer.id}`)}
              className="flex gap-2 items-center justify-start"
            >
              <Eye className="h-4 w-4 text-blue-400 " /> View
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/customer/edit/${customer.id}`)}
              className="flex gap-2 items-center justify-start"
            >
              <FilePenLine className="h-4 w-4 text-green-600" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                deleteCustomer(customer.id)
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

export default CustomerCard
