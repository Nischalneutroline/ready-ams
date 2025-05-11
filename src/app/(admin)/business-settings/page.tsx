"use client"

import { useEffect } from "react"
import Heading from "@/components/admin/heading"
import { Settings } from "lucide-react"
import Breadcrumbs from "@/components/shared/bread-crumb"
import PageTabs from "@/features/business-detail/components/page-tabs"
import { Card } from "@/components/ui/card"
import BusinessDetailForm from "@/features/business-detail/components/business-detail-form"
import { toast } from "sonner"
import { useBusinessStore } from "./_store/business-store"
import BusinessSettingsForm from "@/features/business-detail/components/business-avaialability-form"

const BusinessPage = () => {
  const {
    selectedBusiness,
    businessData,
    activeTab,
    setActiveTab,
    loading,
    error,
  } = useBusinessStore()

  useEffect(() => {
    if (error) {
      console.log("BusinessPage: Error:", error)
      toast.error("Failed to fetch business data: " + error)
    }
  }, [error])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <main className="h-full flex flex-col">
      <Breadcrumbs />
      <div>
        <Heading
          title="Business Settings"
          description="Manage and Customize your business"
          icon={<Settings />}
        />
      </div>
      <Card className="h-full overflow-x-hidden overflow-y-auto p-4 md:p-6">
        <PageTabs
          activeTab={activeTab}
          onTabChange={(tab) =>
            setActiveTab(
              tab as "Business Detail" | "Business hour & Availability"
            )
          }
        />
        {activeTab === "Business Detail" ? (
          <BusinessDetailForm businessData={businessData} />
        ) : (
          <BusinessSettingsForm business={businessData} />
        )}
      </Card>
    </main>
  )
}

export default BusinessPage
