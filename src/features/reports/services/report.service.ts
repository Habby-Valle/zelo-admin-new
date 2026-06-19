import { apiFetchClient } from "@/lib/api-client";
import type {
  ShiftsReportData,
  ChecklistsReportData,
  PatientsGrowthData,
  SosReportData,
  CaregiverReportData,
  ReportDateRange,
} from "@/features/reports/types";

async function buildQuery(dateRange: ReportDateRange, clinicId?: string): Promise<string> {
  const qs = new URLSearchParams();
  qs.set("date_from", dateRange.from);
  qs.set("date_to", dateRange.to);
  if (clinicId && clinicId !== "all") qs.set("clinic_id", clinicId);
  return qs.toString();
}

export async function fetchShiftsReport(
  dateRange: ReportDateRange,
  clinicId?: string
): Promise<ShiftsReportData[]> {
  const qs = await buildQuery(dateRange, clinicId);
  return apiFetchClient<ShiftsReportData[]>(`/reports/shifts/?${qs}`);
}

export async function fetchChecklistsReport(
  dateRange: ReportDateRange,
  clinicId?: string
): Promise<ChecklistsReportData[]> {
  const qs = await buildQuery(dateRange, clinicId);
  return apiFetchClient<ChecklistsReportData[]>(`/reports/checklists/?${qs}`);
}

export async function fetchPatientsGrowthReport(
  months: number = 6,
  clinicId?: string
): Promise<PatientsGrowthData[]> {
  const qs = new URLSearchParams();
  qs.set("months", String(months));
  if (clinicId && clinicId !== "all") qs.set("clinic_id", clinicId);
  return apiFetchClient<PatientsGrowthData[]>(`/reports/patients-growth/?${qs}`);
}

export async function fetchSosReport(
  dateRange: ReportDateRange,
  clinicId?: string
): Promise<SosReportData> {
  const qs = await buildQuery(dateRange, clinicId);
  return apiFetchClient<SosReportData>(`/reports/sos/?${qs}`);
}

export async function fetchCaregiversReport(
  dateRange: ReportDateRange,
  clinicId?: string
): Promise<CaregiverReportData[]> {
  const qs = await buildQuery(dateRange, clinicId);
  return apiFetchClient<CaregiverReportData[]>(`/reports/caregivers/?${qs}`);
}
