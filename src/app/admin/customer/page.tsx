"use client"

import { useEffect, useMemo, useCallback, useRef } from "react"
import PageTabs from "@/components/table/page-tabs"
import TablePageHeader from "@/components/table/table-header"
import { columns } from "./_components/column"
import { DataTable } from "@/components/table/data-table"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import DataTableSkeleton from "@/components/table/skeleton-table"
import { useCustomerStore } from "./_store/customer-store"
import { cn } from "@/utils/utils"

const pageOptions = ["Active", "Inactive", "All"]
const REFETCH_INTERVAL = 5 * 60 * 1000 // 5 minutes

const CustomerPage = () => {
  const {
    activeTab,
    onActiveTab,
    customers,
    loading,
    isRefreshing,
    fetchCustomers,
    deleteCustomer,
    hasFetched,
    getFilteredCustomers,
  } = useCustomerStore()

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)
  const hasFetchedOnce = useRef(false) // Track if fetch has been attempted

  // Initial fetch only if not fetched
  useEffect(() => {
    if (hasFetchedOnce.current || loading || isRefreshing || hasFetched) {
      return // Skip if already fetched, loading, or refreshing
    }
    console.log("Initial fetch triggered: no data fetched")
    hasFetchedOnce.current = true
    fetchCustomers()
  }, [loading, isRefreshing, hasFetched, fetchCustomers])

  // Auto-refresh every 5 minutes (silent)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Silent auto-refresh triggered")
      fetchCustomers(false) // Silent refresh
    }, REFETCH_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchCustomers])

  // Handle delete
  const handleDelete = useCallback(
    async (id: string) => {
      await deleteCustomer(id) // Store handles toast
      console.log(`Deleted customer with id: ${id}`)
    },
    [deleteCustomer]
  )

  // Manual refresh handler
  const handleRefresh = useCallback(() => {
    if (debounceTimeout.current) {
      return
    }
    console.log("Manual refresh triggered")
    debounceTimeout.current = setTimeout(() => {
      fetchCustomers(true)
      debounceTimeout.current = null
    }, 300)
  }, [fetchCustomers])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }
    }
  }, [])

  // Memoized filtered customers
  const filteredCustomers = useMemo(() => {
    const result = getFilteredCustomers()
    console.log("filteredCustomers:", result)
    return result
  }, [customers, activeTab, getFilteredCustomers])

  // Memoized columns
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
              isRefreshing ? "Refreshing customers" : "Refresh customers"
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
          title="Customer"
          description="Manage and Customize Customer Here."
          newButton="New Customer"
          route="/customer/create/"
        />
        {loading && !hasFetched ? (
          <DataTableSkeleton />
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground italic">
            No customers found for the selected tab
            {activeTab !== "All" ? ` ['${activeTab}']` : ""}.
            <Button
              variant="link"
              className="p-1 ml-1 text-blue-600 hover:underline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              aria-label="Retry fetching customers"
            >
              Try refreshing
            </Button>
            or creating a new customer.
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <DataTable
              columns={memoizedColumns}
              data={filteredCustomers}
              searchFieldName="name"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerPage
