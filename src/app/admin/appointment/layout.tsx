// app/(admin)/appointments/layout.tsx
import Heading from "@/components/admin/heading"
import { CalendarDays } from "lucide-react"
import { Card } from "@/components/ui/card"
import PageHeader from "@/components/shared/page-header"

const AppointmentLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="">
      <PageHeader>
        <Heading
          title="Create New Appointment"
          description="Schedule a new appointment"
          icon={<CalendarDays />}
        />
      </PageHeader>
      <Card className="p-4 flex-1 md:p-6 h-full overflow-auto ">
        {children}
      </Card>
    </main>
  )
}

export default AppointmentLayout
