export type LeadStatus = "new" | "contacted" | "converted" | "discarded";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  clinic_name: string;
  city: string;
  message: string;
  status: LeadStatus;
  status_display: string;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface LeadFilters {
  status?: LeadStatus | "all";
  search?: string;
  page?: number;
  page_size?: number;
}
