import { apiFetchClient } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types";
import type {
  SubscriptionListItem,
  SubscriptionStats,
  GuardianSubscriptionListItem,
  SubscriptionDetails,
} from "@/features/subscriptions/types";

interface SubscriptionsListResult {
  count: number;
  results: SubscriptionListItem[];
}

export async function fetchSubscriptions(params?: {
  status?: string;
  search?: string;
  page?: number;
  page_size?: number;
}): Promise<{ subscriptions: SubscriptionListItem[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.page_size) searchParams.set("page_size", String(params.page_size));
  const query = searchParams.toString();
  const data = await apiFetchClient<SubscriptionsListResult>(
    `/subscriptions/${query ? `?${query}` : ""}`
  );
  return { subscriptions: data.results, total: data.count };
}

export async function fetchSubscriptionStats(): Promise<SubscriptionStats> {
  return apiFetchClient<SubscriptionStats>("/subscriptions/stats/");
}

interface GuardianSubscriptionsResult {
  count: number;
  results: GuardianSubscriptionListItem[];
}

export async function fetchGuardianSubscriptions(params?: {
  status?: string;
  search?: string;
  page?: number;
  page_size?: number;
}): Promise<{
  subscriptions: GuardianSubscriptionListItem[];
  total: number;
}> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.page_size) searchParams.set("page_size", String(params.page_size));
  const query = searchParams.toString();
  const data = await apiFetchClient<GuardianSubscriptionsResult>(
    `/subscriptions/guardian/${query ? `?${query}` : ""}`
  );
  return { subscriptions: data.results, total: data.count };
}

interface DjangoSubscription {
  id: number;
  clinic_id: number;
  clinic_name: string;
  clinic_email: string | null;
  plan_id: number;
  plan_name: string;
  plan_price: string;
  plan_billing_cycle: string;
  status: string;
  start_date: string;
  end_date: string | null;
  trial_ends_at: string | null;
  payment_failed_at: string | null;
  created_at: string;
  stripe_subscription_id: string | null;
  stripe_status: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
}

function mapSubscriptionDetails(data: DjangoSubscription): SubscriptionDetails {
  return {
    id: String(data.id),
    clinicId: String(data.clinic_id),
    clinicName: data.clinic_name ?? "Clínica sem nome",
    clinicEmail: data.clinic_email ?? "",
    planId: String(data.plan_id),
    planName: data.plan_name ?? "Plano não encontrado",
    planDescription: "",
    planPrice: parseFloat(data.plan_price ?? "0"),
    planBillingCycle: data.plan_billing_cycle ?? "monthly",
    status: data.status,
    startedAt: data.start_date,
    expiresAt: data.end_date ?? "",
    trialEndsAt: data.trial_ends_at ?? "",
    createdAt: data.created_at,
    maxUsers: 0,
    maxPatients: 0,
    features: [],
    stripeSubscriptionId: data.stripe_subscription_id ?? null,
    stripeStatus: data.stripe_status ?? null,
    currentPeriodStart: data.current_period_start ?? null,
    currentPeriodEnd: data.current_period_end ?? null,
  };
}

export async function fetchSubscriptionDetails(id: string): Promise<SubscriptionDetails> {
  const data = await apiFetchClient<DjangoSubscription>(`/subscriptions/${id}/`);
  return mapSubscriptionDetails(data);
}
