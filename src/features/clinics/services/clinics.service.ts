import { apiFetchClient } from "@/lib/api-client";
import type { PaginatedResponse, Address } from "@/types";
import type { Clinic, ClinicStatus, PlanOption } from "@/features/clinics/types";

interface ApiAddress {
  zip_code: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
}

interface ApiMedia {
  id: string;
  url: string | null;
  original_filename: string;
  mime_type: string;
  file_size: number;
  created_at: string;
}

interface ApiClinic {
  id: string;
  name: string;
  document: string;
  address: ApiAddress | null;
  phone: string;
  status: ClinicStatus;
  media_id: string | null;
  media: ApiMedia | null;
  created_at: string;
  updated_at: string;
}

function mapClinic(api: ApiClinic): Clinic {
  return {
    id: String(api.id),
    name: api.name,
    cnpj: api.document,
    address: api.address as Address | null,
    phone: api.phone,
    status: api.status,
    media_id: api.media_id ?? undefined,
    media: api.media as Clinic["media"],
    created_at: api.created_at,
    updated_at: api.updated_at,
  };
}

export async function getClinicsApi(params?: {
  search?: string;
  status?: ClinicStatus | "all";
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<Clinic>> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set("search", params.search);
  if (params?.status && params.status !== "all") searchParams.set("status", params.status);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.pageSize) searchParams.set("page_size", String(params.pageSize));
  const query = searchParams.toString();
  const data = await apiFetchClient<PaginatedResponse<ApiClinic>>(
    `/clinics/${query ? `?${query}` : ""}`
  );
  return { ...data, results: data.results.map(mapClinic) };
}

export async function getClinicApi(id: string): Promise<Clinic> {
  const data = await apiFetchClient<ApiClinic>(`/clinics/${id}/`);
  return mapClinic(data);
}

export async function createClinicApi(data: {
  name: string;
  document: string;
  address: Record<string, unknown>;
  phone: string;
  status: string;
  media_id?: string;
  admin_email?: string;
  plan_id?: string;
}): Promise<Clinic> {
  const result = await apiFetchClient<ApiClinic>("/clinics/", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return mapClinic(result);
}

export async function updateClinicApi(
  id: string,
  data: Partial<{
    name: string;
    document: string;
    address: Record<string, unknown>;
    phone: string;
    status: string;
    media_id?: string;
  }>
): Promise<Clinic> {
  const result = await apiFetchClient<ApiClinic>(`/clinics/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return mapClinic(result);
}

export async function deleteClinicApi(id: string): Promise<void> {
  await apiFetchClient<void>(`/clinics/${id}/`, {
    method: "DELETE",
  });
}

export async function getPlansApi(params?: { scope?: string }): Promise<PlanOption[]> {
  const searchParams = new URLSearchParams();
  searchParams.set("is_active", "true");
  searchParams.set("page_size", "100");
  if (params?.scope) searchParams.set("scope", params.scope);
  const query = searchParams.toString();
  const data = await apiFetchClient<PaginatedResponse<PlanOption>>(`/plans/?${query}`);
  return data.results;
}
