"use client"

import React from "react"
import ReminderTabsPage from "@/features/reminder/components/reminder/reminder-page"
import NotificationTabsPage from "@/features/reminder/components/reminder/announcement-page"
// import PageTabs from "@/components/table/page-tabs"
import { useNotificationStore } from "./_store/reminder-store"

const tabOptions = ["Reminder", "Announcement"]

const ReminderPage = () => {
  const { activeTab, onActiveTab } = useNotificationStore()
  return (
    <>
      {activeTab === tabOptions[0] && <ReminderTabsPage />}
      {activeTab === tabOptions[1] && <NotificationTabsPage />}
    </>
  )
}

export default ReminderPage
