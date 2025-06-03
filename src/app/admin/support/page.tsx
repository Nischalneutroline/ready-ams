// pages/support.tsx (or wherever your SupportPage is located)
"use client"

// Import React and components
import PageTabs from "@/features/business-detail/components/page-tabs"
import { Card } from "@/components/ui/card"
import ContactInformationForm from "@/features/help-support/components/contact-info"
import FAQSection from "@/features/help-support/components/faq"
import AdminSupportForm from "@/features/help-support/components/admin-support"
import Breadcrumbs from "@/components/shared/bread-crumb"
import Heading from "@/components/admin/heading"
import { UserCog } from "lucide-react"
import CustomerTicketPage from "@/features/help-support/components/customer-ticket-page"
import { TabMapKey, useSupportTabsStore } from "./_store/support-store"

// Define the SupportPage component
const SupportPage = () => {
  // Get state and actions from the Zustand store
  const {
    activeTab,
    tabMap,
    tabs,
    mTabs,
    setActiveTab,
    handleMobileTabChange,
  } = useSupportTabsStore()

  return (
    <div>
      {/* Show breadcrumbs for navigation */}
      <Breadcrumbs />

      {/* Show page heading with title, description, and icon */}
      <div>
        <Heading
          title="Support"
          description="Manage your support and customer service"
          icon={<UserCog />}
        />
      </div>

      {/* Card container for tabs and content, with padding and scroll */}
      <Card className="h-full overflow-y-auto p-4 md:p-6">
        {/* Desktop Tabs: Shown only on medium and larger screens */}
        <PageTabs
          activeTab={activeTab} // Use desktop tab name (e.g., "Contact Information")
          onTabChange={setActiveTab} // Update activeTab when clicked
          customTabs={tabs} // Use desktop tab names
          className="hidden md:block" // Hide on mobile, show on desktop
        />

        {/* Mobile Tabs: Shown only on small screens */}
        <PageTabs
          activeTab={
            // Convert desktop activeTab (e.g., "Contact Information") to mobile tab name (e.g., "Contact")
            // Object.keys(tabMap) gets mobile tab names, but TypeScript needs help to know they match TabMapKey
            (Object.keys(tabMap) as TabMapKey[]).find(
              (key) => tabMap[key] === activeTab
            ) ||
            // If no match is found (e.g., invalid activeTab), default to "Contact"
            "Contact"
          }
          onTabChange={handleMobileTabChange} // Handle mobile tab clicks
          customTabs={mTabs} // Use mobile tab names
          className="block md:hidden" // Show on mobile, hide on desktop
        />

        {/* Show content based on activeTab (uses desktop tab names) */}
        {activeTab === "Contact Information" && <ContactInformationForm />}
        {activeTab === "Frequently Asked Questions (FAQs)" && <FAQSection />}
        {activeTab === "Customer Support" && <CustomerTicketPage />}
        {activeTab === "Admin Support" && <AdminSupportForm />}
      </Card>
    </div>
  )
}

export default SupportPage
