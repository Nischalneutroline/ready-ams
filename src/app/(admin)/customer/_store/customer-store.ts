import { create } from "zustand"
import { toast } from "sonner"
import {
  PostCustomerData,
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "@/app/(admin)/customer/_api-call/customer-api-call"
import { ApiReturnType, User, loggedInUser } from "../_types/customer"

interface CustomerState {
  activeTab: string
  customers: User[]
  loggedInUser: loggedInUser | null
  loading: boolean
  isRefreshing: boolean
  hasFetched: boolean
  error: string | null
  setLoggedInUser: (user: loggedInUser) => void
  onActiveTab: (tab: string) => void
  fetchCustomers: (isManualRefresh?: boolean) => Promise<void>
  createCustomer: (
    data: PostCustomerData
  ) => Promise<{ success: boolean; message?: string; errorMessage?: string }>
  getCustomerById: (id: string) => Promise<User | null>
  updateCustomer: (
    id: string,
    data: PostCustomerData
  ) => Promise<{ success: boolean; message?: string; errorMessage?: string }>
  deleteCustomer: (
    id: string
  ) => Promise<{ success: boolean; message?: string; errorMessage?: string }>
  getFilteredCustomers: () => User[]
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  activeTab: "All",
  customers: [],
  loading: true,
  isRefreshing: false,
  hasFetched: false,
  error: null,
  loggedInUser: null,

  setLoggedInUser: (user) => set({ loggedInUser: user }),

  onActiveTab: (tab: string) => set({ activeTab: tab }),

  fetchCustomers: async (isManualRefresh = false) => {
    const { hasFetched } = get()
    if (!isManualRefresh && hasFetched) {
      set({ loading: false })
      return
    }
    try {
      set({ [isManualRefresh ? "isRefreshing" : "loading"]: true, error: null })
      const response: ApiReturnType<User[]> = await getCustomers()
      console.log("fetchCustomers response:", response)

      if (response.success && Array.isArray(response.data)) {
        const normalizedCustomers = response.data.map((customer) => ({
          ...customer,
          createdAt: new Date(customer.createdAt),
          updatedAt: new Date(customer.updatedAt),
          isActive: customer.isActive ?? true,
        }))
        set({ customers: normalizedCustomers, hasFetched: true })
        if (isManualRefresh) {
          const latestCustomer = normalizedCustomers[0]
          const toastMessage = normalizedCustomers.length
            ? `Fetched ${normalizedCustomers.length} customers.${
                latestCustomer
                  ? ` Latest: ${latestCustomer.name} (${latestCustomer.isActive ? "Active" : "Inactive"})`
                  : ""
              }`
            : "No customers found"
          toast.success(toastMessage, { id: "fetch-customers" })
        }
      } else {
        const errorMessage =
          response.message || response.error || "Failed to load customers"
        set({ customers: [], error: errorMessage })
        if (isManualRefresh) {
          toast.error(errorMessage, { id: "fetch-customers" })
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch customers"
      set({ customers: [], error: errorMessage })
      if (isManualRefresh) {
        toast.error(errorMessage, { id: "fetch-customers" })
      }
    } finally {
      set({ [isManualRefresh ? "isRefreshing" : "loading"]: false })
    }
  },

  createCustomer: async (postData: PostCustomerData) => {
    console.log(postData, "PostData in store")
    try {
      const response: ApiReturnType<User> = await createCustomer(postData)
      console.log(
        response.data,
        "response data after the invitation is sent and its is updated into the store"
      )
      if (response.success && response.data && !Array.isArray(response.data)) {
        const newCustomer = {
          ...response.data,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt,
          isActive: response.data.isActive ?? true,
        }
        set((state) => ({
          customers: [newCustomer, ...state.customers],
        }))
        toast.success(response.message || "Customer created successfully", {
          id: "create-customer",
        })
        return {
          success: true,
          message: response.message || "Customer created successfully",
        }
      } else {
        const errorMessage =
          response.message || response.error || "Failed to create customer"
        toast.error(errorMessage, { id: "create-customer" })
        return { success: false, errorMessage }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create customer"
      toast.error(errorMessage, { id: "create-customer" })
      return { success: false, errorMessage }
    }
  },

  getCustomerById: async (id: string): Promise<User | null> => {
    try {
      const response: ApiReturnType<User> = await getCustomerById(id)
      console.log("getCustomerById response:", response)
      if (response.success && response.data && !Array.isArray(response.data)) {
        return {
          ...response.data,
          isActive: response.data.isActive ?? true,
        }
      } else {
        const errorMessage =
          response.message || response.error || "Failed to fetch customer"
        toast.error(errorMessage, { id: "fetch-customer" })
        return null
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch customer"
      toast.error(errorMessage, { id: "fetch-customer" })
      return null
    }
  },

  updateCustomer: async (id: string, postData: PostCustomerData) => {
    try {
      const response: ApiReturnType<User> = await updateCustomer(id, postData)
      if (response.success && response.data && !Array.isArray(response.data)) {
        const updatedCustomer = {
          ...response.data,
          createdAt: new Date(response.data.createdAt),
          updatedAt: new Date(response.data.updatedAt),
          isActive: response.data.isActive ?? true,
        }
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === id ? updatedCustomer : customer
          ),
        }))
        toast.success(response.message || "Customer updated successfully", {
          id: "update-customer",
        })
        return {
          success: true,
          message: response.message || "Customer updated successfully",
        }
      } else {
        const errorMessage =
          response.message || response.error || "Failed to update customer"
        toast.error(errorMessage, { id: "update-customer" })
        return { success: false, errorMessage }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update customer"
      toast.error(errorMessage, { id: "update-customer" })
      return { success: false, errorMessage }
    }
  },

  deleteCustomer: async (id: string) => {
    try {
      const response: ApiReturnType<null> = await deleteCustomer(id)
      if (response.success) {
        set((state) => ({
          customers: state.customers.filter((customer) => customer.id !== id),
        }))
        toast.success(response.message || "Customer deleted successfully", {
          id: "delete-customer",
        })
        return {
          success: true,
          message: response.message || "Customer deleted successfully",
        }
      } else {
        const errorMessage =
          response.message || response.error || "Failed to delete customer"
        toast.error(errorMessage, { id: "delete-customer" })
        return { success: false, errorMessage }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete customer"
      toast.error(errorMessage, { id: "delete-customer" })
      return { success: false, errorMessage }
    }
  },

  getFilteredCustomers: () => {
    const { customers, activeTab } = get()
    if (!Array.isArray(customers)) {
      console.warn(
        "getFilteredCustomers: customers is not an array:",
        customers
      )
      return []
    }
    return customers.filter((customer) => {
      if (activeTab === "Active") {
        return customer.isActive === true
      } else if (activeTab === "Inactive") {
        return customer.isActive === false
      }
      return true // 'All' tab
    })
  },
}))
