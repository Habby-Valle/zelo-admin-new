"use client"

import { useQuery } from "@tanstack/react-query"
import { getSosAlertsApi } from "@/features/sos/services"

export function useSosAlerts(params?: {
  clinic_id?: string | number
  page_size?: number
  page?: number
}) {
  return useQuery({
    queryKey: ["sos-alerts", params],
    queryFn: () => getSosAlertsApi(params),
    staleTime: 60 * 1000,
    retry: 1,
  })
}
