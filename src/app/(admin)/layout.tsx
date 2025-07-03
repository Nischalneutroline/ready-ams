"use client"
import Header from "@/components/admin/header"
import SidebarDesktop from "@/components/admin/sidebar-desktop"
import SidebarMobile from "@/components/admin/sidebar-mobile"
// import { useBusinessStore } from "@/state/store"
import { useEffect } from "react"
import { useAppointmentStore } from "./appointment/_store/appointment-store"
import { useServiceStore } from "./service/_store/service-store"
import { useCustomerStore } from "./customer/_store/customer-store"
import { useBusinessStore } from "./business-settings/_store/business-store"
import { Toaster } from "@/components/ui/sonner"
import { useNotificationStore } from "./reminders/_store/reminder-store"

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  // Auto load services after admin loads
  const { fetchServices } = useServiceStore()
  const { fetchAppointments } = useAppointmentStore()
  const { fetchBusinessById } = useBusinessStore()
  const { fetchCustomers } = useCustomerStore()
  const { fetchReminders, fetchAnnouncements } = useNotificationStore()
  // Fetch services on app load
  useEffect(() => {
    console.log("App fully loaded, fetching appoinments, services, business...")
    // Fetch once after app loads
    const id = "cmbfcqfal0025vdgkgj6d2n0a"// Updated to match provided business data
    fetchBusinessById(id)
    fetchAppointments()
    fetchServices()
/*     fetchBusinesses("cmb8pzeyi0002vdz07ox053m2") */
    fetchCustomers()
    fetchReminders()
    fetchAnnouncements()
  }, [fetchServices, fetchAppointments, fetchCustomers, fetchBusinessById])

  return (
    <div className="relative min-h-screen bg-stone-100 overflow-hidden">
      {/* Top Background Gradient */}
      <div className="absolute inset-0 h-[30vh] rounded-b-lg z-0 pointer-events-none bg-gradient" />

      {/* Layout */}
      <div className="relative z-10 flex gap-6 p-2 md:p-4 lg:p-6 h-screen">
        {/* Sidebar */}
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <SidebarDesktop />
        </div>

        {/* Mobile Navbar */}
        <div className="block lg:hidden fixed top-0 w-full z-50">
          <SidebarMobile />
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col space-y-4 w-full h-full">
          {/* Header */}
          <Header />

          {/* Main Content */}
          <Toaster position="bottom-right" />
          <div className="flex-1 overflow-auto shadow">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
