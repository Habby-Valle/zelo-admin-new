export interface SystemSettings {
  maintenance_mode: boolean
  maintenance_message: string
  maintenance_planned_end: string | null
  plans_enabled: boolean
  feedback_visible: boolean
  app_name: string
  app_url: string
  app_site_url: string
  app_store_url: string
  play_store_url: string
  support_email: string
  support_phone: string
  support_whatsapp: string
  admin_logo_url: string
  cnpj: string
  address: string
  timezone: string
  currency: string
}

export interface RetentionPolicy {
  id: number
  model_name: string
  retention_days: number
}

export interface EncryptionStatus {
  table: string
  field: string
  label: string
  sample_checked: boolean
  encrypted: boolean
}

export interface LgpdConfig {
  retention_policies: RetentionPolicy[]
  encryption_key_configured: boolean
  encryption_statuses: EncryptionStatus[]
}

export interface UserSearchResult {
  id: number
  name: string
  email: string
  role: string
}

export interface PatientSearchResult {
  id: number
  name: string
  clinic_name: string
}
