// useBusinessStore.ts
import { create } from "zustand";
import { toast } from "sonner";
import {
  getBusinesses,
  getBusinessById,
} from "@/app/(admin)/business-settings/_api-call/business-api-call";
import { timeOptions } from "@/lib/lib";

// Define interfaces
interface BusinessDetail {
  id: string;
  name: string;
  industry: string;
  email: string;
  phone: string;
  website: string;
  businessRegistrationNumber: string;
  status: string;
  businessOwner: string;
  createdAt: Date;
  updatedAt: Date;
  businessAvailability: Array<{
    id: string;
    weekDay: string;
    type: string;
    timeSlots: Array<{
      id: string;
      type: string;
      startTime: string;
      endTime: string;
    }>;
  }>;
  holiday: Array<{ id: string; holiday: string; date: string }>;
  address: Array<{
    id: string;
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    googleMap: string;
    businessId: string;
    supportId: string | null;
  }>;
}

interface BusinessState {
  businesses: BusinessDetail[];
  selectedBusiness: BusinessDetail | null;
  businessData: any | null;
  activeTab: "Business Detail" | "Business hour & Availability";
  loading: boolean;
  isRefreshing: boolean;
  hasFetched: boolean;
  error: string | null;
  fetchBusinesses: (
    businessOwnerId: string,
    isManualRefresh?: boolean
  ) => Promise<void>;
  fetchBusinessById: (businessId: string) => Promise<void>;
  updateSelectedBusiness: (business: BusinessDetail) => void;
  setBusinessData: (data: Partial<any>) => void;
  setActiveTab: (
    tab: "Business Detail" | "Business hour & Availability"
  ) => void;
  resetBusinessData: () => void;
}

// Weekday mapping
const weekdayMap: { [key: string]: string } = {
  Mon: "MONDAY",
  MONDAY: "Mon",
  Tue: "TUESDAY",
  TUESDAY: "Tue",
  Wed: "WEDNESDAY",
  WEDNESDAY: "Wed",
  Thu: "THURSDAY",
  THURSDAY: "Thu",
  Fri: "FRIDAY",
  FRIDAY: "Fri",
  Sat: "SATURDAY",
  SATURDAY: "Sat",
  Sun: "SUNDAY",
  SUNDAY: "Sun",
};

// Default business hours
const defaultBusinessHours = {
  Mon: { work: [["08:00 AM", "08:00 PM"]], break: [["12:00 PM", "01:00 PM"]] },
  Tue: { work: [["09:00 AM", "05:00 PM"]], break: [["12:00 PM", "01:00 PM"]] },
  Wed: { work: [["09:00 AM", "05:00 PM"]], break: [["12:00 PM", "01:00 PM"]] },
  Thu: { work: [["09:00 AM", "05:00 PM"]], break: [["12:00 PM", "01:00 PM"]] },
  Fri: { work: [["09:00 AM", "05:00 PM"]], break: [["12:00 PM", "01:00 PM"]] },
  Sat: { work: [], break: [] },
  Sun: { work: [], break: [] },
};

