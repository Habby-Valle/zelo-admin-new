"use client";

import { useQuery } from "@tanstack/react-query";
import { caregiverHoursKeys } from "@/lib/query-keys";
import {
  fetchCaregiverHours,
  fetchCaregiverHoursSummary,
} from "@/features/caregiver-hours/services";
import type { CaregiverHoursFilters } from "@/features/caregiver-hours/types";

export function useCaregiverHours(filters: CaregiverHoursFilters) {
  return useQuery({
    queryKey: caregiverHoursKeys.list(filters),
    queryFn: () => fetchCaregiverHours(filters),
  });
}

export function useCaregiverHoursSummary(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: caregiverHoursKeys.summary({ startDate, endDate }),
    queryFn: () => fetchCaregiverHoursSummary(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}
