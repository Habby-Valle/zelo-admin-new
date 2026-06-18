import { apiFetchClient } from "@/lib/api-client"
import type { PaginatedResponse } from "@/types"
import type { Plan, PlanBenefit } from "@/features/plans/types"

interface ApiPlan {
  id: number
  name: string
  description: string
  monthly_price: string
  yearly_price: string | null
  is_active: boolean
  benefits: {
    id: number
    benefit_id: number
    benefit_key: string
    benefit_label: string
    value: string
  }[]
  clinics_count?: number
  created_at: string
  updated_at: string
  scope?: string
}

function mapPlan(api: ApiPlan): Plan {
  return {
    id: String(api.id),
    name: api.name,
    description: api.description,
    monthly_price: parseFloat(api.monthly_price),
    yearly_price:
      api.yearly_price != null ? parseFloat(api.yearly_price) : null,
    is_active: api.is_active,
    benefits: (api.benefits ?? []).map((b) => ({
      id: String(b.id),
      benefit_id: String(b.benefit_id),
      benefit_key: b.benefit_key,
      benefit_label: b.benefit_label,
      value: b.value,
    })),
    clinics_count: api.clinics_count,
    created_at: api.created_at,
    updated_at: api.updated_at,
    scope: api.scope,
  }
}

function mapBenefit(api: { id: number; key: string; label: string; description: string }): PlanBenefit {
  return {
    id: String(api.id),
    key: api.key,
    label: api.label,
    description: api.description,
  }
}

export async function fetchPlans(params?: {
  search?: string
  isActive?: boolean | null
  page?: number
  pageSize?: number
  scope?: string
}): Promise<{ plans: Plan[]; total: number }> {
  const searchParams = new URLSearchParams()
  if (params?.search) searchParams.set("search", params.search)
  if (params?.isActive !== null && params?.isActive !== undefined)
    searchParams.set("is_active", String(params.isActive))
  if (params?.scope) searchParams.set("scope", params.scope)
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.pageSize) searchParams.set("page_size", String(params.pageSize))
  const query = searchParams.toString()
  const data = await apiFetchClient<PaginatedResponse<ApiPlan>>(`/plans/${query ? `?${query}` : ""}`)
  return { plans: data.results.map(mapPlan), total: data.count }
}

export async function fetchPlan(id: string): Promise<Plan> {
  const data = await apiFetchClient<ApiPlan>(`/plans/${id}/`)
  return mapPlan(data)
}

export async function createPlanFetch(data: {
  name: string
  description: string
  monthly_price: number
  yearly_price?: number | null
  scope?: string
  is_active: boolean
  benefits?: { benefit_id: number; value: string }[]
}): Promise<Plan> {
  const result = await apiFetchClient<ApiPlan>("/plans/", {
    method: "POST",
    body: JSON.stringify(data),
  })
  return mapPlan(result)
}

export async function updatePlanFetch(
  id: string,
  data: Partial<{
    name: string
    description: string
    monthly_price: number
    yearly_price: number | null
    is_active: boolean
    benefits: { benefit_id: number; value: string }[]
  }>
): Promise<Plan> {
  const result = await apiFetchClient<ApiPlan>(`/plans/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
  return mapPlan(result)
}

export async function deletePlanFetch(id: string): Promise<void> {
  await apiFetchClient<void>(`/plans/${id}/`, { method: "DELETE" })
}

export async function fetchBenefits(): Promise<PlanBenefit[]> {
  const data = await apiFetchClient<{ id: number; key: string; label: string; description: string }[]>("/benefits/")
  return data.map(mapBenefit)
}

export async function createBenefitFetch(data: {
  key: string
  label: string
  description?: string
}): Promise<PlanBenefit> {
  const result = await apiFetchClient<{ id: number; key: string; label: string; description: string }>("/benefits/", {
    method: "POST",
    body: JSON.stringify(data),
  })
  return mapBenefit(result)
}

export async function updateBenefitFetch(
  id: string,
  data: Partial<{ key: string; label: string; description: string }>
): Promise<PlanBenefit> {
  const result = await apiFetchClient<{ id: number; key: string; label: string; description: string }>(`/benefits/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
  return mapBenefit(result)
}

export async function deleteBenefitFetch(id: string): Promise<void> {
  await apiFetchClient<void>(`/benefits/${id}/`, { method: "DELETE" })
}
