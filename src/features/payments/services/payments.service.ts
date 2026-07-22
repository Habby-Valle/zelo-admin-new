import { apiFetchClient } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types";
import type { PlanPaymentRecord, PaymentRecord, PaymentStats } from "@/features/payments/types";

export async function fetchPlanPayments(params?: {
  status?: string;
  search?: string;
  page?: number;
  page_size?: number;
}): Promise<{
  payments: PlanPaymentRecord[];
  total: number;
  total_revenue: number;
}> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.page_size) searchParams.set("page_size", String(params.page_size));
  const query = searchParams.toString();
  const data = await apiFetchClient<
    PaginatedResponse<PlanPaymentRecord> & { total_revenue: number }
  >(`/asaas/plan-payments/${query ? `?${query}` : ""}`);
  return {
    payments: data.results,
    total: data.count,
    total_revenue: data.total_revenue,
  };
}

export async function fetchPayments(params?: {
  status?: string;
  search?: string;
  clinic_id?: string;
  page?: number;
  page_size?: number;
}): Promise<{ payments: PaymentRecord[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.clinic_id) searchParams.set("clinic_id", params.clinic_id);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.page_size) searchParams.set("page_size", String(params.page_size));
  const query = searchParams.toString();
  const data = await apiFetchClient<PaginatedResponse<PaymentRecord>>(
    `/payments/${query ? `?${query}` : ""}`
  );
  return { payments: data.results, total: data.count };
}

export async function fetchPaymentStats(clinicId?: string): Promise<PaymentStats> {
  const qs = clinicId ? `?clinic_id=${clinicId}` : "";
  return apiFetchClient<PaymentStats>(`/payments/stats/${qs}`);
}
