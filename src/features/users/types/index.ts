export type UserRole =
  | "super_admin"
  | "clinic_admin"
  | "guardian"
  | "caregiver"
  | "family"
  | "emergency_contact";

export type InviteRole = "clinic_admin" | "guardian" | "caregiver" | "family";

export type InviteStatus = "pending" | "accepted" | "expired" | "cancelled";

export interface Media {
  id: string;
  url: string | null;
  original_filename: string;
  mime_type: string;
  file_size: number;
  created_at: string;
}

export interface User {
  id: string;
  clinic_id: string | null;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "blocked" | "pending";
  avatar_url?: string | null;
  media_id?: string | null;
  media?: Media | null;
  created_at: string;
  last_sign_in_at?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  media_id: string | null;
  media: Media | null;
  is_active: boolean;
  verification_status?: string | null;
  created_at: string;
}

export interface Invite {
  id: string;
  email: string;
  role: InviteRole;
  status: InviteStatus;
  created_by_name: string;
  clinic_id: string | null;
  guardian_id: string | null;
  created_at: string;
  expires_at: string;
}
