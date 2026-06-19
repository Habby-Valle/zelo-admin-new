import { apiFetchClient } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types";
import type { Invite } from "@/features/users/types";

interface ApiInvite {
  id: number;
  email: string;
  role: string;
  status: string;
  created_by_name: string;
  clinic_id: number | null;
  guardian_id: number | null;
  created_at: string;
  expires_at: string;
}

function mapInvite(api: ApiInvite): Invite {
  return {
    id: String(api.id),
    email: api.email,
    role: api.role as Invite["role"],
    status: api.status as Invite["status"],
    created_by_name: api.created_by_name,
    clinic_id: api.clinic_id != null ? String(api.clinic_id) : null,
    guardian_id: api.guardian_id != null ? String(api.guardian_id) : null,
    created_at: api.created_at,
    expires_at: api.expires_at,
  };
}

export async function fetchInvites(params?: {
  search?: string;
  status?: string;
  role?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ invites: Invite[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set("search", params.search);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.role) searchParams.set("role", params.role);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.pageSize) searchParams.set("page_size", String(params.pageSize));
  const query = searchParams.toString();
  const data = await apiFetchClient<PaginatedResponse<ApiInvite>>(
    `/invites/${query ? `?${query}` : ""}`
  );
  return { invites: data.results.map(mapInvite), total: data.count };
}

export async function createInviteFetch(data: {
  email: string;
  role: string;
  clinic_id?: number | null;
}): Promise<Invite> {
  const result = await apiFetchClient<ApiInvite>("/invites/", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return mapInvite(result);
}

export async function cancelInviteFetch(id: string): Promise<Invite> {
  const result = await apiFetchClient<ApiInvite>(`/invites/${id}/cancel/`, {
    method: "POST",
  });
  return mapInvite(result);
}