// Create store
export const useBusinessStore = create<BusinessState>((set, get) => ({
  businesses: [],
  selectedBusiness: null,
  businessData: null,
  activeTab: "Business Detail",
  loading: false,
  isRefreshing: false,
  hasFetched: false,
  error: null,
  fetchBusinesses: async (businessOwnerId, isManualRefresh = false) => {
    const { hasFetched } = get();
    if (!isManualRefresh && hasFetched) return;
    try {
      set({
        [isManualRefresh ? "isRefreshing" : "loading"]: true,
        error: null,
      });
      const response = await getBusinesses();
      if (response.success && Array.isArray(response.data)) {
        set({ businesses: response.data, hasFetched: true, error: null });
        if (isManualRefresh) {
          toast.success(
            response.data.length
              ? `Fetched ${response.data.length} businesses`
              : "No businesses found",
            {
              id: "fetch-businesses",
            }
          );
        }
      } else {
        throw new Error(response.message || "Failed to fetch businesses");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch businesses";
      set({ businesses: [], error: errorMessage, hasFetched: true });
      if (isManualRefresh) {
        toast.error(errorMessage, { id: "fetch-businesses" });
      }
    } finally {
      set({ [isManualRefresh ? "isRefreshing" : "loading"]: false });
    }
  },
  fetchBusinessById: async (businessId) => {
    try {
      set({ loading: true, error: null });
      const response = await getBusinessById(businessId);
      if (response) {
        const transformedData = transformBusinessDataForForms(response);
        set({
          selectedBusiness: response,
          businessData: transformedData,
          hasFetched: true,
          error: null,
        });
        toast.success("Business fetched successfully", {
          id: "fetch-business-by-id",
        });
      } else {
        throw new Error("Business not found");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch business";
      set({
        selectedBusiness: null,
        businessData: null,
        hasFetched: true,
        error: errorMessage,
      });
      toast.error(errorMessage, { id: "fetch-business-by-id" });
    } finally {
      set({ loading: false });
    }
  },
  updateSelectedBusiness: (business) => set({ selectedBusiness: business }),
  setBusinessData: (data) =>
    set((state) => ({ businessData: { ...state.businessData, ...data } })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  resetBusinessData: () =>
    set({
      businessData: {
        id: "",
        businessName: "",
        industry: "",
        email: "",
        phone: "",
        website: "",
        city: "",
        street: "",
        state: "",
        zipCode: "",
        country: "",
        googleMap: "",
        registrationNumber: "",
        taxId: null,
        taxIdFileId: null,
        logo: null,
        logoFileId: null,
        visibility: "",
        timeZone: "UTC",
        businessDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        holidays: ["Sat", "Sun"],
        availabilityMode: "default",
        businessHours: defaultBusinessHours,
      },
      selectedBusiness: null,
    }),
}));

// Transform availability for form
export const transformAvailabilityForForm = (availability: any[]) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const businessHours: any = {};
  const validTimes = timeOptions();

  days.forEach((day) => {
    businessHours[day] = { work: [], break: [] };
  });

  availability.forEach((avail) => {
    const dayKey = weekdayMap[avail.weekDay];
    if (!dayKey || !businessHours[dayKey]) return;
    const workSlots: [string, string][] = [];
    const breakSlots: [string, string][] = [];

    avail.timeSlots.forEach((slot: any) => {
      const startTime = slot.startTime;
      const endTime = slot.endTime;
      if (!validTimes.includes(startTime) || !validTimes.includes(endTime))
        return;
      const slotPair: [string, string] = [startTime, endTime];
      if (slot.type === "BREAK") breakSlots.push(slotPair);
      else if (slot.type === "WORK") workSlots.push(slotPair);
    });

    const sortByStartTime = (slots: [string, string][]) =>
      slots.sort(
        (a, b) =>
          new Date(`1970-01-01 ${a[0]}`).getTime() -
          new Date(`1970-01-01 ${b[0]}`).getTime()
      );

    businessHours[dayKey].work = sortByStartTime(workSlots);
    businessHours[dayKey].break = sortByStartTime(breakSlots);
  });

  return businessHours;
};

// Transform DB data for form
export const transformBusinessDataForForms = (data: any) => {
  const businessDays = data.businessAvailability
    ?.map((avail: any) => weekdayMap[avail.weekDay])
    ?.filter((day: string) =>
      ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].includes(day)
    ) || ["Mon", "Tue", "Wed", "Thu", "Fri"];

  const holidays = data.holiday
    ? data.holiday.map((h: any) => weekdayMap[h.holiday] || h.holiday)
    : ["Sat", "Sun"];
  const address =
    data.address && data.address.length > 0 ? data.address[0] : {};

  return {
    id: data.id || "",
    businessName: data.name || "",
    industry: data.industry || "",
    email: data.email || "",
    phone: data.phone || "",
    website: data.website || "",
    city: address.city || "",
    street: address.street || "",
    state: address.state || "",
    zipCode: address.zipCode || "",
    country: address.country || "",
    googleMap: address.googleMap || "",
    registrationNumber: data.businessRegistrationNumber || "",
    taxId: data.taxId || null,
    taxIdFileId: data.taxIdFileId || null,
    logo: data.logo || null,
    logoFileId: data.logoFileId || null,
    visibility: data.status || "PENDING",
    timeZone: data.timeZone || "UTC",
    businessDays,
    holidays,
    businessAvailability: data.businessAvailability || [],
    availabilityMode: "default",
    businessHours: data.businessAvailability?.length
      ? transformAvailabilityForForm(data.businessAvailability)
      : defaultBusinessHours,
  };
};
