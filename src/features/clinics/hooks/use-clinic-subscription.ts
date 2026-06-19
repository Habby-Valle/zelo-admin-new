"use client";

import { useQuery } from "@tanstack/react-query";
import { subscriptionKeys } from "@/lib/query-keys";
import { getClinicSubscriptionApi } from "@/features/clinics/services/subscription.service";
import type { SubscriptionInfo } from "@/features/clinics/types";

export function useClinicSubscription(clinicId: number) {
  return useQuery<SubscriptionInfo | null>({
    queryKey: subscriptionKeys.byClinic(clinicId),
    queryFn: () => getClinicSubscriptionApi(clinicId),
    enabled: !!clinicId,
  });
}
