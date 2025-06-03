"use client"
import React, { useState } from "react"
import {
  House,
  CalendarDays,
  Users,
  HandPlatter,
  Settings,
  Bell,
  Headset,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"

const SidebarDesktop = () => {
  const router = useRouter()

  // check the pathname and set is active in nav link item for highlighting
  const pathname = usePathname()

  // handle nav click
  const handleNavClick = (link: string) => {
    router.push(link)
  }

  const [isSidebarCollapsed, setCollapsed] = useState(false)

  const navLinks = [
    { name: "Dashboard", path: "/admin", icon: <House /> },
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

  // const isSidebarCollapsed = collapsed

  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          `transition-all duration-300 flex flex-col justify-between shadow bg-white rounded-xl py-6 px-4 h-[calc(100vh-3rem)]`,
          isSidebarCollapsed ? "w-[80px]" : "w-[250px]"
        )}
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
      >
        {/* Top - Logo and Title */}
        {/* Top - Logo and Toggle */}
        <div className="space-y-10">
          <div className="flex items-center justify-between">
            {/* Left side: Always show circle, show text only when expanded */}
            <div className="flex items-center gap-4 ">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">
                CN
              </div>
              <span
                className={`whitespace-nowrap text-xl font-semibold transition-all duration-300 ease-in-out ${
                  isSidebarCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                }`}
                style={{
                  overflow: "hidden",
                  transitionProperty: "opacity, width",
                }}
              >
                Comany Name
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-2">
            {navLinks.slice(0, 4).map((link, index) => (
              <div
                key={index}
                className={cn(
                  "group flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-blue-700 cursor-pointer transition-all duration-200",
                  pathname === link.path && "bg-gray-50 text-blue-700"
                )}
                onClick={() => handleNavClick(link.path)}
              >
                <span className="">{link.icon}</span>
                <span
                  className={`whitespace-nowrap text-sm transition-all duration-300 ease-in-out  ${
                    isSidebarCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                  }`}
                  style={{
                    overflow: "hidden",
                    transitionProperty: "opacity, width",
                  }}
                >
                  {link.name}
                </span>
              </div>
            ))}
          </div>

          {/* Separator */}
          <div className="border-t my-4" />

          {/* Action Section */}
          <div className="space-y-2">
            {navLinks.slice(4).map((link, index) => (
              <div
                key={index}
                className={cn(
                  "group flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-blue-700 cursor-pointer transition-all duration-200",
                  pathname === link.path && "bg-gray-50 text-blue-700"
                )}
                onClick={() => handleNavClick(link.path)}
              >
                <span>{link.icon}</span>
                <span
                  className={`whitespace-nowrap text-sm transition-all duration-300 ease-in-out ${
                    isSidebarCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                  }`}
                  style={{
                    overflow: "hidden",
                    transitionProperty: "opacity, width",
                  }}
                >
                  {link.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Admin Profile */}
        <div className="flex items-center justify-between mt-10  border-t p-3 pl-0 ">
          <div className="flex items-center gap-3">
            <div className="w-10 border h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
              AD
            </div>
            <div
              className={`whitespace-nowrap transition-all duration-300 ease-in-out ${
                isSidebarCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
              }`}
              style={{
                overflow: "hidden",
                transitionProperty: "opacity, width",
              }}
            >
              <div className="text-sm font-semibold">Admin Name</div>
              <div className="text-xs text-muted-foreground">Admin</div>
            </div>
          </div>
          {!isSidebarCollapsed && (
            <Settings className="w-5 h-5 text-gray-700 cursor-pointer hover:text-blue-700" />
          )}
        </div>
      </aside>
    </>
  )
}

export default SidebarDesktop
