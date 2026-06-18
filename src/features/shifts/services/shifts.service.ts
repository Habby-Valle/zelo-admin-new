import { apiFetchClient } from "@/lib/api-client"
import type { PaginatedResponse } from "@/types"
import type { Shift } from "@/features/shifts/types"

interface ShiftsResponse {
  shifts: Shift[]
  total: number
}

export async function getShiftsApi(params?: {
  clinicId?: string | number
  pageSize?: number
  page?: number
}): Promise<ShiftsResponse> {
  const searchParams = new URLSearchParams()
  if (params?.clinicId) searchParams.set("clinic_id", String(params.clinicId))
  if (params?.pageSize) searchParams.set("page_size", String(params.pageSize))
  if (params?.page) searchParams.set("page", String(params.page))
  const query = searchParams.toString()
  const data = await apiFetchClient<PaginatedResponse<Shift>>(
    `/shifts/${query ? `?${query}` : ""}`
  )
  return { shifts: data.results, total: data.count }
}
