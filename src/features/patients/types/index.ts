import type { Media } from "@/features/users/types";

export type PatientGender = "M" | "F" | "O";

export type PatientBloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export interface PatientEmergencyContact {
  id: string;
  profile_family_id: string;
  profile_family_name: string;
  profile_family_phone: string;
  priority: number;
}

export interface PatientCaregiverAssignment {
  id: string;
  caregiver_id: string;
  caregiver_name: string;
  caregiver_email?: string | null;
  caregiver_specialization: string | null;
  is_active: boolean;
  assigned_at: string;
}

export interface Patient {
  id: string;
  clinic_id: string | null;
  guardian_id: string | null;
  name: string;
  birth_date: string;
  gender: PatientGender;
  cpf: string | null;
  phone: string;
  email: string | null;
  health_conditions: string;
  allergies: string;
  medications: string;
  blood_type: PatientBloodType | null;
  observations: string;
  media_id?: number | null;
  media?: Media | null;
  clinic_name?: string | null;
  guardian_name?: string | null;
  is_active: boolean;
  emergency_contacts: PatientEmergencyContact[];
  caregiver_assignments: PatientCaregiverAssignment[];
  created_at: string;
  updated_at: string;
}

export interface PatientDetail extends Patient {
  clinic_name: string | null;
  guardian_name: string | null;
  created_by_name: string;
}
