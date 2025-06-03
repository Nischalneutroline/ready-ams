"use client"

// import { useEffect, useState } from "react"
import ServiceForm, {
  // BusinessAvailability,
} from "@/features/service/components/admin/form/add/service-form"
// import ServiceFormSkeleton from "@/features/service/components/skeleton-form"
// import { useBusinessStore } from "../../business-settings/_store/business-store"
// import { Button } from "@/components/ui/button"
// import Link from "next/link"

const ServicePage = () => {
  // const { selectedBusiness, hasFetched, loading, error, fetchBusinessById } =
  //   useBusinessStore()
  // const [fetchAttempted, setFetchAttempted] = useState(false)

  // // Owner ID for fetching businesses
  // // INSERT OWNER ID HERE: Replace with cmacg3d560000ms5cuttqj6ev
  // const id = "cmaf21ts20001mslb8x0e7bt9" // Updated to match provided business data
  // const businessOwnerId = id
  // // Fetch businesses on mount if not already fetched
  // useEffect(() => {
  //   if (!hasFetched && !loading && !fetchAttempted) {
  //     console.log(
  //       "ServicePage: Triggering fetchBusinesses for owner:",
  //       businessOwnerId
  //     )
  //     setFetchAttempted(true)
  //     fetchBusinessById(businessOwnerId)
  //   }
  // }, [hasFetched, loading, fetchBusinessById, fetchAttempted, businessOwnerId])

  // // Log state for debugging
  // useEffect(() => {
  //   console.log("ServicePage: State =", {
  //     hasFetched,
  //     loading,

  //     error,
  //   })
  // }, [hasFetched, loading, error])

  // // Show skeleton during initial load
  // if (loading || !hasFetched) {
  //   return <ServiceFormSkeleton />
  // }

  // // Show error or no businesses message
  // if (error) {
  //   return (
  //     <div className="p-6">
  //       <h2 className="text-lg font-semibold">
  //         {error ? "Error Loading Businesses" : "No Businesses Found"}
  //       </h2>
  //       <p className="mt-2">
  //         {error
  //           ? `An error occurred: ${error}`
  //           : "Please create a business before adding a service."}
  //       </p>
  //       <Button asChild className="mt-4">
  //         <Link href="/business-settings">
  //           {error ? "Try Again" : "Create Business"}
  //         </Link>
  //       </Button>
  //     </div>
  //   )
  // }

  // // Use the first business by default
  // const defaultBusiness = selectedBusiness
  // const businessAvailability = businessAvailabilities[defaultBusiness.id] || {
  //   breaks: {
  //     Mon: [],
  //     Tue: [],
  //     Wed: [],
  //     Thu: [],
  //     Fri: [],
  //     Sat: [],
  //     Sun: [],
  //   },
  //   holidays: [],
  // }

  return <ServiceForm />
}

export default ServicePage
