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
} from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/shared/table/data-table-column-header"
import { shortenText } from "@/features/reminder/lib/lib"
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  formatDuration,
  getActiveStatusStyles,
} from "@/features/service/lib/lib"
import { useState } from "react"
import DeleteAlert from "@/components/shared/delete-alert"
import { Service } from "../_types/service"

export const columns = (
  handleDelete: (id: string) => void
): ColumnDef<Service>[] => [
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
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const fullMessage = row.getValue("description") as string
      const shortMessage = shortenText(fullMessage)

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-pointer">{shortMessage}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{fullMessage}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isActive = row.original.status
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
    accessorKey: "estimatedDuration",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Duration" />
    ),
    cell: ({ row }) => {
      const estimatedDuration = row.original.estimatedDuration
      return <div className="">{formatDuration(estimatedDuration)}</div>
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
              <DropdownMenuItem className="flex gap-2 items-center justify-start">
                <Eye className="h-4 w-4 text-blue-400" /> View
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/service/edit/${row.original.id}`)}
                className="flex gap-2 items-center justify-start"
              >
                <FilePenLine className="h-4 w-4 text-green-600" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                className="flex gap-2 items-center justify-start "
              >
                <Trash2 className="h-4 w-4 text-red-600" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Delete Alert */}
          <DeleteAlert
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onDelete={() => {
              handleDelete(row.original.id as string)
              setIsDeleteDialogOpen(false)
            }}
          />
        </>
      )
    },
  },
]
