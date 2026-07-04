import { apiFetchClient } from "@/lib/api-client";
import type {
  CaregiverWorkLog,
  CaregiverHoursSummary,
  CaregiverHoursFilters,
} from "@/features/caregiver-hours/types";

interface ApiWorkLog {
  id: string;
  caregiver: string;
  caregiver_name: string;
  clinic: string;
  clinic_name: string;
  date: string;
  total_seconds: number;
  total_hours: string;
  shift_count: number;
  completed: number;
  cancelled: number;
  overnight: boolean;
}

interface ApiSummary {
  total_hours: string;
  avg_hours_per_shift: string;
  period: {
    start_date: string;
    end_date: string;
  };
}

interface ApiWorkLogPage {
  count: number;
  results: ApiWorkLog[];
}

function mapWorkLog(api: ApiWorkLog): CaregiverWorkLog {
  return {
    id: String(api.id),
    caregiver_id: String(api.caregiver),
    caregiver_name: api.caregiver_name,
    clinic_id: String(api.clinic),
    clinic_name: api.clinic_name,
    date: api.date,
    total_seconds: api.total_seconds,
    total_hours: api.total_hours,
    shift_count: api.shift_count,
    completed: api.completed,
    cancelled: api.cancelled,
    overnight: api.overnight,
  };
}

export async function fetchCaregiverHours(
  filters: CaregiverHoursFilters
): Promise<{ count: number; results: CaregiverWorkLog[] }> {
  const searchParams = new URLSearchParams();
  if (filters.start_date) searchParams.set("start_date", filters.start_date);
  if (filters.end_date) searchParams.set("end_date", filters.end_date);
  if (filters.caregiver_id) searchParams.set("caregiver_id", filters.caregiver_id);
  if (filters.clinic_id) searchParams.set("clinic_id", filters.clinic_id);
  if (filters.page) searchParams.set("page", String(filters.page));
  searchParams.set("page_size", "365");

  const query = searchParams.toString();
  const data = await apiFetchClient<ApiWorkLogPage>(
    `/caregiver-hours/${query ? `?${query}` : ""}`
  );
  return {
    count: data.count,
    results: data.results.map(mapWorkLog),
  };
}

export async function fetchCaregiverHoursSummary(
  startDate?: string,
  endDate?: string
): Promise<CaregiverHoursSummary | null> {
  const searchParams = new URLSearchParams();
  if (startDate) searchParams.set("start_date", startDate);
  if (endDate) searchParams.set("end_date", endDate);
  const query = searchParams.toString();

  const data = await apiFetchClient<ApiSummary>(
    `/caregiver-hours/summary/${query ? `?${query}` : ""}`
  );
  if (!data) return null;
  return {
    total_hours: data.total_hours,
    avg_hours_per_shift: data.avg_hours_per_shift,
    period: data.period,
  };
}
