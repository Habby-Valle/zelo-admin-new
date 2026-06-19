export type SosStatus = "active" | "acknowledged" | "resolved";

export interface SosAlert {
  id: number;
  caregiver_id: number;
  caregiver_name: string | null;
  patient_id: number;
  patient_name: string | null;
  shift_id: number | null;
  clinic_id: number | null;
  clinic_name: string | null;
  status: SosStatus;
  triggered_at: string;
  acknowledged_by_id: number | null;
  acknowledged_by_name: string | null;
  acknowledged_at: string | null;
  resolved_by_id: number | null;
  resolved_by_name: string | null;
  resolved_at: string | null;
  resolution_reason: string | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface SosFilters {
  status?: SosStatus | "all";
  clinic_id?: string | number;
  page?: number;
  page_size?: number;
}

export interface SosSummary {
  active: number;
  acknowledged: number;
  resolvedToday: number;
}
