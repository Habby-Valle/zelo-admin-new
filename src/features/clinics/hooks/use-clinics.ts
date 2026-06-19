"use client";

import { useQuery } from "@tanstack/react-query";
import { clinicKeys } from "@/lib/query-keys";
import { getClinicsApi } from "@/features/clinics/services/clinics.service";
import type { ClinicStatus } from "@/features/clinics/types";

export function useClinics(params?: {
  search?: string;
  status?: ClinicStatus | "all";
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: clinicKeys.list(params),
    queryFn: () => getClinicsApi(params),
    staleTime: 60 * 1000,
    retry: 1,
  });
}
