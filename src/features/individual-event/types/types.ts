import { Appointment } from "@/app/(admin)/appointment/_types/appoinment";
import { Service, ServiceTime } from "@/app/(admin)/service/_types/service";
import { Individual } from "@/features/individual/types/types";
import { Resource } from "@/features/resource/types/types";
import { User } from "@/features/user/types/types";


export enum EventType {
  ONE_TO_ONE = "ONE_TO_ONE",
  GENERAL = "GENERAL",
}

// LinkType for shareable links
export enum LinkType {
  SINGLE_SLOT = "SINGLE_SLOT",
  DAILY_SLOTS = "DAILY_SLOTS",
  MULTI_DAY_SLOTS = "MULTI_DAY_SLOTS",
}

// Video provider types
 export enum VideoProvider {
  ZOOM = "ZOOM",
  GOOGLE_MEET = "GOOGLE_MEET",
  MICROSOFT_TEAMS = "MICROSOFT_TEAMS",
  WEBEX = "WEBEX",
  GOTO_MEETING = "GOTO_MEETING",
}


// // Meeting model
// export interface Meeting {
//   id: string;
//   eventId: string;
//   timeSlot: string; // ISO Date string
//   bookedByName: string;
//   bookedByEmail: string;
//   customAnswers?: any;
//   videoUrl?: string;
//   videoProvider?: VideoProvider;
//   slug?: string;
//   // Optional nested object, only if you fetch it
//   event?: Event;
// }


// EventType model
export interface ShareableLink {
  id: string;
  location: string;
  slug: string;
  type: EventType;
  appointmentId?: string;
  appointment?: Appointment;
  serviceId?: string;
  service?: Service;
  resourceId?: string;
  resource?: Resource;
  serviceTimeId?: string;
  serviceTime?: ServiceTime;
  date?: string; // ISO Date string
  dateRangeEnd?: string; // ISO Date string
  linkType: LinkType;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string; // ISO Date string
  expiresAt?: string; // ISO Date string
}