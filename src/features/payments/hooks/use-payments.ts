"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPlanPayments } from "@/features/payments/services";

export function usePlanPayments(params?: {
  status?: string;
  search?: string;
  clinic_id?: string;
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: ["plan-payments", params],
    queryFn: () => fetchPlanPayments(params),
    staleTime: 60 * 1000,
  });
}

export function useClinicPayments(
  clinicId: string,
  params?: { page?: number; page_size?: number }
) {
  return useQuery({
    queryKey: ["payments", "clinic", clinicId, params],
    queryFn: () => fetchPlanPayments({ ...params, clinic_id: clinicId }),
    staleTime: 60 * 1000,
  });
}
