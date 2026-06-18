"use client"

import { useQuery } from "@tanstack/react-query"
import { getPatientsApi } from "@/features/patients/services"

export function usePatients(params?: {
  clinicId?: string | number
  pageSize?: number
  page?: number
}) {
  return useQuery({
    queryKey: ["patients", params],
    queryFn: () => getPatientsApi(params),
    staleTime: 60 * 1000,
    retry: 1,
  })
}
