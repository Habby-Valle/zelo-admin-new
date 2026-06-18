export type ShiftStatus = "scheduled" | "in_progress" | "completed" | "cancelled"

export interface ShiftPatient {
  id: string
  patient_id: string
  patient_name: string
}

export interface Shift {
  id: number
  caregiver_id: number
  clinic_id: number | null
  start: string
  end: string
  status: ShiftStatus
  notes: string
  shift_patients: ShiftPatient[]
  created_at: string
  updated_at: string
}

export interface ShiftDetail extends Shift {
  caregiver_name: string
  clinic_name: string | null
  created_by_name: string | null
}

export interface ShiftFilters {
  search?: string
  status?: string
  clinicId?: string
  page?: number
  pageSize?: number
}
