import { apiFetchClient } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types";
import type { Patient, PatientDetail } from "@/features/patients/types";

interface ApiPatient {
  id: string;
  clinic_id: string | null;
  name: string;
  birth_date: string;
  gender: string;
  cpf: string | null;
  phone: string;
  media_id: string | null;
  media: {
    id: string;
    url: string | null;
    original_filename: string;
    mime_type: string;
    file_size: number;
    created_at: string;
  } | null;
  clinic_name: string | null;
  is_active: boolean;
  emergency_contacts: {
    id: string;
    profile_family_id: string;
    profile_family_name: string;
    profile_family_phone: string;
    priority: number;
  }[];
  caregiver_assignments: {
    id: string;
    caregiver_id: string;
    caregiver_name: string;
    caregiver_email: string | null;
    caregiver_specialization: string | null;
    is_active: boolean;
    assigned_at: string;
  }[];
  created_at: string;
  updated_at: string;
  created_by_name?: string;
}

function mapPatient(api: ApiPatient): Patient {
  return {
    id: String(api.id),
    clinic_id: api.clinic_id != null ? String(api.clinic_id) : null,
    name: api.name,
    birth_date: api.birth_date,
    gender: api.gender as Patient["gender"],
    cpf: api.cpf,
    phone: api.phone,
    media_id: api.media_id,
    media: api.media
      ? {
          id: String(api.media.id),
          url: api.media.url,
          original_filename: api.media.original_filename,
          mime_type: api.media.mime_type,
          file_size: api.media.file_size,
          created_at: api.media.created_at,
        }
      : null,
    clinic_name: api.clinic_name,
    is_active: api.is_active,
    emergency_contacts: (api.emergency_contacts ?? []).map((c) => ({
      id: String(c.id),
      profile_family_id: String(c.profile_family_id),
      profile_family_name: c.profile_family_name,
      profile_family_phone: c.profile_family_phone,
      priority: c.priority,
    })),
    caregiver_assignments: (api.caregiver_assignments ?? []).map((a) => ({
      id: String(a.id),
      caregiver_id: String(a.caregiver_id),
      caregiver_name: a.caregiver_name,
      caregiver_email: a.caregiver_email,
      caregiver_specialization: a.caregiver_specialization,
      is_active: a.is_active,
      assigned_at: a.assigned_at,
    })),
    created_at: api.created_at,
    updated_at: api.updated_at,
  };
}

function mapPatientDetail(api: ApiPatient): PatientDetail {
  return {
    ...mapPatient(api),
    clinic_name: api.clinic_name ?? null,
    created_by_name: api.created_by_name ?? "",
  };
}

export async function fetchPatients(params?: {
  search?: string;
  clinicId?: string;
  isActive?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ patients: Patient[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set("search", params.search);
  if (params?.clinicId) searchParams.set("clinic_id", params.clinicId);
  if (params?.isActive) searchParams.set("is_active", params.isActive);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.pageSize) searchParams.set("page_size", String(params.pageSize));
  const query = searchParams.toString();
  const data = await apiFetchClient<PaginatedResponse<ApiPatient>>(
    `/patients/${query ? `?${query}` : ""}`
  );
  return { patients: data.results.map(mapPatient), total: data.count };
}

export async function fetchPatient(id: string): Promise<PatientDetail> {
  const data = await apiFetchClient<ApiPatient>(`/patients/${id}/`);
  return mapPatientDetail(data);
}

export async function createPatientFetch(data: {
  name: string;
  birth_date: string;
  gender: string;
  cpf?: string | null;
  phone: string;
  clinic_id?: string | null;
  media_id?: string | null;
}): Promise<Patient> {
  const result = await apiFetchClient<ApiPatient>("/patients/", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return mapPatient(result);
}

export async function updatePatientFetch(
  id: string,
  data: Partial<{
    name: string;
    birth_date: string;
    gender: string;
    cpf: string | null;
    phone: string;
    clinic_id: string | null;
    media_id: string | null;
  }>
): Promise<Patient> {
  const result = await apiFetchClient<ApiPatient>(`/patients/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return mapPatient(result);
}

export async function deletePatientFetch(id: string): Promise<void> {
  await apiFetchClient<void>(`/patients/${id}/`, { method: "DELETE" });
}
