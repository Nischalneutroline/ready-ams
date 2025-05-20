import { getBaseUrl } from "@/lib/baseUrl"
import axios, { AxiosError } from "axios"
import {
  User,
  Address,
  Role,
  ApiReturnType,
  AxiosResponseType,
} from "@/app/(admin)/customer/_types/customer"

// Define the data structure for creating/updating customers
export interface PostCustomerData {
  id?: string // Optional for create, required for update
  email: string
  password?: string // Optional for update
  name: string
  phone?: string
  role: Role
  isActive?: boolean
  address?: Address
}

// API return type for responses

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
})

// --- CRUD Functions for Customers ---

async function getCustomers(): Promise<ApiReturnType<User[]>> {
  try {
    const response = (await api.get("/api/user")) as AxiosResponseType<User[]>
    const { data, success, message, error } = response.data
    console.log("customer get response", data)

    if (success && Array.isArray(data)) {
      const normalizedData = data.map((customer) => ({
        ...customer,
        createdAt: customer.createdAt
          ? new Date(customer.createdAt)
          : new Date(),
        updatedAt: customer.updatedAt
          ? new Date(customer.updatedAt)
          : new Date(),
      }))
      return { data: normalizedData, success, message }
    }

    return {
      success: false,
      message: message || "Failed to fetch customers",
      error: error || "Invalid response data",
    }
  } catch (error: any) {
    console.error("Error fetching customers:", error)
    const errorMsg =
      error instanceof AxiosError && error.response?.data?.message
    return {
      success: false,
      message: errorMsg,
      error: error.toString(),
    }
  }
}

async function getCustomerById(id: string): Promise<ApiReturnType<User>> {
  try {
    const response: AxiosResponseType<User> = await api.get(`/api/user/${id}`)
    const { data: customer } = response.data // Direct User object

    console.log("customer get by id response", response)
    if (customer) {
      const normalizedCustomer = {
        ...customer,
      }
      return {
        success: true,
        data: normalizedCustomer,
        message: "Customer fetched successfully",
      }
    } else {
      return {
        success: false,
        message: "Customer not found",
        error: "Customer not found",
      }
    }
  } catch (error) {
    console.error(`Error fetching customer by ID (${id}):`, error)
    const errorMsg =
      error instanceof AxiosError
        ? error.response?.data?.message || error.message
        : "An unknown error occurred"
    return {
      success: false,
      message: errorMsg || `Failed to fetch customer ${id}`,
      error: errorMsg,
    }
  }
}

async function createCustomer(
  customerData: PostCustomerData
): Promise<ApiReturnType<User>> {
  try {
    const response: AxiosResponseType<User> = await api.post(
      "/api/user",
      customerData
    )
    const responseData = response.data
    console.log("customer create response", responseData)

    if (responseData.success && responseData.data) {
      const normalizedData = {
        ...responseData.data,
        createdAt: responseData.data.createdAt
          ? new Date(responseData.data.createdAt)
          : new Date(),
        updatedAt: responseData.data.updatedAt
          ? new Date(responseData.data.updatedAt)
          : new Date(),
      }
      return {
        ...responseData,
        data: normalizedData,
      }
    }

    return {
      success: false,
      message: responseData.message || "Failed to create customer",
      error: responseData.error || "Invalid response data",
    }
  } catch (error) {
    console.error("Error creating customer:", error)
    const errorMsg =
      error instanceof AxiosError
        ? error.response?.data?.message || error.message
        : "An unknown error occurred"
    return {
      success: false,
      message: errorMsg || "Failed to create customer",
      error: error as string,
    }
  }
}

async function updateCustomer(
  id: string,
  customerData: PostCustomerData
): Promise<ApiReturnType<User>> {
  try {
    const response: AxiosResponseType<User> = await api.put(
      `/api/user/${id}`,
      customerData
    )
    const { data: responseData, message, success, error } = response.data

    if (success && responseData) {
      const normalizedUser = {
        ...responseData,
        // createdAt: responseData.user.createdAt
        //   ? new Date(responseData.user.createdAt)
        //   : new Date(),
        // updatedAt: responseData.user.updatedAt
        //   ? new Date(responseData.user.updatedAt)
        //   : new Date(),
      }
      return {
        success,
        data: normalizedUser,
        message: message,
      }
    }

    return {
      success: false,
      message: message || "Failed to update customer",
      error: error || "Invalid response data",
    }
  } catch (error) {
    console.error(`Error updating customer (${id}):`, error)
    const errorMsg =
      error instanceof AxiosError
        ? error.response?.data?.message || error.message
        : "An unknown error occurred"
    return {
      success: false,
      message: errorMsg || "Failed to update customer",
      error: errorMsg,
    }
  }
}

async function deleteCustomer(
  id: string
): Promise<Pick<ApiReturnType, "success" | "error" | "message">> {
  try {
    const response = await api.delete(`/api/user/${id}`)
    const responseData = response.data as { message: string }

    return {
      success: true,
      message: responseData.message || "Customer deleted successfully",
    }
  } catch (error) {
    console.error(`Error deleting customer (${id}):`, error)
    const errorMsg =
      error instanceof AxiosError
        ? error.response?.data?.message || error.message
        : "An unknown error occurred"
    return {
      success: false,
      message: errorMsg || "Failed to delete customer",
      error: errorMsg,
    }
  }
}

export {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
}
