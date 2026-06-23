"use client";

import { useQuery } from "@tanstack/react-query";
import { clinicKeys } from "@/lib/query-keys";
import { getClinicApi } from "@/features/clinics/services/clinics.service";

export function useClinic(id: string) {
  return useQuery({
    queryKey: clinicKeys.detail(id),
    queryFn: () => getClinicApi(id),
    staleTime: 60 * 1000,
    retry: 1,
    enabled: !!id,
  });
}
