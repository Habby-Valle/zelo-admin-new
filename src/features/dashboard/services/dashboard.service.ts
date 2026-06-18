import { apiFetchClient } from "@/lib/api-client"
import type { DashboardData } from "@/features/dashboard/types"

export async function getDashboardApi(): Promise<DashboardData> {
  return apiFetchClient<DashboardData>("/dashboard/")
}
