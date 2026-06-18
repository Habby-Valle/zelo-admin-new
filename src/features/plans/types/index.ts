export type PlanStatus = "trial" | "active" | "free" | "expired" | "cancelled"

export interface PlanBenefit {
  id: string
  key: string
  label: string
  description: string
}

export interface PlanBenefitRelation {
  id: string
  benefit_id: string
  benefit_key: string
  benefit_label: string
  value: string
}

export interface Plan {
  id: string
  name: string
  description: string
  monthly_price: number
  yearly_price: number | null
  is_active: boolean
  benefits: PlanBenefitRelation[]
  clinics_count?: number
  created_at: string
  updated_at: string
  scope?: string
}

export interface ClinicPlan {
  id: string
  clinic_id: string
  plan_id: string
  status: PlanStatus
  started_at: string
  expires_at: string | null
  trial_ends_at: string | null
  created_at: string
  updated_at: string
}
