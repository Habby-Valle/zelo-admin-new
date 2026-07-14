import { apiFetchClient } from "@/lib/api-client";
import type { Lead, LeadFilters } from "@/features/leads/types";

export async function fetchLeads(
  params: LeadFilters
): Promise<{ leads: Lead[]; total: number }> {
  const qs = new URLSearchParams();
  if (params.status && params.status !== "all") qs.set("status", params.status);
  if (params.search) qs.set("search", params.search);
  qs.set("page", String(params.page ?? 1));
  qs.set("page_size", String(params.page_size ?? 20));

  const data = await apiFetchClient<{ count: number; results: Lead[] }>(`/leads/?${qs}`);
  return { leads: data.results, total: data.count };
}

export async function fetchLead(id: string): Promise<Lead | null> {
  try {
    return await apiFetchClient<Lead>(`/leads/${id}/`);
  } catch {
    return null;
  }
}

export async function updateLeadStatusApi(id: string, status: string): Promise<Lead> {
  return apiFetchClient<Lead>(`/leads/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
