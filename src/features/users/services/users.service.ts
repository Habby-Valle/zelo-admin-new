import { apiFetchClient } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types";
import type { UserProfile } from "@/features/users/types";

interface ApiProfile {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: string;
  media_id: number | null;
  media_url: string | null;
  is_active: boolean;
  verification_status?: string | null;
  created_at: string;
}

interface ApiUsersResponse {
  count: number;
  results: ApiProfile[];
}

function mapProfile(api: ApiProfile): UserProfile {
  return {
    id: String(api.id),
    email: api.email,
    name: api.name,
    phone: api.phone,
    role: api.role,
    media_id: api.media_id,
    media: api.media_url
      ? {
          id: String(api.media_id),
          url: api.media_url,
          original_filename: "",
          mime_type: "",
          file_size: 0,
          created_at: "",
        }
      : null,
    is_active: api.is_active,
    verification_status: api.verification_status ?? null,
    created_at: api.created_at,
  };
}

export async function fetchUser(id: string): Promise<UserProfile> {
  const data = await apiFetchClient<ApiProfile>(`/users/${id}/`);
  return mapProfile(data);
}

export async function fetchUsers(params?: {
  search?: string;
  role?: string;
  isActive?: string;
  clinicId?: string | number;
  page?: number;
  pageSize?: number;
}): Promise<{ users: UserProfile[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set("search", params.search);
  if (params?.role) searchParams.set("role", params.role);
  if (params?.isActive) searchParams.set("is_active", params.isActive);
  if (params?.clinicId) searchParams.set("clinic_id", String(params.clinicId));
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.pageSize) searchParams.set("page_size", String(params.pageSize));
  const query = searchParams.toString();
  const data = await apiFetchClient<ApiUsersResponse>(`/users/${query ? `?${query}` : ""}`);
  return { users: data.results.map(mapProfile), total: data.count };
}
