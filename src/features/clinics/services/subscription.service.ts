import { apiFetchClient } from "@/lib/api-client";
import type { SubscriptionInfo } from "@/features/clinics/types";

export async function getClinicSubscriptionApi(clinicId: number): Promise<SubscriptionInfo | null> {
  try {
    return await apiFetchClient<SubscriptionInfo>(`/subscriptions/${clinicId}/`);
  } catch {
    return null;
  }
}
