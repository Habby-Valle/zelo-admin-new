"use client";

import { useQuery } from "@tanstack/react-query";
import { complianceKeys } from "@/lib/query-keys";
import {
  fetchComplianceList,
  fetchComplianceStats,
} from "@/features/quality/services";
import type { ComplianceFilters } from "@/features/quality/types";

export function useComplianceList(filters?: ComplianceFilters) {
  return useQuery({
    queryKey: complianceKeys.list(filters ?? {}),
    queryFn: () => fetchComplianceList(filters),
  });
}

export function useComplianceStats() {
  return useQuery({
    queryKey: complianceKeys.stats(),
    queryFn: fetchComplianceStats,
  });
}
