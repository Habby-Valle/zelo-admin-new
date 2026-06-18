import { apiFetchClient } from "@/lib/api-client"
import type { PaginatedResponse } from "@/types"
import type { Patient } from "@/features/patients/types"

interface PatientsResponse {
  patients: Patient[]
  total: number
}

export async function getPatientsApi(params?: {
  clinicId?: string | number
  pageSize?: number
  page?: number
}): Promise<PatientsResponse> {
  const searchParams = new URLSearchParams()
  if (params?.clinicId) searchParams.set("clinic_id", String(params.clinicId))
  if (params?.pageSize) searchParams.set("page_size", String(params.pageSize))
  if (params?.page) searchParams.set("page", String(params.page))
  const query = searchParams.toString()
  const data = await apiFetchClient<PaginatedResponse<Patient>>(
    `/patients/${query ? `?${query}` : ""}`
  )
  return { patients: data.results, total: data.count }
}
