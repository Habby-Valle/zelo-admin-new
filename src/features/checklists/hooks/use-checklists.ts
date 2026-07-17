"use client";

import { useQuery } from "@tanstack/react-query";
import { checklistKeys } from "@/lib/query-keys";
import { fetchChecklists, fetchChecklist } from "@/features/checklists/services";
import type { ChecklistFilters } from "@/features/checklists/types";

export function useChecklists(params?: ChecklistFilters) {
  return useQuery({
    queryKey: checklistKeys.list(params ?? {}),
    queryFn: () => fetchChecklists(params),
  });
}

export function useChecklist(id: string) {
  return useQuery({
    queryKey: checklistKeys.detail(id),
    queryFn: () => fetchChecklist(id),
    enabled: !!id,
  });
}
