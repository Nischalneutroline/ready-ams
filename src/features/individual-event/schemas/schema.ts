import { z } from 'zod'
import { EventType, LinkType} from '../types/types';
import { WeekDays } from '@/app/(admin)/service/_types/service';
import { serviceSchema } from '@/app/(admin)/service/_schemas/service';

export const eventTypeEnum = z.nativeEnum(EventType);
export const linkTypeEnum = z.nativeEnum(LinkType);
export const weekDaysEnum = z.nativeEnum(WeekDays);

  
export const shareableLinkSchema = z.object({
  location: z.string(),
  slug: z.string(),
  type: eventTypeEnum,
  appointmentId: z.string().optional(),
  serviceId: z.string().optional(),
  resourceId: z.string().optional(),
  serviceTimeId: z.string().optional(),
  date: z.string().optional(),
  dateRangeEnd: z.string().optional(),
  linkType: linkTypeEnum,
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  expiresAt: z.string().optional(),
});

export const shareableLinkWithServiceSchema = shareableLinkSchema.extend({
  service: serviceSchema,
});