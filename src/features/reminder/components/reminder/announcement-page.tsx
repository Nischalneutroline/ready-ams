"use client"

import React, { useEffect, useMemo, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { cn } from "@/utils/utils"
import TablePageHeader from "@/components/shared/table/table-page-header"
import { DataTable } from "./data-table"
import DataTableSkeleton from "@/components/table/skeleton-table"
import AnnouncementCard from "../announcment/announcement-card"
import { announcementColumns } from "../announcment/columns"
import TableFilterTabs1 from "../announcment/table-filter-tabs"
import { useNotificationStore } from "@/app/admin/reminders/_store/reminder-store"
import PageTabs from "@/components/table/page-tabs"

const announcementFilterOptions = ["Sent", "Scheduled", "Expired", "All"]

const NotificationTabsPage = () => {
  const router = useRouter()
  const {
    activeTab,
    announcementTab,
    onAnnouncementTab,
    fetchAnnouncements,
    announcements,
    loading,
    isRefreshing,
    hasFetched,
    error,
    getFilteredAnnouncements,
  } = useNotificationStore()

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)
  const hasFetchedOnce = useRef(false)

  // Initial fetch only if not fetched and on Announcement tab
  useEffect(() => {
    if (
      hasFetchedOnce.current ||
      loading ||
      isRefreshing ||
      hasFetched ||
      activeTab !== "Announcement"
    ) {
      return
    }
    console.log("Initial fetch triggered: no data fetched")
    hasFetchedOnce.current = true
    fetchAnnouncements()
  }, [loading, isRefreshing, hasFetched, fetchAnnouncements, activeTab])

  // Auto-refresh every 5 minutes (silent)
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === "Announcement") {
        console.log("Silent auto-refresh triggered")
        fetchAnnouncements(false)
      }
    }, 300000) // 5 minutes

    return () => clearInterval(interval)
  }, [fetchAnnouncements, activeTab])

  const handleRefresh = useCallback(() => {
    if (debounceTimeout.current) {
      return
    }
    console.log("Manual refresh triggered")
    debounceTimeout.current = setTimeout(() => {
      if (activeTab === "Announcement") {
        fetchAnnouncements(true)
      }
      debounceTimeout.current = null
    }, 300)
  }, [fetchAnnouncements, activeTab])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }
    }
  }, [])

  const filteredAnnouncements = useMemo(() => {
    const result = getFilteredAnnouncements()
    console.log("Rendered filtered announcements-------:", result)
    return result
  }, [announcementTab, announcements, getFilteredAnnouncements])

  const memoizedColumns = useMemo(() => announcementColumns, [])

  return (
    <div className="flex flex-col gap-y-3 md:gap-y-6 overflow-x-auto max-w-screen">
      <div className="w-full p-4">
        {error && (
          <div className="text-red-500 text-sm text-center mb-4">{error}</div>
        )}
        {/* {(loading || isRefreshing) && (
          <div className="text-center text-muted-foreground mb-4">
            {isRefreshing ? "Refreshing..." : "Loading..."}
          </div>
        )} */}
        <div className="flex justify-between items-center mb-4">
          <PageTabs
            isReminder
            activeTab={announcementTab}
            onTabChange={onAnnouncementTab}
            customTabs={announcementFilterOptions}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
            aria-label={
              isRefreshing
                ? "Refreshing announcements"
                : "Refresh announcements"
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
                title="Announcement"
                description="Manage and Customize your announcements"
                newButton="New Announcement"
                handleClick={() => {
                  router.push("/reminders/create/")
                }}
              />
              {filteredAnnouncements.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground italic">
                  No announcements found for the selected tab ['
                  {announcementTab}'].
                  <Button
                    variant="link"
                    className="p-1 ml-1 text-blue-600 hover:underline"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    aria-label="Retry fetching announcements"
                  >
                    Try refreshing
                  </Button>
                  or creating a new announcement.
                </div>
              ) : (
                <DataTable
                  columns={memoizedColumns}
                  data={filteredAnnouncements}
                  searchFieldName="title"
                />
              )}
            </div>
            <div className="block md:hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAnnouncements.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground italic">
                  No announcements found for the selected tab ['
                  {announcementTab}'].
                  <Button
                    variant="link"
                    className="p-1 ml-1 text-blue-600 hover:underline"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    aria-label="Retry fetching announcements"
                  >
                    Try refreshing
                  </Button>
                  or creating a new announcement.
                </div>
              ) : (
                filteredAnnouncements.map(
                  (announcement: any, index: number) => (
                    <AnnouncementCard
                      key={index}
                      announcement={announcement}
                      filterType={announcementTab}
                    />
                  )
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationTabsPage
