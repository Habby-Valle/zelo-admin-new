import type { ClinicStatus } from "@/features/clinics/types"

export const clinicKeys = {
  all: ["clinics"] as const,
  lists: () => [...clinicKeys.all, "list"] as const,
  list: (params?: {
    search?: string
    status?: ClinicStatus | "all"
    page?: number
  }) => [...clinicKeys.lists(), params] as const,
  details: () => [...clinicKeys.all, "detail"] as const,
  detail: (id: number) => [...clinicKeys.details(), id] as const,
}

export const subscriptionKeys = {
  all: ["subscriptions"] as const,
  byClinic: (clinicId: number) =>
    [...subscriptionKeys.all, "by-clinic", clinicId] as const,
}

export const planKeys = {
  all: ["plans"] as const,
  lists: () => [...planKeys.all, "list"] as const,
  list: (params?: {
    search?: string
    isActive?: boolean | null
    page?: number
    pageSize?: number
    scope?: string
  }) => [...planKeys.lists(), params] as const,
  details: () => [...planKeys.all, "detail"] as const,
  detail: (id: string) => [...planKeys.details(), id] as const,
}

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params: object) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}

export const inviteKeys = {
  all: ["invites"] as const,
  lists: () => [...inviteKeys.all, "list"] as const,
  list: (params: object) => [...inviteKeys.lists(), params] as const,
}

export const patientKeys = {
  all: ["patients"] as const,
  lists: () => [...patientKeys.all, "list"] as const,
  list: (params: object) => [...patientKeys.lists(), params] as const,
  details: () => [...patientKeys.all, "detail"] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
}

export const benefitKeys = {
  all: ["benefits"] as const,
  lists: () => [...benefitKeys.all, "list"] as const,
  details: () => [...benefitKeys.all, "detail"] as const,
  detail: (id: string) => [...benefitKeys.details(), id] as const,
}

export const broadcastKeys = {
  all: ["broadcasts"] as const,
  lists: () => [...broadcastKeys.all, "list"] as const,
  list: () => [...broadcastKeys.lists()] as const,
}

export const auditLogKeys = {
  all: ["audit-logs"] as const,
  lists: () => [...auditLogKeys.all, "list"] as const,
  list: (params: object) => [...auditLogKeys.lists(), params] as const,
  details: () => [...auditLogKeys.all, "detail"] as const,
  detail: (id: string) => [...auditLogKeys.details(), id] as const,
}
