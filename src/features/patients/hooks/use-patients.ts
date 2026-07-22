"use client";

import { useQuery } from "@tanstack/react-query";
import { patientKeys } from "@/lib/query-keys";
import { fetchPatients, fetchPatient } from "@/features/patients/services";

export function usePatients(params?: {
  search?: string;
  clinicId?: string;
  isActive?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: patientKeys.list(params ?? {}),
    queryFn: () => fetchPatients(params),
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: () => fetchPatient(id),
    enabled: !!id,
  });
}
