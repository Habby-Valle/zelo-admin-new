import { apiFetchClient } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types";
import type { SosAlert, SosFilters, SosSummary } from "@/features/sos/types";

export async function getSosAlertsApi(params?: SosFilters): Promise<{
  alerts: SosAlert[];
  total: number;
}> {
  const qs = new URLSearchParams();

  if (params?.status && params.status !== "all") qs.set("status", params.status);
  if (params?.clinic_id) qs.set("clinic_id", String(params.clinic_id));
  qs.set("page", String(params?.page ?? 1));
  qs.set("page_size", String(params?.page_size ?? 20));

  const query = qs.toString();
  const data = await apiFetchClient<PaginatedResponse<SosAlert>>(
    `/sos-alerts/${query ? `?${query}` : ""}`
  );
  return { alerts: data.results, total: data.count };
}

export async function getSosAlertApi(id: number): Promise<SosAlert | null> {
  try {
    return await apiFetchClient<SosAlert>(`/sos-alerts/${id}/`);
  } catch {
    return null;
  }
}

export async function acknowledgeSosAlertApi(id: string): Promise<void> {
  await apiFetchClient<void>(`/sos-alerts/${id}/acknowledge/`, {
    method: "PATCH",
  });
}

export async function resolveSosAlertApi(id: string, resolution_reason?: string): Promise<void> {
  await apiFetchClient<void>(`/sos-alerts/${id}/resolve/`, {
    method: "PATCH",
    body: JSON.stringify({ resolution_reason: resolution_reason ?? "" }),
  });
}

export async function getSosSummaryApi(clinicId?: string | number): Promise<SosSummary> {
  const qs = new URLSearchParams();
  if (clinicId) qs.set("clinic_id", String(clinicId));
  qs.set("page_size", "10000");
  const query = qs.toString();
  const allData = await apiFetchClient<PaginatedResponse<SosAlert>>(
    `/sos-alerts/${query ? `?${query}` : ""}`
  );
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const active = allData.results.filter((a) => a.status === "active").length;
  const acknowledged = allData.results.filter((a) => a.status === "acknowledged").length;
  const resolvedToday = allData.results.filter(
    (a) => a.status === "resolved" && a.resolved_at && a.resolved_at >= todayStart
  ).length;

  return { active, acknowledged, resolvedToday };
}
