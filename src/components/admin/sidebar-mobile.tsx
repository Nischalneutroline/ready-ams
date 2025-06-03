"use client"
import React from "react"
import {
  House,
  CalendarDays,
  Users,
  HandPlatter,
  Settings,
  Bell,
  Headset,
  X,
} from "lucide-react"
import { usePathname } from "next/navigation"
import { useNavStore } from "@/state/store"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const SidebarMobile = () => {
  const { isOpen, onOpen, onClose } = useNavStore()

  // get the pathname to set activate state
  const pathname = usePathname()

  // router for client side
  const router = useRouter()

  const navLinks = [
    { name: "Dashboard", path: "/admin/", icon: <House /> },
    { name: "Appointment", path: "/admin/appointment", icon: <CalendarDays /> },
    { name: "Customer", path: "/admin/customer", icon: <Users /> },
    { name: "Service", path: "/admin/service", icon: <HandPlatter /> },
    {
      name: "Business Settings",
      path: "/admin/business-settings",
      icon: <Settings />,
    },
    { name: "Reminders", path: "/admin/reminders", icon: <Bell /> },
    { name: "Support", path: "/admin/support", icon: <Headset /> },
  ]

  // handle click on nav link and route to that page
  const handleNavClick = (link: string) => {
    router.push(link)
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 bg-opacity-40"
          onClick={() => onClose()}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 z-50 transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-max h-full overflow-y-scroll flex flex-col justify-between shadow bg-white rounded-r-xl py-4 px-4`}
      >
        {/* Top - Logo and Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-4 border-b pb-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">
              CN
            </div>
            <span className="whitespace-nowrap text-xl font-semibold">
              Comany Name
            </span>
            <span className="cursor-pointer " onClick={() => onClose()}>
              <X />
            </span>
          </div>

          {/* Menu Items */}
          <div className="">
            {navLinks.slice(0, 4).map((link, index) => (
              <div
                key={index}
                className={cn(
                  "group flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-blue-700 cursor-pointer transition-all duration-200",
                  pathname === link.path && "bg-gray-50 text-blue-700"
                )}
                onClick={() => handleNavClick(link.path)}
              >
                <span className="size-6">{link.icon}</span>
                <span className="whitespace-nowrap text-sm">{link.name}</span>
              </div>
            ))}
          </div>

          <div className="border-t my-4" />

          {/* Action Section */}
          <div className="">
            {navLinks.slice(4).map((link, index) => (
              <div
                key={index}
                className={cn(
                  "group flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-blue-700 cursor-pointer transition-all duration-200",
                  pathname === link.path && "bg-gray-50 text-blue-700"
                )}
                onClick={() => handleNavClick(link.path)}
              >
                <span className="size-6">{link.icon}</span>
                <span className="whitespace-nowrap text-sm">{link.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Admin Profile */}
        <div className="flex items-center justify-between mt-10 border-t p-3 pl-0">
          <div className="flex items-center gap-3">
            <div className="w-10 border h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
              AD
            </div>
            <div>
              <div className="text-sm font-semibold">Admin Name</div>
              <div className="text-xs text-muted-foreground">Admin</div>
            </div>
          </div>
          <Settings className="w-5 h-5 text-gray-500 cursor-pointer hover:text-black" />
        </div>
      </aside>
    </>
  )
}

export default SidebarMobile
