"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { planKeys, benefitKeys } from "@/lib/query-keys"
import {
  fetchPlans,
  fetchPlan,
  fetchBenefits,
  createPlanFetch,
  updatePlanFetch,
  deletePlanFetch,
  createBenefitFetch,
  updateBenefitFetch,
  deleteBenefitFetch,
} from "@/features/plans/services"
import type { PlanFormValues } from "@/lib/validations/plan"

// ─── Queries ──────────────────────────────────────────────────────────────────

export function usePlans(params?: {
  search?: string
  isActive?: boolean | null
  page?: number
  pageSize?: number
  scope?: string
}) {
  return useQuery({
    queryKey: planKeys.list(params),
    queryFn: () => fetchPlans(params),
  })
}

export function usePlan(id: string) {
  return useQuery({
    queryKey: planKeys.detail(id),
    queryFn: () => fetchPlan(id),
    enabled: !!id,
  })
}

export function useBenefits() {
  return useQuery({
    queryKey: benefitKeys.lists(),
    queryFn: fetchBenefits,
    staleTime: 5 * 60 * 1000,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

function buildPayload(values: PlanFormValues) {
  return {
    name: values.name,
    description: values.description ?? "",
    monthly_price: values.monthly_price,
    yearly_price: values.yearly_price ?? null,
    scope: values.scope ?? "clinic",
    is_active: values.is_active,
    benefits: (values.benefits ?? []).map((b) => ({
      benefit_id: b.benefit_id,
      value: b.value,
    })),
  }
}

export function useCreatePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: PlanFormValues) => createPlanFetch(buildPayload(values)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.lists() })
    },
  })
}

export function useUpdatePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: PlanFormValues }) =>
      updatePlanFetch(id, buildPayload(values)),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: planKeys.lists() })
      queryClient.invalidateQueries({ queryKey: planKeys.detail(id) })
    },
  })
}

export function useTogglePlanActive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updatePlanFetch(id, { is_active: isActive }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: planKeys.lists() })
      queryClient.invalidateQueries({ queryKey: planKeys.detail(id) })
    },
  })
}

export function useDeletePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deletePlanFetch(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: planKeys.lists() })
      queryClient.removeQueries({ queryKey: planKeys.detail(id) })
    },
  })
}

// ─── Benefit Mutations ────────────────────────────────────────────────────────

export function useCreateBenefit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { key: string; label: string; description?: string }) =>
      createBenefitFetch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: benefitKeys.lists() })
    },
  })
}

export function useUpdateBenefit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: Partial<{ key: string; label: string; description: string }>
    }) => updateBenefitFetch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: benefitKeys.lists() })
    },
  })
}

export function useDeleteBenefit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteBenefitFetch(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: benefitKeys.lists() })
      queryClient.removeQueries({ queryKey: benefitKeys.detail(id) })
    },
  })
}
