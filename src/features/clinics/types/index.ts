import type { Address, Media } from "@/types";

export type ClinicStatus = "active" | "inactive" | "suspended";

export interface Clinic {
  id: string;
  name: string;
  cnpj: string;
  address: Address | null;
  phone: string;
  status: ClinicStatus;
  plan?: string | null;
  clinic_plan_id?: string | null;
  media_id?: string | null;
  media?: Media | null;
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface SubscriptionInfo {
  id: string;
  clinic_id: string;
  plan_id: string;
  plan_name: string;
  plan_price: number;
  status: string;
  start_date: string;
  end_date: string | null;
  trial_end_date: string | null;
}

export interface PlanOption {
  id: string;
  name: string;
  description: string;
  monthly_price: string;
  yearly_price: string | null;
  benefits: { benefit_key: string; benefit_label: string; value: string }[];
}
