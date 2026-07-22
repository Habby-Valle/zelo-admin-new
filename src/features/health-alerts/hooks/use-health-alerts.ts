"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { healthAlertKeys } from "@/lib/query-keys";
import {
  fetchHealthAlerts,
  acknowledgeHealthAlert,
  resolveHealthAlert,
} from "@/features/health-alerts/services";
import type { HealthAlertFilters } from "@/features/health-alerts/types";

export function useHealthAlerts(filters: HealthAlertFilters) {
  return useQuery({
    queryKey: healthAlertKeys.list(filters),
    queryFn: () => fetchHealthAlerts(filters),
    enabled: !!filters.patient_id,
  });
}

export function useAcknowledgeHealthAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId: string) => acknowledgeHealthAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: healthAlertKeys.all });
    },
  });
}

export function useResolveHealthAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId: string) => resolveHealthAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: healthAlertKeys.all });
    },
  });
}
