import { apiFetchClient } from "@/lib/api-client"
import type { PaginatedResponse } from "@/types"
import type { User } from "@/features/users/types"

interface UsersResponse {
  users: User[]
  total: number
}

export async function getUsersApi(params?: {
  role?: string
  clinicId?: string | number
  pageSize?: number
  page?: number
}): Promise<UsersResponse> {
  const searchParams = new URLSearchParams()
  if (params?.role) searchParams.set("role", params.role)
  if (params?.clinicId) searchParams.set("clinic_id", String(params.clinicId))
  if (params?.pageSize) searchParams.set("page_size", String(params.pageSize))
  if (params?.page) searchParams.set("page", String(params.page))
  const query = searchParams.toString()
  const data = await apiFetchClient<PaginatedResponse<User>>(
    `/users/${query ? `?${query}` : ""}`
  )
  return { users: data.results, total: data.count }
}
