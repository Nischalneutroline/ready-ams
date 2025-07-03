import { getBaseUrl } from "@/lib/baseUrl"
import axios from "axios"

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
})
export interface Business {
  id?: string
  name: string
  email: string
  phone: string
  address: string
  description: string
  taxId?: string
  taxIdFileId?: string            
  logo?: string
  logoFileId? : string                
  status: string
  createdAt?: string
  updatedAt?: string
}

async function getBusinesses() {
  try {
    const { data } = await api.get("/api/business-detail")

    return { data, success: true, message: "Business fetched successfully!" }
  } catch (error) {
    console.error("Error fetching businesses:", error)
    return {
      success: false,
      message: "Failed to fetch businesses",
      error: error,
    }
  }
}

async function getBusinessById(id: string) {
  try {
    const res = await api.get(`/api/business-detail/${id}`)
    console.log(res, "inside Business details")
    return res.data
  } catch (error) {
    console.error("Error fetching business:", error)
    throw error
  }
}

async function createBusiness(businessData: any) {
  try {
    const { data } = await api.post("/api/business-detail", businessData)
    return data
  } catch (error) {
    console.error("Error creating business:", error)
    throw error
  }
}

async function updateBusiness(id: string, businessData: any) {
  try {
    console.log(businessData, "inside Business detailss")
    const { data } = await api.put(`/api/business-detail/${id}`, {
      ...businessData,
      id,
    })
    return data
  } catch (error) {
    console.error("Error updating business:", error)
    throw error
  }
}

async function deleteBusiness(id: string) {
  try {
    await api.delete(`/api/business-detail/${id}`)
  } catch (error) {
    console.error("Error deleting business:", error)
    throw error
  }
}

export {
  getBusinesses,
  getBusinessById,
  createBusiness,
  updateBusiness,
  deleteBusiness,
}
