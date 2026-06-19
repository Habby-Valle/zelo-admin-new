import { apiFetchClient } from "@/lib/api-client";
import type { AuditLog, AuditLogDetail, AuditLogFilters } from "@/features/audit-logs/types";

interface AuditLogsApiResult {
  count: number;
  results: AuditLog[];
}

export async function fetchAuditLogs(
  params: AuditLogFilters
): Promise<{ logs: AuditLog[]; total: number }> {
  const qs = new URLSearchParams();

  if (params.action) qs.set("action", params.action);
  if (params.content_type) qs.set("content_type", params.content_type);
  if (params.user_id) qs.set("user_id", params.user_id);
  if (params.search) qs.set("search", params.search);
  if (params.date_from) qs.set("date_from", params.date_from);
  if (params.date_to) qs.set("date_to", params.date_to);
  qs.set("page", String(params.page ?? 1));
  qs.set("page_size", String(params.page_size ?? 20));

  const data = await apiFetchClient<AuditLogsApiResult>(`/audit-logs/?${qs}`);
  return { logs: data.results, total: data.count };
}

export async function fetchAuditLog(id: string): Promise<AuditLogDetail | null> {
  try {
    return await apiFetchClient<AuditLogDetail>(`/audit-logs/${id}/`);
  } catch {
    return null;
  }
}
