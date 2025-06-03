import ServiceForm from "@/features/service/components/admin/form/edit/edit-service-form"
import ServiceFormSkeleton from "@/features/service/components/skeleton-form"
import { useServiceStore } from "../../_store/service-store"
import { useBusinessStore } from "@/app/admin/business-settings/_store/business-store"
import { getServiceById } from "@/db/service"

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const serviceDetail = await getServiceById(id)

  console.log(serviceDetail, "serviceDetail")
  if (!id) return <ServiceFormSkeleton />

  return <ServiceForm serviceDetail={serviceDetail} />
}
