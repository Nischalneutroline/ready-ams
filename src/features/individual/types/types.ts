import { Address, User } from "@/app/(admin)/customer/_types/customer"
import { Service } from "@/app/(admin)/service/_types/service"
import { VideoProvider } from "@prisma/client"



// VideoIntegration model
export interface VideoIntegration {
  id: string
  individualId: string
  provider: VideoProvider
  accessToken: string
  refreshToken?: string | null
  expiresAt?: Date | null
  createdAt: Date
  updatedAt: Date
  individual?: Individual // Optional relation back to Individual
}

export interface Experience {
  id: string
  individualId: string
  individual?: Individual
  company?: string | null
  role: string
  description?: string | null
  startDate?: string | null;
  endDate?: string | null;
  isCertification: boolean
  createdAt: Date
  updatedAt: Date
}

// Individual model
export interface Individual {
    id: string
    userId: string
    bio?: string | null
    position: string // e.g. "Product Designer", "Marketing Coach"
    profileImage?: string | null
    imageFileId?: string | null
    country: string // Country field
    timezone: string
    createdAt: Date // ISO Date string
    updatedAt: Date  // ISO Date string
    user?: User // Optional relation to the User model
    services?: Service[]
    videoIntegrations?: VideoIntegration[]
    company?: string | null     
    website?: string  | null       
    linkedinUrl?: string | null 
    address?: Address  
    experiences?: Experience[] // Past experiences or certifications for credibility.
  }

