"use client"

import React, { useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/table/data-table"
import PageTabs from "@/components/table/page-tabs"
import TablePageHeader from "@/components/table/table-header"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import DataTableSkeleton from "@/components/table/skeleton-table"
import { useServiceStore } from "./_store/service-store"
import { columns } from "./_components/column"

const pageOptions = ["Active", "Inactive", "All"]

const ServicePage = () => {
  const router = useRouter()
  const {
    services,
    loading,
    isRefreshing,
    hasFetched,
    activeTab,
    onActiveTab,
    fetchServices,
    deleteService,
  } = useServiceStore()

  // Handle delete
  // useCallback stabilizes prop for memoizedColumns/DataTable
  // Memory: ~10 bytes, prevents DataTable re-renders
  const handleDelete = useCallback(
    async (id: string) => {
      await deleteService(id)
    },
    [deleteService]
  )

  // Manual refresh handler
  // No useCallback: lightweight, not a prop for memoized components
  // Memory: 0 bytes (recreated on render, negligible CPU cost)
  const handleRefresh = () => {
    fetchServices(true) // Triggers toast
  }

  // Filter services based on activeTab
  // useMemo caches filtered array, critical for large datasets
  // Memory: ~100KB-10MB (depends on services size), prevents expensive re-filtering
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      switch (activeTab.toLowerCase()) {
        case "active":
          return service.status?.toUpperCase() === "ACTIVE"
        case "inactive":
          return service.status?.toUpperCase() === "INACTIVE"
        case "all":
        default:
          return true
      }
    })
  }, [services, activeTab])

  // Memoized columns
  // useMemo stabilizes prop for DataTable
  // Memory: ~1KB (column definitions), prevents DataTable re-renders
  const memoizedColumns = useMemo(() => columns(handleDelete), [handleDelete])

  return (
    <div className="h-full w-full flex flex-col">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          {/* pageOptions not memoized: small array, stable reference unnecessary */}
          <PageTabs
            activeTab={activeTab}
            onTabChange={onActiveTab} // Store function, stable
            customTabs={pageOptions}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
        <TablePageHeader
          title="Services"
          description="Manage and Customize Services Here."
          newButton="New Service"
          route="/service/create/"
        />
        {loading && !hasFetched ? (
          <DataTableSkeleton />
        ) : filteredServices.length === 0 ? (
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
              data={filteredServices}
              searchFieldName="title"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ServicePage
