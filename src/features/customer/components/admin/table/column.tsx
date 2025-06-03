"use client"

import { useRouter } from "next/navigation"
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
  MoreHorizontal,
  Settings,
  Trash2,
  ArrowUpDown,
  MoreVertical,
} from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/shared/table/data-table-column-header"
import { deleteCustomer } from "@/features/customer/api/api"
import {
  capitalizeFirstChar,
  capitalizeOnlyFirstLetter,
} from "../../../../../utils/utils"
import {
  getActiveStatusStyles,
  getRoleStyles,
} from "@/features/customer/lib/lib"
import { User } from "@/app/admin/customer/_types/customer"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<User>[] = [
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
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const role = row.original.role
      const { bg: bgRole, dot: dotRole, text: textRole } = getRoleStyles(role)
      return (
        <div
          className={`w-[110px] flex gap-2 items-center text-[13px] py-[3px] px-3 rounded-lg ${bgRole} ${textRole}`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${dotRole}`}></div>
          {capitalizeOnlyFirstLetter(role)}
        </div>
      )
    },
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Active" />
    ),
    cell: ({ row }) => {
      const isActive = row.original.isActive
      const { bg, dot, text } = getActiveStatusStyles(isActive)
      return (
        <div
          className={`w-[100px] flex gap-2 items-center text-[13px] py-[3px] px-3 rounded-lg ${bg} ${text}`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${dot}`}></div>
          {isActive ? "Active" : "Inactive"}
        </div>
      )
    },
  },
  {
    id: "actions",

    cell: ({ row }) => {
      const payment = row.original
      const router = useRouter()

      return (
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
              onClick={() => router.push(`/customer/view/${row.original.id}`)}
              className="flex gap-2 items-center justify-start"
            >
              <Eye className="h-4 w-4 text-blue-400 " /> View
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/customer/edit/${row.original.id}`)}
              className="flex gap-2 items-center justify-start"
            >
              <FilePenLine className="h-4 w-4 text-green-600" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                deleteCustomer(row.original.id)
              }}
              className="flex gap-2 items-center justify-start"
            >
              <Trash2 className="h-4 w-4 text-red-600" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
