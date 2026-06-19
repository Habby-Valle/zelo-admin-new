"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardApi } from "@/features/dashboard/services/dashboard.service";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardApi,
    staleTime: 60 * 1000,
    retry: 1,
  });
}
