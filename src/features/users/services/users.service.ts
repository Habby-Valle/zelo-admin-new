import { apiFetchClient } from "@/lib/api-client";
import type { UserProfile } from "@/features/users/types";

interface ApiProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  cpf?: string;
  role: string;
  media_id: string | null;
  media_url: string | null;
  is_active: boolean;
  verification_status?: string | null;
  family_mode?: string;
  relationship_to_patient?: string;
  is_companion?: boolean;
  professional_register?: string;
  specialization?: string;
  birth_date?: string;
  gender?: string;
  created_at: string;
}

interface ApiUsersResponse {
  count: number;
  results: ApiProfile[];
}

function mapProfile(api: ApiProfile): UserProfile {
  return {
    id: api.id,
    email: api.email,
    name: api.name,
    phone: api.phone,
    cpf: api.cpf,
    role: api.role,
    media_id: api.media_id,
    media: api.media_url
      ? {
          id: api.media_id ?? "",
          url: api.media_url,
          original_filename: "",
          mime_type: "",
          file_size: 0,
          created_at: "",
        }
      : null,
    is_active: api.is_active,
    verification_status: api.verification_status ?? null,
    family_mode: api.family_mode,
    relationship_to_patient: api.relationship_to_patient,
    is_companion: api.is_companion,
    professional_register: api.professional_register,
    specialization: api.specialization,
    birth_date: api.birth_date,
    gender: api.gender,
    created_at: api.created_at,
  };
}

export async function fetchUser(id: string): Promise<UserProfile> {
  const data = await apiFetchClient<ApiProfile>(`/users/${id}/`);
  return mapProfile(data);
}

export async function updateUserApi(
  id: string,
  data: Partial<{
    email: string;
    name: string;
    phone: string;
    cpf: string;
    is_active: boolean;
    family_mode: string;
    relationship_to_patient: string;
    is_companion: boolean;
    clinic_id: string | null;
    professional_register: string;
    specialization: string;
    birth_date: string;
    gender: string;
  }>
): Promise<UserProfile> {
  const result = await apiFetchClient<ApiProfile>(`/users/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return mapProfile(result);
}

export async function assignFamilyPlanApi(
  familyId: string,
  planId: string
): Promise<{ family_id: string; plan_id: string; plan_name: string; status: string }> {
  return apiFetchClient(`/family-plan/assign/`, {
    method: "POST",
    body: JSON.stringify({ family_id: familyId, plan_id: planId }),
  });
}

export async function fetchUsers(params?: {
  search?: string;
  role?: string;
  isActive?: string;
  clinicId?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ users: UserProfile[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set("search", params.search);
  if (params?.role) searchParams.set("role", params.role);
  if (params?.isActive) searchParams.set("is_active", params.isActive);
  if (params?.clinicId) searchParams.set("clinic_id", params.clinicId);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.pageSize) searchParams.set("page_size", String(params.pageSize));
  const query = searchParams.toString();
  const data = await apiFetchClient<ApiUsersResponse>(`/users/${query ? `?${query}` : ""}`);
  return { users: data.results.map(mapProfile), total: data.count };
}
