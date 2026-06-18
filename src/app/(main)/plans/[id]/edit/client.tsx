"use client"

import { useRouter, notFound } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PlanForm } from "@/features/plans/components"
import { usePlan, useUpdatePlan, useBenefits } from "@/features/plans/hooks"
import type { PlanFormValues } from "@/lib/validations/plan"

interface EditPlanPageClientProps {
  id: string
}

export default function EditPlanPageClient({ id }: EditPlanPageClientProps) {
  const router = useRouter()
  const { data: plan, isLoading, isError } = usePlan(id)
  const { data: benefits = [] } = useBenefits()
  const updatePlan = useUpdatePlan()

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError || !plan) {
    notFound()
  }

  const defaultValues: Partial<PlanFormValues> = {
    name: plan.name,
    description: plan.description,
    monthly_price: plan.monthly_price,
    yearly_price: plan.yearly_price,
    is_active: plan.is_active,
    benefits: plan.benefits.map((b) => ({
      benefit_id: Number(b.benefit_id),
      value: b.value,
    })),
  }

  async function handleSubmit(values: PlanFormValues) {
    await new Promise<void>((resolve, reject) => {
      updatePlan.mutate(
        { id, values },
        {
          onSuccess: () => {
            router.push(`/plans/${id}`)
            resolve()
          },
          onError: (err) => reject(err),
        }
      )
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/plans/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar Plano</h1>
          <p className="text-muted-foreground">
            Edite as informações do plano.
          </p>
        </div>
      </div>

      {updatePlan.error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
          {updatePlan.error.message}
        </div>
      )}

      <div className="mx-auto max-w-2xl">
        <PlanForm
          defaultValues={defaultValues}
          benefits={benefits}
          onSubmit={handleSubmit}
          isLoading={updatePlan.isPending}
        />
      </div>
    </div>
  )
}
