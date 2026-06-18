"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PlanForm } from "@/features/plans/components"
import { useCreatePlan, useBenefits } from "@/features/plans/hooks"
import type { PlanFormValues } from "@/lib/validations/plan"

export default function NewPlanPage() {
  const router = useRouter()
  const createPlan = useCreatePlan()
  const { data: benefits = [] } = useBenefits()

  async function handleSubmit(values: PlanFormValues) {
    await new Promise<void>((resolve, reject) => {
      createPlan.mutate(values, {
        onSuccess: () => {
          router.push("/plans")
          resolve()
        },
        onError: (err) => reject(err),
      })
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/plans")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Novo Plano</h1>
          <p className="text-muted-foreground">
            Crie um novo plano de assinatura.
          </p>
        </div>
      </div>

      {createPlan.error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
          {createPlan.error.message}
        </div>
      )}

      <div className="mx-auto max-w-2xl">
        <PlanForm
          benefits={benefits}
          onSubmit={handleSubmit}
          isLoading={createPlan.isPending}
        />
      </div>
    </div>
  )
}
