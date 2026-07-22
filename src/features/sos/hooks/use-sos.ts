"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getSosAlertsApi,
  getSosAlertApi,
  getSosSummaryApi,
} from "@/features/sos/services";
import type { SosFilters } from "@/features/sos/types";

export const sosKeys = {
  all: ["sos"] as const,
  lists: () => [...sosKeys.all, "list"] as const,
  list: (params: SosFilters) => [...sosKeys.lists(), params] as const,
  details: () => [...sosKeys.all, "detail"] as const,
  detail: (id: string) => [...sosKeys.details(), id] as const,
  summary: () => [...sosKeys.all, "summary"] as const,
};

export function useSosAlerts(params?: SosFilters) {
  return useQuery({
    queryKey: params ? sosKeys.list(params) : sosKeys.lists(),
    queryFn: () => getSosAlertsApi(params),
    staleTime: 60 * 1000,
    retry: 1,
  });
}

export function useSosAlert(id: string) {
  return useQuery({
    queryKey: sosKeys.detail(id),
    queryFn: () => getSosAlertApi(id),
    enabled: !!id,
  });
}

export function useSosSummary(clinicId?: string) {
  return useQuery({
    queryKey: sosKeys.summary(),
    queryFn: () => getSosSummaryApi(clinicId),
  });
}
