"use client"

import { useState } from "react"
import TablePageHeader from "@/components/shared/table/table-page-header"
import { ticketColumns } from "./ticket-columns"
// import { Ticket } from "@/features/ticket/types/types"
import TicketEditModal from "./ticket-modal"
import { DataTable } from "@/components/table/data-table"
interface Ticket {
  id: string
  userType: string
  subject: string
  ticketDescription: string
  category: string
  priority: string
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
  assignedTo: string
  resolutionDescription: string
  proofFiles: string
  initiatedById: string
  userId: string
  createdAt: string
  updatedAt: string
}
// Dummy ticket data
const dummyTickets: Ticket[] = [
  {
    id: "ticket-001",
    userType: "CUSTOMER",
    subject: "Website Login Issue",
    ticketDescription:
      "Unable to log in to the website; receiving invalid credentials error.",
    category: "TECHNICAL",
    priority: "HIGH",
    status: "OPEN",
    assignedTo: "support-team-1",
    resolutionDescription: "",
    proofFiles: "screenshot.png",
    initiatedById: "user-123",
    userId: "user-123",
    createdAt: "2025-05-10T10:00:00Z",
    updatedAt: "2025-05-10T10:00:00Z",
  },
  {
    id: "ticket-002",
    userType: "CUSTOMER",
    subject: "Billing Dispute",
    ticketDescription: "Charged twice for the same subscription in April.",
    category: "BILLING",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    assignedTo: "billing-team-2",
    resolutionDescription: "Investigating with payment processor.",
    proofFiles: "",
    initiatedById: "user-456",
    userId: "user-456",
    createdAt: "2025-05-08T14:30:00Z",
    updatedAt: "2025-05-09T09:15:00Z",
  },
  {
    id: "ticket-003",
    userType: "CUSTOMER",
    subject: "Feature Request",
    ticketDescription: "Would like to see dark mode added to the mobile app.",
    category: "FEEDBACK",
    priority: "LOW",
    status: "OPEN",
    assignedTo: "",
    resolutionDescription: "",
    proofFiles: "",
    initiatedById: "user-789",
    userId: "user-789",
    createdAt: "2025-05-07T08:45:00Z",
    updatedAt: "2025-05-07T08:45:00Z",
  },
  {
    id: "ticket-004",
    userType: "CUSTOMER",
    subject: "Security Concern",
    ticketDescription:
      "Received suspicious email claiming to be from your platform.",
    category: "SECURITY",
    priority: "URGENT",
    status: "RESOLVED",
    assignedTo: "security-team-3",
    resolutionDescription: "Confirmed phishing attempt; user notified.",
    proofFiles: "email-screenshot.jpg",
    initiatedById: "user-101",
    userId: "user-101",
    createdAt: "2025-05-05T16:20:00Z",
    updatedAt: "2025-05-06T11:00:00Z",
  },
  {
    id: "ticket-005",
    userType: "CUSTOMER",
    subject: "App Crash",
    ticketDescription: "App crashes when trying to upload a profile picture.",
    category: "TECHNICAL",
    priority: "HIGH",
    status: "IN_PROGRESS",
    assignedTo: "tech-team-4",
    resolutionDescription: "Bug identified; fix in progress.",
    proofFiles: "crash-log.txt",
    initiatedById: "user-202",
    userId: "user-202",
    createdAt: "2025-05-03T12:10:00Z",
    updatedAt: "2025-05-04T14:25:00Z",
  },
  {
    id: "ticket-006",
    userType: "CUSTOMER",
    subject: "General Inquiry",
    ticketDescription: "How to reset my account password?",
    category: "GENERAL",
    priority: "LOW",
    status: "CLOSED",
    assignedTo: "support-team-5",
    resolutionDescription: "Provided password reset instructions.",
    proofFiles: "",
    initiatedById: "user-303",
    userId: "user-303",
    createdAt: "2025-04-30T09:00:00Z",
    updatedAt: "2025-04-30T10:30:00Z",
  },
]

const CustomerTicketPage = () => {
  const [ticketData, setTicketData] = useState<Ticket[]>(dummyTickets)
  const [loading, setLoading] = useState(false) // No loading since using dummy data
  const [editTicket, setEditTicket] = useState<Ticket | null>(null)

  const handleModalClose = () => {
    setEditTicket(null)
  }

  if (loading) return <div>Loading tickets...</div>

  return (
    <div className="flex pr-10 md:pr-0 flex-col gap-y-3 md:gap-y-6 overflow-x-auto max-w-screen">
      <TablePageHeader
        title="Customer Ticket"
        description="Manage and Customize your customer ticket"
      />
      {/* <DataTable columns={ticketColumns(setEditTicket)} data={ticketData} /> */}
      <DataTable
        columns={ticketColumns(setEditTicket)}
        data={ticketData}
        searchFieldName="category"
      />
      {editTicket && (
        <TicketEditModal
          ticket={editTicket as Ticket}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}

export default CustomerTicketPage
