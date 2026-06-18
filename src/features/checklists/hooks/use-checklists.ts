"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { checklistKeys } from "@/lib/query-keys"
import {
  fetchChecklists,
  fetchChecklist,
  createChecklistFetch,
  updateChecklistFetch,
  deleteChecklistFetch,
} from "@/features/checklists/services"
import type { ChecklistFilters } from "@/features/checklists/types"

export function useChecklists(params?: ChecklistFilters) {
  return useQuery({
    queryKey: checklistKeys.list(params ?? {}),
    queryFn: () => fetchChecklists(params),
  })
}

export function useChecklist(id: number) {
  return useQuery({
    queryKey: checklistKeys.detail(id),
    queryFn: () => fetchChecklist(id),
    enabled: !!id,
  })
}

export function useCreateChecklist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createChecklistFetch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.lists() })
    },
  })
}

export function useUpdateChecklist(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => updateChecklistFetch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.lists() })
      queryClient.invalidateQueries({ queryKey: checklistKeys.detail(id) })
    },
  })
}

export function useDeleteChecklist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteChecklistFetch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checklistKeys.lists() })
    },
  })
}
