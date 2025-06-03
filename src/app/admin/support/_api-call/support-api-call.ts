// db/supportDetailApi.ts
import { getBaseUrl } from "@/lib/baseUrl"
import { SupportBusinessDetail } from "@prisma/client"
import axios from "axios"
import { PostSupportBusinessDetail } from "../_types/types"

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
})

// Fetch all support details
async function getSupportDetails() {
  try {
    const { data } = await api.get("/api/support")
    return {
      data,
      success: true,
      message: "Support details fetched successfully!",
    }
  } catch (error) {
    console.error("Error fetching support details:", error)
    return {
      success: false,
      message: "Failed to fetch support details",
      error,
    }
  }
}

// Fetch support detail by ID
async function getSupportDetailById(
  id: string
): Promise<SupportBusinessDetail> {
  try {
    const { data } = await api.get(`/api/support-business/${id}`)
    return data
  } catch (error) {
    console.error("Error fetching support detail:", error)
    throw error
  }
}

// Fetch support detail by business ID
async function getSupportDetailByBusinessId(
  businessId: string
): Promise<{ data: SupportBusinessDetail; success: boolean } | null> {
  try {
    console.log(businessId, "businessId")
    const res = await api.get("/api/support-business-detail")

    console.log(res, "res")
    if (res.statusText !== "OK") {
      throw new Error("Failed to fetch support details")
    }

    console.log(res.data, "res.data")

    const supportDetail = res.data.find(
      (detail: SupportBusinessDetail) => detail.businessId === businessId
    )
    console.log(supportDetail, "supportDetail")
    return { data: supportDetail, success: true }
  } catch (error) {
    console.error("Error fetching support detail by business ID:", error)
    throw error
  }
}

// Fetch support detail by email
async function getSupportDetailByEmail(
  email: string
): Promise<SupportBusinessDetail | null> {
  try {
    const { data } = await api.get("/api/support")
    const supportDetail = data.find(
      (detail: SupportBusinessDetail) => detail.supportEmail === email
    )
    return supportDetail || null
  } catch (error) {
    console.error("Error fetching support detail by email:", error)
    throw error
  }
}

// Create new support detail
async function createSupportDetail(
  supportData: PostSupportBusinessDetail
): Promise<SupportBusinessDetail> {
  try {
    const { data } = await api.post("/api/support-business-detail", supportData)
    return data
  } catch (error) {
    console.error("Error creating support detail:", error)
    throw error
  }
}

// Update existing support detail
async function updateSupportDetail(
  id: string,
  supportData: PostSupportBusinessDetail
): Promise<SupportBusinessDetail> {
  try {
    console.log(supportData, "supportData------")
    const { data } = await api.put(`/api/support-business-detail/${id}`, {
      ...supportData,
      id,
    })
    return data
  } catch (error) {
    console.error("Error updating support detail:", error)
    throw error
  }
}

// Delete support detail by ID
async function deleteSupportDetail(id: string): Promise<void> {
  try {
    await api.delete(`/api/support-business/${id}`)
  } catch (error) {
    console.error("Error deleting support detail:", error)
    throw error
  }
}

export {
  getSupportDetails,
  getSupportDetailById,
  getSupportDetailByBusinessId,
  getSupportDetailByEmail,
  createSupportDetail,
  updateSupportDetail,
  deleteSupportDetail,
}
