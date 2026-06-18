"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchAuditLogs, fetchAuditLog } from "@/features/audit-logs/services"
import type { AuditLogFilters } from "@/features/audit-logs/types"

export const auditLogKeys = {
  all: ["audit-logs"] as const,
  lists: () => [...auditLogKeys.all, "list"] as const,
  list: (params: AuditLogFilters) => [...auditLogKeys.lists(), params] as const,
  details: () => [...auditLogKeys.all, "detail"] as const,
  detail: (id: string) => [...auditLogKeys.details(), id] as const,
}

export function useAuditLogs(params: AuditLogFilters) {
  return useQuery({
    queryKey: auditLogKeys.list(params),
    queryFn: () => fetchAuditLogs(params),
  })
}

export function useAuditLog(id: string) {
  return useQuery({
    queryKey: auditLogKeys.detail(id),
    queryFn: () => fetchAuditLog(id),
    enabled: !!id,
  })
}
