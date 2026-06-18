"use client"

import { useQuery } from "@tanstack/react-query"
import { getUsersApi } from "@/features/users/services"

export function useUsers(params?: {
  role?: string
  clinicId?: string | number
  pageSize?: number
  page?: number
}) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => getUsersApi(params),
    staleTime: 60 * 1000,
    retry: 1,
  })
}
