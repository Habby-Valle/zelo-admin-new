import { apiFetchClient } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types";
import type { Feedback, FeedbackFilters } from "@/features/feedback/types";

export async function fetchFeedbacks(
  params: FeedbackFilters
): Promise<{ feedbacks: Feedback[]; total: number }> {
  const qs = new URLSearchParams();

  if (params.type && params.type !== "all") qs.set("type", params.type);
  if (params.status && params.status !== "all") qs.set("status", params.status);
  if (params.search) qs.set("search", params.search);
  if (params.clinic_id) qs.set("clinic_id", params.clinic_id);
  if (params.include_deleted) qs.set("include_deleted", "true");
  qs.set("page", String(params.page ?? 1));
  qs.set("page_size", String(params.page_size ?? 20));

  const data = await apiFetchClient<PaginatedResponse<Feedback>>(`/feedback/manage/?${qs}`);
  return { feedbacks: data.results, total: data.count };
}

export async function fetchFeedback(id: string): Promise<Feedback | null> {
  try {
    return await apiFetchClient<Feedback>(`/feedback/manage/${id}/`);
  } catch {
    return null;
  }
}

export async function updateFeedbackStatusApi(id: string, status: string): Promise<void> {
  await apiFetchClient<void>(`/feedback/manage/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function softDeleteFeedbackApi(id: string): Promise<void> {
  await apiFetchClient<void>(`/feedback/manage/${id}/`, {
    method: "DELETE",
  });
}
