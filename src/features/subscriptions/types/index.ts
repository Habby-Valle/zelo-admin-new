export interface SubscriptionListItem {
  id: string;
  clinic_id: string;
  clinic_name: string;
  clinic_email: string | null;
  plan_id: string;
  plan_name: string;
  plan_price: number;
  plan_billing_cycle: string;
  status: string;
  start_date: string;
  end_date: string | null;
  trial_ends_at: string | null;
  payment_failed_at: string | null;
  stripe_status: string | null;
  current_period_end: string | null;
  created_at: string;
  patient_count: number;
  max_patients: number;
  patient_usage_percent: number;
  days_remaining: number | null;
}

export interface PlanDistributionItem {
  plan_name: string;
  count: number;
}

export interface SubscriptionStats {
  total: number;
  active: number;
  trial: number;
  expired: number;
  cancelled: number;
  plan_distribution: PlanDistributionItem[];
  guardian_total: number;
  guardian_active: number;
  guardian_free: number;
  guardian_trial: number;
  guardian_cancelled: number;
}

export interface GuardianSubscriptionListItem {
  id: string;
  guardian_id: string;
  guardian_name: string;
  guardian_email: string | null;
  plan_name: string;
  plan_price: number;
  status: string;
  start_date: string;
  end_date: string | null;
  trial_ends_at: string | null;
  payment_failed_at: string | null;
  stripe_status: string | null;
  current_period_end: string | null;
  created_at: string;
}

export interface SubscriptionDetails {
  id: string;
  clinicId: string;
  clinicName: string;
  clinicEmail: string;
  planId: string;
  planName: string;
  planDescription: string;
  planPrice: number;
  planBillingCycle: string;
  status: string;
  startedAt: string;
  expiresAt: string;
  trialEndsAt: string | null;
  createdAt: string;
  maxUsers: number;
  maxPatients: number;
  features: string[];
  stripeSubscriptionId: string | null;
  stripeStatus: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
}
