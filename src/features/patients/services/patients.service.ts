import { apiFetchClient } from "@/lib/api-client"
import type { PaginatedResponse } from "@/types"
import type { Patient, PatientDetail, PatientCaregiverAssignment, PatientEmergencyContact } from "@/features/patients/types"

interface ApiPatient {
  id: number
  clinic_id: number | null
  guardian_id: number | null
  name: string
  birth_date: string
  gender: string
  cpf: string | null
  phone: string
  email: string | null
  health_conditions: string
  allergies: string
  medications: string
  blood_type: string | null
  observations: string
  media_id: number | null
  media: { id: number; url: string | null; original_filename: string; mime_type: string; file_size: number; created_at: string } | null
  clinic_name: string | null
  guardian_name: string | null
  is_active: boolean
  emergency_contacts: {
    id: number
    profile_family_id: number
    profile_family_name: string
    profile_family_phone: string
    priority: number
  }[]
  caregiver_assignments: {
    id: number
    caregiver_id: number
    caregiver_name: string
    caregiver_email: string | null
    caregiver_specialization: string | null
    is_active: boolean
    assigned_at: string
  }[]
  created_at: string
  updated_at: string
  created_by_name?: string
}

function mapPatient(api: ApiPatient): Patient {
  return {
    id: String(api.id),
    clinic_id: api.clinic_id != null ? String(api.clinic_id) : null,
    guardian_id: api.guardian_id != null ? String(api.guardian_id) : null,
    name: api.name,
    birth_date: api.birth_date,
    gender: api.gender as Patient["gender"],
    cpf: api.cpf,
    phone: api.phone,
    email: api.email,
    health_conditions: api.health_conditions,
    allergies: api.allergies,
    medications: api.medications,
    blood_type: api.blood_type as Patient["blood_type"],
    observations: api.observations,
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
    guardian_name: api.guardian_name,
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
  }
}

function mapPatientDetail(api: ApiPatient): PatientDetail {
  return {
    ...mapPatient(api),
    clinic_name: api.clinic_name ?? null,
    guardian_name: api.guardian_name ?? null,
    created_by_name: api.created_by_name ?? "",
  }
}

export async function fetchPatients(params?: {
  search?: string
  clinicId?: string
  guardianId?: string
  isActive?: string
  page?: number
  pageSize?: number
}): Promise<{ patients: Patient[]; total: number }> {
  const searchParams = new URLSearchParams()
  if (params?.search) searchParams.set("search", params.search)
  if (params?.clinicId) searchParams.set("clinic_id", params.clinicId)
  if (params?.guardianId) searchParams.set("guardian_id", params.guardianId)
  if (params?.isActive) searchParams.set("is_active", params.isActive)
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.pageSize) searchParams.set("page_size", String(params.pageSize))
  const query = searchParams.toString()
  const data = await apiFetchClient<PaginatedResponse<ApiPatient>>(`/patients/${query ? `?${query}` : ""}`)
  return { patients: data.results.map(mapPatient), total: data.count }
}

export async function fetchPatient(id: string): Promise<PatientDetail> {
  const data = await apiFetchClient<ApiPatient>(`/patients/${id}/`)
  return mapPatientDetail(data)
}

export async function createPatientFetch(data: {
  name: string
  birth_date: string
  gender: string
  cpf?: string | null
  phone: string
  email?: string | null
  clinic_id?: number | null
  blood_type?: string | null
  health_conditions?: string
  allergies?: string
  medications?: string
  observations?: string
  media_id?: number | null
}): Promise<Patient> {
  const result = await apiFetchClient<ApiPatient>("/patients/", {
    method: "POST",
    body: JSON.stringify(data),
  })
  return mapPatient(result)
}

export async function updatePatientFetch(
  id: string,
  data: Partial<{
    name: string
    birth_date: string
    gender: string
    cpf: string | null
    phone: string
    email: string | null
    clinic_id: number | null
    blood_type: string | null
    health_conditions: string
    allergies: string
    medications: string
    observations: string
    media_id: number | null
  }>
): Promise<Patient> {
  const result = await apiFetchClient<ApiPatient>(`/patients/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
  return mapPatient(result)
}

export async function deletePatientFetch(id: string): Promise<void> {
  await apiFetchClient<void>(`/patients/${id}/`, { method: "DELETE" })
}

export async function addCaregiverFetch(
  patientId: string,
  caregiverId: number
): Promise<PatientCaregiverAssignment> {
  const result = await apiFetchClient<{
    id: number
    caregiver_id: number
    caregiver_name: string
    caregiver_email: string | null
    caregiver_specialization: string | null
    is_active: boolean
    assigned_at: string
  }>(`/patients/${patientId}/caregivers/`, {
    method: "POST",
    body: JSON.stringify({ caregiver_id: caregiverId }),
  })
  return {
    id: String(result.id),
    caregiver_id: String(result.caregiver_id),
    caregiver_name: result.caregiver_name,
    caregiver_email: result.caregiver_email,
    caregiver_specialization: result.caregiver_specialization,
    is_active: result.is_active,
    assigned_at: result.assigned_at,
  }
}

export async function removeCaregiverFetch(
  patientId: string,
  assignmentId: string
): Promise<void> {
  await apiFetchClient<void>(`/patients/${patientId}/caregivers/${assignmentId}/`, {
    method: "DELETE",
  })
}

export async function addEmergencyContactFetch(
  patientId: string,
  profileFamilyId: number,
  priority: number
): Promise<PatientEmergencyContact> {
  const result = await apiFetchClient<{
    id: number
    profile_family_id: number
    profile_family_name: string
    profile_family_phone: string
    priority: number
  }>(`/patients/${patientId}/emergency-contacts/`, {
    method: "POST",
    body: JSON.stringify({ profile_family_id: profileFamilyId, priority }),
  })
  return {
    id: String(result.id),
    profile_family_id: String(result.profile_family_id),
    profile_family_name: result.profile_family_name,
    profile_family_phone: result.profile_family_phone,
    priority: result.priority,
  }
}

export async function removeEmergencyContactFetch(
  patientId: string,
  contactId: string
): Promise<void> {
  await apiFetchClient<void>(`/patients/${patientId}/emergency-contacts/${contactId}/`, {
    method: "DELETE",
  })
}
