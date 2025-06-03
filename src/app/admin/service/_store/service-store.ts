import { create } from "zustand"
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService as apiDeleteService,
} from "@/features/service/api/api"
import { Service } from "@prisma/client"
import { PostServiceData } from "@/features/service/api/api"
import { toast } from "sonner"
import { ApiReturnType } from "../_types/service"

interface ServiceOption {
  label: string
  value: string
}

interface ServiceState {
  services: Service[]
  serviceById: Service | null
  loading: boolean
  isRefreshing: boolean
  activeTab: string
  hasFetched: boolean
  error: string | null
  setServices: (services: Service[]) => void
  fetchServices: (isManualRefresh?: boolean) => Promise<void>
  fetchServiceById: (id: string) => Promise<Service | null>
  createService: (data: PostServiceData) => Promise<void>
  updateService: (id: string, data: PostServiceData) => Promise<void>
  deleteService: (id: string) => Promise<void>
  onActiveTab: (tab: string) => void
  serviceOptions: () => ServiceOption[] // Define as array, computed via getter
}

export const useServiceStore = create<ServiceState>((set, get) => ({
  services: [],
  serviceById: null,
  loading: true,
  isRefreshing: false,
  activeTab: "Active",
  hasFetched: false,
  error: null,

  setServices: (services) => set({ services }),

  fetchServices: async (isManualRefresh = false) => {
    const { hasFetched } = get()
    if (!isManualRefresh && hasFetched) {
      set({ loading: false })
      return
    }
    try {
      set({ [isManualRefresh ? "isRefreshing" : "loading"]: true, error: null })
      const response: ApiReturnType<Service[]> = await getServices()
      const { data, success, message } = response
      console.log("fetchServices: Response =", response)

      if (success && Array.isArray(data)) {
        console.log("fetchServices: Fetched services =", data)
        set({ services: data, hasFetched: true })
        if (isManualRefresh) {
          const latestService = data[0]
          const toastMessage = data.length
            ? `Fetched ${data.length} services.${
                latestService
                  ? ` Latest: ${latestService.title} (${latestService.status})`
                  : ""
              }`
            : "No services found"
          toast.success(toastMessage, { id: "fetch-services" })
        }
      } else {
        set({ error: message || "Failed to fetch services", loading: false })
        toast.error(message || "Failed to fetch services", {
          id: "fetch-services",
        })
      }
    } catch (error) {
      console.error("fetchServices: Error =", error)
      set({ error: "Failed to load services", loading: false })
      toast.error("Failed to load services", { id: "fetch-services" })
    } finally {
      set({ [isManualRefresh ? "isRefreshing" : "loading"]: false })
    }
  },

  fetchServiceById: async (id: string) => {
    try {
      const response: ApiReturnType<Service> = await getServiceById(id)
      if (response.success && response.data && !Array.isArray(response.data)) {
        return {
          ...response.data,
        }
      } else {
        const errorMessage =
          response.message || response.error || "Failed to fetch service"
        toast.error(errorMessage, { id: "fetch-service" })
        return null
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch service"
      toast.error(errorMessage, { id: "fetch-service" })
      return null
    }
  },

  createService: async (data: PostServiceData) => {
    try {
      set({ loading: true, error: null })
      const {
        success,
        data: newService,
        message,
        error,
      } = await createService(data)
      if (success && newService) {
        set((state) => ({
          services: [
            {
              ...newService,
              createdAt: new Date(newService.createdAt),
              updatedAt: new Date(newService.updatedAt),
            } as Service,
            ...state.services,
          ],
        }))
        toast.success(message || "Service created successfully")
      } else {
        const errorMsg = message || "Failed to create service"
        set({ error: errorMsg })
        toast.error(errorMsg)
        throw new Error(error || "Failed to create service")
      }
    } catch (error) {
      console.error("useServiceStore: createService: Error =", error)
      set({ error: "Failed to create service" })
      toast.error("Failed to create service")
    } finally {
      set({ loading: false })
    }
  },

  updateService: async (id: string, data: PostServiceData) => {
    try {
      set({ loading: true, error: null })
      const {
        success,
        data: updatedService,
        message,
        error,
      } = await updateService(id, data)
      if (success && updatedService) {
        set((state) => ({
          services: state.services.map((service) =>
            service.id === id
              ? {
                  ...service,
                  ...updatedService,
                  createdAt: new Date(updatedService.createdAt),
                  updatedAt: new Date(updatedService.updatedAt),
                }
              : service
          ),
          serviceById:
            state.serviceById?.id === id
              ? {
                  ...state.serviceById,
                  ...updatedService,
                  createdAt: new Date(updatedService.createdAt),
                  updatedAt: new Date(updatedService.updatedAt),
                }
              : state.serviceById,
        }))
        toast.success(message || "Service updated successfully")
      } else {
        const errorMsg = message || "Failed to update service"
        set({ error: errorMsg })
        toast.error(errorMsg)
        throw new Error(error || "Failed to update service")
      }
    } catch (error) {
      console.error("useServiceStore: updateService: Error =", error)
      set({ error: "Failed to update service" })
      toast.error("Failed to update service")
    } finally {
      set({ loading: false })
    }
  },

  deleteService: async (id: string) => {
    try {
      set({ loading: true, error: null })
      const { success, message, error } = await apiDeleteService(id)
      if (success) {
        set((state) => ({
          services: state.services.filter((item) => item.id !== id),
          serviceById: state.serviceById?.id === id ? null : state.serviceById,
        }))
        toast.success(message || "Service deleted successfully")
      } else {
        const errorMsg = message || "Failed to delete service"
        set({ error: errorMsg })
        toast.error(errorMsg)
        throw new Error(error || "Failed to delete service")
      }
    } catch (error) {
      console.error("useServiceStore: deleteService: Error =", error)
      set({ error: "Failed to delete service" })
      toast.error("Failed to delete service")
    } finally {
      set({ loading: false })
    }
  },

  onActiveTab: (tab) => set({ activeTab: tab.toLowerCase() }),

  // Define serviceOptions as a getter
  serviceOptions: () => {
    const { services } = get()
    return services.map((service) => ({
      label: service.title,
      value: service.id,
    })) as ServiceOption[]
  },
}))
