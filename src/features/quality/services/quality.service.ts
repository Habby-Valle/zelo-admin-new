import { apiFetchClient } from "@/lib/api-client";
import type {
  ProtocolCompliance,
  ComplianceStats,
  ComplianceFilters,
} from "@/features/quality/types";

interface ApiCompliancePage {
  count: number;
  results: ProtocolCompliance[];
}

export async function fetchComplianceList(
  filters?: ComplianceFilters
): Promise<ProtocolCompliance[]> {
  const searchParams = new URLSearchParams();
  if (filters?.caregiver_id) searchParams.set("caregiver_id", filters.caregiver_id);
  if (filters?.clinic_id) searchParams.set("clinic_id", filters.clinic_id);
  const query = searchParams.toString();

  const data = await apiFetchClient<ApiCompliancePage>(
    `/quality/compliance/${query ? `?${query}` : ""}`
  );
  return data.results ?? [];
}

export async function fetchComplianceStats(): Promise<ComplianceStats[]> {
  const data = await apiFetchClient<ComplianceStats[]>("/quality/compliance/stats/");
  return data ?? [];
}
