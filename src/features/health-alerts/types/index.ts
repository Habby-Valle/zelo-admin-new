export type HealthAlertSeverity = "low" | "medium" | "high" | "critical";

export type HealthAlertStatus = "open" | "acknowledged" | "resolved" | "dismissed";

export type HealthAlertType =
  | "vital_sign_anomaly"
  | "medication_skip"
  | "sos_frequency"
  | "decline_trend"
  | "missing_data";

export interface HealthAlert {
  id: string;
  patient_id: string;
  patient_name: string;
  clinic_id: string;
  caregiver_id: string | null;
  caregiver_name: string | null;
  alert_type: HealthAlertType;
  severity: HealthAlertSeverity;
  severity_display: string;
  status: HealthAlertStatus;
  indicator: string | null;
  current_value: string | null;
  expected_range: string | null;
  details: string | null;
  ai_insight: string | null;
  detected_at: string;
  acknowledged_at: string | null;
  acknowledged_by_name: string | null;
  resolved_at: string | null;
  resolved_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface HealthAlertFilters {
  patient_id?: string;
  clinic_id?: string;
  severity?: HealthAlertSeverity | "";
  status?: HealthAlertStatus | "";
  alert_type?: HealthAlertType | "";
  days?: number;
}
