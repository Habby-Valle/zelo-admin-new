export interface SosAlert {
  id: number
  patient_name: string | null
  caregiver_name: string | null
  triggered_at: string
  status: string
}
