import { apiFetchClient } from "@/lib/api-client";
import type { HealthAlert, HealthAlertFilters } from "@/features/health-alerts/types";

interface ApiHealthAlert {
  id: string;
  patient: string;
  patient_name: string;
  clinic: string;
  caregiver: string | null;
  caregiver_name: string | null;
  alert_type: string;
  severity: string;
  severity_display: string;
  status: string;
  indicator: string | null;
  current_value: string | null;
  expected_range: string | null;
  details: string | null;
  ai_insight: string | null;
  detected_at: string;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
  acknowledged_by_name: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  resolved_by_name: string | null;
  created_at: string;
  updated_at: string;
}

function mapHealthAlert(api: ApiHealthAlert): HealthAlert {
  return {
    id: String(api.id),
    patient_id: String(api.patient),
    patient_name: api.patient_name,
    clinic_id: String(api.clinic),
    caregiver_id: api.caregiver ? String(api.caregiver) : null,
    caregiver_name: api.caregiver_name,
    alert_type: api.alert_type as HealthAlert["alert_type"],
    severity: api.severity as HealthAlert["severity"],
    severity_display: api.severity_display,
    status: api.status as HealthAlert["status"],
    indicator: api.indicator,
    current_value: api.current_value,
    expected_range: api.expected_range,
    details: api.details,
    ai_insight: api.ai_insight,
    detected_at: api.detected_at,
    acknowledged_at: api.acknowledged_at,
    acknowledged_by_name: api.acknowledged_by_name,
    resolved_at: api.resolved_at,
    resolved_by_name: api.resolved_by_name,
    created_at: api.created_at,
    updated_at: api.updated_at,
  };
}

export async function fetchHealthAlerts(filters: HealthAlertFilters): Promise<HealthAlert[]> {
  const searchParams = new URLSearchParams();
  if (filters.patient_id) searchParams.set("patient_id", filters.patient_id);
  if (filters.clinic_id) searchParams.set("clinic_id", filters.clinic_id);
  if (filters.severity) searchParams.set("severity", filters.severity);
  if (filters.status) searchParams.set("status", filters.status);
  if (filters.alert_type) searchParams.set("alert_type", filters.alert_type);
  if (filters.days) searchParams.set("days", String(filters.days));
  const query = searchParams.toString();
  const data = await apiFetchClient<ApiHealthAlert[]>(
    `/ai/health-alerts/${query ? `?${query}` : ""}`
  );
  return data.map(mapHealthAlert);
}

export async function acknowledgeHealthAlert(alertId: string): Promise<HealthAlert> {
  const data = await apiFetchClient<ApiHealthAlert>(`/ai/health-alerts/${alertId}/acknowledge/`, {
    method: "POST",
  });
  return mapHealthAlert(data);
}

export async function resolveHealthAlert(alertId: string): Promise<HealthAlert> {
  const data = await apiFetchClient<ApiHealthAlert>(`/ai/health-alerts/${alertId}/resolve/`, {
    method: "POST",
  });
  return mapHealthAlert(data);
}
