"use client"
import Heading from "@/components/admin/heading"
import { BadgePercent } from "lucide-react"
import { Card } from "@/components/ui/card"
import PageHeader from "@/components/shared/page-header"
import { useNotificationStore } from "./_store/reminder-store"
import PageTabs from "@/components/table/page-tabs"
const tabOptions = ["Reminder", "Announcement"]

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { activeTab, onActiveTab } = useNotificationStore()

  return (
    <main className="h-full flex flex-col">
      <PageHeader>
        <Heading
          title="Remider and Announcement"
          description="Manage and View your Announcement"
          icon={<BadgePercent />}
        />
      </PageHeader>
      {/* Scrollable Form Container */}
      <Card className="overflow-y-auto p-4 md:p-6 h-full">
        <PageTabs
          customTabs={tabOptions}
          activeTab={activeTab}
          onTabChange={onActiveTab}
        />

        {children}
      </Card>
    </main>
  )
}

export default Layout
