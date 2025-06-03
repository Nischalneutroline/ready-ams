import AnnouncementForm from "@/features/reminder/components/announcment/announcement-form"

import ReminderForm from "@/components/custom-form-fields/reminder/reminder-form"

import { useNotificationStore } from "../_store/reminder-store"

const ReminderPage = () => {
  const { activeTab, onActiveTab } = useNotificationStore()
  console.log(activeTab, "activeTab")
  const isRemindetr =
    activeTab === "Reminder" || activeTab === "Announcement || Offer"

  return (
    <div className="h-full overflow-y-auto">
      {activeTab === "Reminder" ? <ReminderForm /> : <AnnouncementForm />}
    </div>
  )
}

export default ReminderPage
