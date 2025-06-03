"use client"

import React, { useEffect, useMemo, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { cn } from "@/utils/utils"
import PageTabs from "@/features/business-detail/components/page-tabs"
import TablePageHeader from "@/components/shared/table/table-page-header"
import DataTableSkeleton from "@/components/table/skeleton-table"
import ReminderCard from "./reminder-card"
import { reminderColumns } from "@/features/reminder/components/reminder/columns"
import { useNotificationStore } from "@/app/admin/reminders/_store/reminder-store"
import { DataTable } from "@/components/table/data-table"

const reminderTabs = [
  "Reminder",
  "Follow up",
  "Cancellation",
  "Missed",
  "Custom",
]

const ReminderTabsPage = () => {
  const router = useRouter()
  const {
    activeTab,
    reminderTab,
    onReminderTab,
    getFilteredReminders,
    fetchReminders,
    reminders,
    loading,
    isRefreshing,
    hasFetched,
    error,
  } = useNotificationStore()

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)
  const hasFetchedOnce = useRef(false)

  // Initial fetch only if not fetched and on Reminder tab
  useEffect(() => {
    if (
      hasFetchedOnce.current ||
      loading ||
      isRefreshing ||
      hasFetched ||
      activeTab !== "Reminder"
    ) {
      return
    }
    console.log("Initial fetch triggered: no data fetched")
    hasFetchedOnce.current = true
    fetchReminders()
  }, [loading, isRefreshing, hasFetched, fetchReminders, activeTab])

  // Auto-refresh every 5 minutes (silent)
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === "Reminder") {
        console.log("Silent auto-refresh triggered")
        fetchReminders(false)
      }
    }, 300000) // 5 minutes

    return () => clearInterval(interval)
  }, [fetchReminders, activeTab])

  const handleRefresh = useCallback(() => {
    if (debounceTimeout.current) {
      return
    }
    console.log("Manual refresh triggered")
    debounceTimeout.current = setTimeout(() => {
      fetchReminders(true)
      debounceTimeout.current = null
    }, 300)
  }, [fetchReminders])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }
    }
  }, [])

  const filteredReminders = useMemo(() => {
    const result = getFilteredReminders()
    console.log("Rendered filtered reminders-------:", result)
    return result
  }, [reminderTab, reminders, getFilteredReminders])

  const memoizedColumns = useMemo(() => reminderColumns, [])

  return (
    <div className="flex flex-col gap-y-3 md:gap-y-6 overflow-x-auto max-w-screen">
      <div className="w-full p-4">
        {error && (
          <div className="text-red-500 text-sm text-center mb-4">{error}</div>
        )}
        {/* {(loading || isRefreshing) && (
          <div className="text-center text-muted-foreground mb-4">
            Loading...
          </div>
        )} */}
        <div className="flex justify-between items-center mb-4">
          <PageTabs
            isReminder
            activeTab={reminderTab}
            onTabChange={onReminderTab}
            customTabs={reminderTabs}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
            aria-label={
              isRefreshing ? "Refreshing reminders" : "Refresh reminders"
            }
            aria-busy={isRefreshing}
          >
            <RefreshCw
              className={cn("h-4 w-4", isRefreshing && "animate-spin")}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
        {loading && !hasFetched ? (
          <DataTableSkeleton />
        ) : (
          <div className="flex flex-col">
            <div className="hidden md:block space-y-3 md:space-y-6">
              <TablePageHeader
                title="Reminder"
                description="Manage and Customize your reminder"
                newButton="New Reminder"
                handleClick={() => {
                  router.push("/reminders/create/")
                }}
              />
              {filteredReminders.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground italic">
                  No reminders found for the selected tab ['{reminderTab}'].
                  <Button
                    variant="link"
                    className="p-1 ml-1 text-blue-600 hover:underline"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    aria-label="Retry fetching reminders"
                  >
                    Try refreshing
                  </Button>
                  or creating a new reminder.
                </div>
              ) : (
                <DataTable
                  columns={memoizedColumns}
                  data={filteredReminders}
                  searchFieldName="title"
                />
              )}
            </div>
            <div className="block md:hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReminders.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground italic">
                  No reminders found for the selected tab ['{reminderTab}'].
                  <Button
                    variant="link"
                    className="p-1 ml-1 text-blue-600 hover:underline"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    aria-label="Retry fetching reminders"
                  >
                    Try refreshing
                  </Button>
                  or creating a new reminder.
                </div>
              ) : (
                filteredReminders.map((reminder: any, index: number) => (
                  <ReminderCard
                    key={index}
                    reminder={reminder}
                    filterType={reminderTab}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReminderTabsPage
