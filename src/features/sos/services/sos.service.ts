import { apiFetchClient } from "@/lib/api-client"
import type { PaginatedResponse } from "@/types"
import type { SosAlert } from "@/features/sos/types"

interface SosAlertsResponse {
  alerts: SosAlert[]
  total: number
}

export async function getSosAlertsApi(params?: {
  clinic_id?: string | number
  page_size?: number
  page?: number
}): Promise<SosAlertsResponse> {
  const searchParams = new URLSearchParams()
  if (params?.clinic_id) searchParams.set("clinic_id", String(params.clinic_id))
  if (params?.page_size) searchParams.set("page_size", String(params.page_size))
  if (params?.page) searchParams.set("page", String(params.page))
  const query = searchParams.toString()
  const data = await apiFetchClient<PaginatedResponse<SosAlert>>(
    `/sos/${query ? `?${query}` : ""}`
  )
  return { alerts: data.results, total: data.count }
}
