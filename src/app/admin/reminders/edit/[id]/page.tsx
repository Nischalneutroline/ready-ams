"use client"

import { Card } from "@/components/ui/card"
// import PageTabs from "@/features/business-detail/components/page-tabs"
// import { useState } from "react"
import { useParams } from "next/navigation"
// import EditReminderForm from "@/components/custom-form-fields/reminder/edit-reminder-form"
// import EditAnnouncementForm from "@/components/custom-form-fields/reminder/edit-announcement-form"
// import {
//   fetchReminderData,
//   reminderData,
// } from "@/features/reminder/action/action"
// import { getReminder } from "@/features/reminder/api/api"
import ReminderForm from "@/components/custom-form-fields/reminder/reminder-form"
import { useNotificationStore } from "../../_store/reminder-store"
import AnnouncementForm from "@/features/reminder/components/announcment/announcement-form"

const ReminderPage = () => {
  const params = useParams()
  const id = params.id as string

  const { activeTab } = useNotificationStore()

  return (
    <div>
      <Card className="h-full overflow-y-auto p-4 md:p-6">
        {/* <PageTabs isReminder activeTab={activeTab} onTabChange={onActiveTab} /> */}
        {activeTab === "Reminder" ? (
          <ReminderForm />
        ) : (
          // <EditAnnouncementForm id={id} />
          <AnnouncementForm />
        )}
      </Card>
    </div>
  )
}

export default ReminderPage
