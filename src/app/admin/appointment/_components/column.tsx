"use client"

import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  Eye,
  FilePenLine,
  Trash2,
  Settings,
  MoreHorizontal,
} from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatAppointmentDate, formatAppointmentTime } from "@/utils/utils"
import DeleteAlert from "@/components/shared/delete-alert"

export const columns = (
  handleDelete: (id: string) => void
): ColumnDef<any>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "customerName",
    header: "Customer Name",
    cell: ({ row }) => (
      <div className="truncate max-w-[200px]">
        {row.getValue("customerName")}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="truncate max-w-[200px]">{row.getValue("email")}</div>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "service",
    header: "Service",
    cell: ({ row }) => {
      const service = row.original.service?.title || "N/A"
      return <div>{service}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <Badge
          className={cn("capitalize")}
          variant={
            status === "SCHEDULED" || status === "FOLLOW_UP"
              ? "secondary"
              : status === "COMPLETED"
                ? "default"
                : status === "CANCELLED" || status === "MISSED"
                  ? "destructive"
                  : "outline"
          }
        >
          {status.toLowerCase()}
        </Badge>
      )
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = formatAppointmentDate(row.original.selectedDate)
      return <div>{date}</div>
    },
  },
  {
    accessorKey: "time",
    header: "Time",
    cell: ({ row }) => {
      const time = row.original.selectedTime
      return <div>{time}</div>
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const router = useRouter()
      const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel className="flex gap-2 items-center justify-start">
                Action
                <Settings className="h-4 w-4" />
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/admin/appointment/view/${row.original.id}`)
                }
                className="flex gap-2 items-center justify-start"
              >
                <Eye className="h-4 w-4 text-blue-400" /> View
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/admin/appointment/edit/${row.original.id}`)
                }
                className="flex gap-2 items-center justify-start"
              >
                <FilePenLine className="h-4 w-4 text-green-600" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                className="flex gap-2 items-center justify-start"
              >
                <Trash2 className="h-4 w-4 text-red-600" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DeleteAlert
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onDelete={() => {
              handleDelete(row.original.id)
              setIsDeleteDialogOpen(false)
            }}
          />
        </>
      )
    },
  },
]
