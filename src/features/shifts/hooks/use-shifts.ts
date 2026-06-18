"use client"

import { useQuery } from "@tanstack/react-query"
import { getShiftsApi } from "@/features/shifts/services"

export function useShifts(params?: {
  clinicId?: string | number
  pageSize?: number
  page?: number
}) {
  return useQuery({
    queryKey: ["shifts", params],
    queryFn: () => getShiftsApi(params),
    staleTime: 60 * 1000,
    retry: 1,
  })
}
