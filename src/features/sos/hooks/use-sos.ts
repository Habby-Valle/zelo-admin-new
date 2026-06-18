"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getSosAlertsApi,
  getSosAlertApi,
  acknowledgeSosAlertApi,
  resolveSosAlertApi,
  getSosSummaryApi,
} from "@/features/sos/services"
import type { SosFilters } from "@/features/sos/types"
import { toast } from "sonner"

export const sosKeys = {
  all: ["sos"] as const,
  lists: () => [...sosKeys.all, "list"] as const,
  list: (params: SosFilters) => [...sosKeys.lists(), params] as const,
  details: () => [...sosKeys.all, "detail"] as const,
  detail: (id: number) => [...sosKeys.details(), id] as const,
  summary: () => [...sosKeys.all, "summary"] as const,
}

export function useSosAlerts(params?: SosFilters) {
  return useQuery({
    queryKey: params ? sosKeys.list(params) : sosKeys.lists(),
    queryFn: () => getSosAlertsApi(params),
    staleTime: 60 * 1000,
    retry: 1,
  })
}

export function useSosAlert(id: number) {
  return useQuery({
    queryKey: sosKeys.detail(id),
    queryFn: () => getSosAlertApi(id),
    enabled: !!id,
  })
}

export function useSosSummary(clinicId?: string | number) {
  return useQuery({
    queryKey: sosKeys.summary(),
    queryFn: () => getSosSummaryApi(clinicId),
  })
}

export function useAcknowledgeSosAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => acknowledgeSosAlertApi(id),
    onSuccess: () => {
      toast.success("Alerta confirmado.")
      queryClient.invalidateQueries({ queryKey: sosKeys.all })
    },
    onError: () => {
      toast.error("Erro ao confirmar alerta.")
    },
  })
}

export function useResolveSosAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      resolveSosAlertApi(id, reason),
    onSuccess: () => {
      toast.success("Alerta resolvido.")
      queryClient.invalidateQueries({ queryKey: sosKeys.all })
    },
    onError: () => {
      toast.error("Erro ao resolver alerta.")
    },
  })
}
