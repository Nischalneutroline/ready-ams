import { getBaseUrl } from "@/lib/baseUrl"
import axios, { AxiosError, AxiosResponse } from "axios"
import {
  ApiReturnType,
  AxiosResponseType,
} from "@/app/admin/service/_types/service"
import { Service } from "@prisma/client"
import { err } from "inngest/types"

// Define the data structure for creating/updating services
export interface ServiceAvailability {
  day: string
  startTime: string
  endTime: string
}

export interface PostServiceData {
  id?: string // Optional for create, required for update
  title: string
  description: string
  estimatedDuration: number
  status: string
  serviceAvailability?: ServiceAvailability[]
  businessDetailId?: string
  createdAt: string
  updatedAt: string
}

// API instance
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
})

// --- CRUD Functions for Services ---
async function getServices(): Promise<ApiReturnType<Service[]>> {
  try {
    const response = (await api.get("/api/service")) as AxiosResponse<
      ApiReturnType<Service[]>
    >
    const { data, success, message, error } = response.data
    console.log("getServices: Response data =", data)

    if (success && Array.isArray(data)) {
      const normalizedData = data.map((service) => ({
        ...service,
      }))
      return { data: normalizedData, success, message }
    } else {
      return {
        success: false,
        message: message || "Failed to fetch services",
        error: error || "Invalid response data",
      }
    }
  } catch (error: any) {
    const errorMsg =
      error instanceof AxiosError && error.response?.data?.message
        ? error.response.data.message
        : "An unknown error occurred"
    // console.error("getServices: Error fetching services:", {
    //   message: errorMsg,
    //   status: error.response?.status,
    //   url: error.config?.url,
    // })
    return {
      success: false,
      message: errorMsg,
      error: error.toString(),
    }
  }
}

async function getServiceById(id: string): Promise<ApiReturnType<Service>> {
  try {
    const response: AxiosResponseType<Service> = await api.get(
      `/api/service/${id}`
    )
    const { data: service } = response.data // Direct Service object

    if (service) {
      const normalizedService = {
        ...service,
      }
      return {
        success: true,
        data: normalizedService,
        message: "Service fetched successfully",
      }
    }

    return {
      success: false,
      message: "Service not found",
      error: "Service not found",
    }
  } catch (error) {
    console.error(`Error fetching service by ID (${id}):`, error)
    const errorMsg =
      error instanceof AxiosError
        ? error.response?.data?.message || error.message
        : "An unknown error occurred"
    return {
      success: false,
      message: errorMsg || `Failed to fetch service ${id}`,
      error: errorMsg,
    }
  }
}

async function createService(
  serviceData: PostServiceData
): Promise<ApiReturnType<Service>> {
  try {
    const response: AxiosResponseType<Service> = await api.post(
      "/api/service",
      serviceData
    )
    const responseData = response.data
    console.log("service create response", responseData)

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
      message: responseData.message || "Failed to create service",
      error: responseData.error || "Invalid response data",
    }
  } catch (error) {
    console.error("Error creating service:", error)
    const errorMsg =
      error instanceof AxiosError
        ? error.response?.data?.message || error.message
        : "An unknown error occurred"
    return {
      success: false,
      message: errorMsg || "Failed to create service",
      error: errorMsg,
    }
  }
}

async function updateService(
  id: string,
  serviceData: PostServiceData
): Promise<ApiReturnType<Service>> {
  try {
    const response: AxiosResponseType<Service> = await api.put(
      `/api/service/${id}`,
      serviceData
    )
    const { data: responseData, message, success, error } = response.data

    if (success && responseData) {
      const normalizedService = {
        ...responseData,
        createdAt: responseData.createdAt
          ? new Date(responseData.createdAt)
          : new Date(),
        updatedAt: responseData.updatedAt
          ? new Date(responseData.updatedAt)
          : new Date(),
      }
      return {
        success,
        data: normalizedService,
        message: message,
      }
    }

    return {
      success: false,
      message: message || "Failed to update service",
      error: error || "Invalid response data",
    }
  } catch (error) {
    console.error(`Error updating service (${id}):`, error)
    const errorMsg =
      error instanceof AxiosError
        ? error.response?.data?.message || error.message
        : "An unknown error occurred"
    return {
      success: false,
      message: errorMsg || "Failed to update service",
      error: errorMsg,
    }
  }
}

async function deleteService(
  id: string
): Promise<Pick<ApiReturnType, "success" | "error" | "message">> {
  try {
    const response = await api.delete(`/api/service/${id}`)
    const responseData = response.data as { message: string }

    return {
      success: true,
      message: responseData.message || "Service deleted successfully",
    }
  } catch (error) {
    console.error(`Error deleting service (${id}):`, error)
    const errorMsg =
      error instanceof AxiosError
        ? error.response?.data?.message || error.message
        : "An unknown error occurred"
    return {
      success: false,
      message: errorMsg || "Failed to delete service",
      error: errorMsg,
    }
  }
}

export {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
}
