
import { z } from 'zod'
import { VideoProvider } from '@prisma/client';

export const videoProviderEnum =  z.nativeEnum(VideoProvider);

// VideoIntegration schema
export const videoIntegrationSchema = z.object({
  provider: videoProviderEnum,
  accessToken: z.string().min(1, "Access token is required"),
  refreshToken: z.string().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(), // ISO string for DateTime
});

export const experienceSchema = z.object({
  company: z.string().optional().nullable(),
  role: z.string().min(1, "Role is required"),
  description: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(), 
  endDate: z.string().optional().nullable(),   
  isCertification: z.boolean().default(false),
});


export const individualSchema = z.object({
  bio: z.string().optional(),
  position: z.string().min(1, "Position is required"),
  profileImage: z.string().optional(),
  imageFileId: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  timezone: z.string().min(1, "Timezone is required"),
   company: z.string().nullable().optional(),      
  website: z.string().url().nullable().optional(),  
  linkedinUrl: z.string().url().nullable().optional(),
  videoIntegrations: z.array(videoIntegrationSchema).optional(),
  experiences: z.array(experienceSchema).optional(),
});