"use client"
import { Bell, Menu, Sidebar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"
import SidebarMobile from "./sidebar-mobile"
import { useNavStore } from "@/state/store"
import {
  OrganizationSwitcher,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs"

const Header = () => {
  const { onOpen } = useNavStore()

  return (
    <div className="flex items-center gap-4 w-full ">
      {/* Mobile Menu Icon */}
      <Menu className=" lg:hidden text-white size-7" onClick={() => onOpen()} />
      <div className="flex items-center justify-between w-full  px-4 py-2 rounded-md">
        {/* Search */}
        <div className="w-50">
          <Input
            type="search"
            placeholder="Search..."
            className="flex-1 rounded-full h-8 text-white placeholder:text-white "
          />
        </div>
        {/* Notifications & Avatar */}
      </div>
    </div>
  )
}

export default Header
