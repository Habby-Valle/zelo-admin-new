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
  email?: string;
  website?: string;
  description?: string;
  responsible_name?: string;
  whatsapp?: string;
  business_hours?: Record<string, unknown>;
  social_media?: Record<string, unknown>;
  cnes?: string;
  specialty?: string;
  weekly_report_enabled?: boolean;
  monthly_report_enabled?: boolean;
  quality_config?: Record<string, unknown>;
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

/**
 * O que a exclusão permanente de uma clínica leva junto.
 *
 * `deleted` some do banco; `unlinked` continua existindo, apenas perde o
 * vínculo com a clínica (cuidadores e familiares não são apagados).
 */
export interface ClinicDeletionImpact {
  deleted: {
    patients: number;
    shifts: number;
    care_plans: number;
    checklists: number;
    invites: number;
    sos_alerts: number;
    service_contracts: number;
    service_invoices: number;
    clinic_admins: number;
    nurses: number;
    users: number;
  };
  unlinked: {
    caregivers: number;
    family_members: number;
  };
}
