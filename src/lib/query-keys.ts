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
  list: (params?: { isActive?: boolean; pageSize?: number }) =>
    [...planKeys.lists(), params] as const,
}
