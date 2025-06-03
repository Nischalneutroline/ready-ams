"use client"

import { useEffect, useMemo, useCallback, useRef } from "react"

import { DataTable } from "@/components/table/data-table"
import PageTabs from "@/components/table/page-tabs"
import TablePageHeader from "@/components/table/table-header"
import DataTableSkeleton from "@/components/table/skeleton-table"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { cn } from "@/utils/utils"
import { columns } from "./_components/column"
import { useAppointmentStore } from "./_store/appointment-store"


const pageOptions = [
  "Today",
  "Upcoming",
  "Completed",
  "Cancelled",
  "Missed",
  "All",
]

const AppointmentPage = () => {
  const {
    activeTab,
    onActiveTab,
    getFilteredAppointments,
    deleteAppointment,
    fetchAppointments,
    appointments,
    loading,
    isRefreshing,
    hasFetched,
  } = useAppointmentStore()

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)
  const hasFetchedOnce = useRef(false) // Track if fetch has been attempted

  // Initial fetch only if not fetched
  useEffect(() => {
    if (hasFetchedOnce.current || loading || isRefreshing || hasFetched) {
      return // Skip if already fetched, loading, or refreshing
    }
    console.log("Initial fetch triggered: no data fetched")
    hasFetchedOnce.current = true
    fetchAppointments()
  }, [loading, isRefreshing, hasFetched, fetchAppointments])

  // Auto-refresh every 5 minutes (silent)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Silent auto-refresh triggered")
      fetchAppointments(false) // Silent refresh
    }, 300000) // 5 minutes

    return () => clearInterval(interval)
  }, [fetchAppointments])

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteAppointment(id)
    },
    [deleteAppointment]
  )

  const handleRefresh = useCallback(() => {
    if (debounceTimeout.current) {
      return
    }
    console.log("Manual refresh triggered")
    debounceTimeout.current = setTimeout(() => {
      fetchAppointments(true)
      debounceTimeout.current = null
    }, 300)
  }, [fetchAppointments])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }
    }
  }, [])

  const filteredAppointments = useMemo(() => {
    const result = getFilteredAppointments()
    console.log("Rendered filtered appointments:", result)
    return result
  }, [activeTab, appointments, getFilteredAppointments])

  const memoizedColumns = useMemo(() => columns(handleDelete), [handleDelete])

  return (
    <div className="h-full w-full flex flex-col">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <PageTabs
            isReminder
            activeTab={activeTab}
            onTabChange={onActiveTab}
            customTabs={pageOptions}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
            aria-label={
              isRefreshing ? "Refreshing appointments" : "Refresh appointments"
            }
            aria-busy={isRefreshing}
          >
            <RefreshCw
              className={cn("h-4 w-4", isRefreshing && "animate-spin")}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
        <TablePageHeader
          title="Appointment"
          description="Manage and Customize Appointment Here."
          newButton="New Appointment"
          route="/appointment/create/"
        />
        {loading && !hasFetched ? (
          <DataTableSkeleton />
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground italic">
            No appointments found for the selected tab
            {activeTab !== "All" ? ` ['${activeTab}']` : ""}.
            <Button
              variant="link"
              className="p-1 ml-1 text-blue-600 hover:underline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              aria-label="Retry fetching appointments"
            >
              Try refreshing
            </Button>
            or creating a new appointment.
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <DataTable
              columns={memoizedColumns}
              data={filteredAppointments}
              searchFieldName="customerName"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default AppointmentPage
