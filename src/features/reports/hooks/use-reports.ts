"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchShiftsReport,
  fetchChecklistsReport,
  fetchPatientsGrowthReport,
  fetchSosReport,
  fetchCaregiversReport,
  fetchSatisfactionReport,
} from "@/features/reports/services";
import type { ReportFilters } from "@/features/reports/types";

export const reportKeys = {
  all: ["reports"] as const,
  shifts: (params: object) => [...reportKeys.all, "shifts", params] as const,
  checklists: (params: object) => [...reportKeys.all, "checklists", params] as const,
  patientsGrowth: (params: object) => [...reportKeys.all, "patients-growth", params] as const,
  sos: (params: object) => [...reportKeys.all, "sos", params] as const,
  caregivers: (params: object) => [...reportKeys.all, "caregivers", params] as const,
  satisfaction: (params: object) => [...reportKeys.all, "satisfaction", params] as const,
};

export function useShiftsReport(filters: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.shifts(filters),
    queryFn: () => fetchShiftsReport(filters.dateRange, filters.clinicId),
    enabled: !!filters.dateRange.from && !!filters.dateRange.to,
  });
}

export function useChecklistsReport(filters: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.checklists(filters),
    queryFn: () => fetchChecklistsReport(filters.dateRange, filters.clinicId),
    enabled: !!filters.dateRange.from && !!filters.dateRange.to,
  });
}

export function usePatientsGrowthReport(filters: ReportFilters, months: number = 6) {
  return useQuery({
    queryKey: reportKeys.patientsGrowth({ ...filters, months }),
    queryFn: () => fetchPatientsGrowthReport(months, filters.clinicId),
    enabled: !!filters.dateRange.from && !!filters.dateRange.to,
  });
}

export function useSosReport(filters: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.sos(filters),
    queryFn: () => fetchSosReport(filters.dateRange, filters.clinicId),
    enabled: !!filters.dateRange.from && !!filters.dateRange.to,
  });
}

export function useCaregiversReport(filters: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.caregivers(filters),
    queryFn: () => fetchCaregiversReport(filters.dateRange, filters.clinicId),
    enabled: !!filters.dateRange.from && !!filters.dateRange.to,
  });
}

export function useSatisfactionReport(filters: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.satisfaction(filters),
    queryFn: () => fetchSatisfactionReport(filters.dateRange, filters.clinicId),
    enabled: !!filters.dateRange.from && !!filters.dateRange.to,
  });
}
