import { create } from "zustand";

// props of zustand
type NavState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

// state to track nav toggle
export const useNavStore = create<NavState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

// Customer State
type CustomerState = {
  activeTab: string;
  onActiveTab: (tab: string) => void;
};

export const useCustomerStore = create<CustomerState>((set) => ({
  activeTab: "Active",
  onActiveTab: (tab: string) => set({ activeTab: tab }),
}));

/* ============= Service  State ================ */
// TODO: Need Service Type with relations to serviceavailability and businessdetail

// ============= Delete Alert State
type DeleteAlertState = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
};

export const useDeleteAlertStore = create<DeleteAlertState>((set) => ({
  open: false,
  onOpenChange: (open: boolean) => set({ open }),
  onDelete: () => set({ open: false }),
}));

// =========== Business Detail Store ========== //
import { getBusinesses } from "@/app/admin/business-settings/_api-call/business-api-call";
import { BusinessDetail } from "@/features/business-detail/types/types";
import { transformBusinessAvailabilityData } from "@/features/service/action/action";
import { BusinessAvailability } from "@/features/service/components/admin/form/add/service-form";
import { toast } from "sonner";

interface BusinessState {
  business: BusinessDetail | null;
  businessAvailability: BusinessAvailability | null;
  businessId: string;
  loading: boolean;
  error: string | null;
  fetchBusiness: () => Promise<void>;
}

export const useBusinessStore = create<BusinessState>((set) => ({
  business: null,
  businessAvailability: null,
  businessId: "",
  loading: false,
  error: null,
  fetchBusiness: async () => {
    set({ loading: true, error: null });
    try {
      const businesses = await getBusinesses();
      console.log(
        "useBusinessStore: fetchBusinesses: Fetched businesses =",
        businesses
      );
      const business = businesses.data[0];
      const businessAvailability = business
        ? transformBusinessAvailabilityData(business)
        : null;
      console.log(
        "useBusinessStore: fetchBusinesses: Transformed businessAvailability =",
        businessAvailability
      );
      set({
        business: business || null,
        businessAvailability,
        businessId: business?.id || "",
        loading: false,
      });
    } catch (error: any) {
      console.error("useBusinessStore: fetchBusinesses: Error =", error);
      set({
        error: error.message || "Failed to fetch businesses",
        loading: false,
        business: null,
        businessAvailability: {
          breaks: {
            Mon: [],
            Tue: [],
            Wed: [],
            Thu: [],
            Fri: [],
            Sat: [],
            Sun: [],
          },
          holidays: [],
        },
        businessId: "",
      });
    }
  },
}));
