import { Appointment } from "@/app/(admin)/appointment/_types/appoinment";
import { Service } from "@/app/(admin)/service/_types/service";
import { VideoProvider } from "@/features/individual-event/types/types";

export interface Meeting {
  id: string;
  serviceId: string;
  startTime: string; // ISO Date string
  endTime: string;   // ISO Date string
  bookedByName: string;
  bookedByEmail: string;
  bookerTimezone?: string;
  comment?: string;
  videoUrl?: string;
  videoProvider?: VideoProvider;
  slug?: string;
  service?: Service; // Optional, if you fetch it
  appointmentId?: string;
  appointment?: Appointment; // Optional, if you fetch it
}