export interface Shift {
  id: number
  shift_patients?: { patient_name: string }[]
  caregiver_name: string
  start: string
  status: string
}
