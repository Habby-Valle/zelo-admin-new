"use client"

import { useState } from "react"
import { useRouter, notFound } from "next/navigation"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Building2,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { usePlan, useDeletePlan, useTogglePlanActive } from "@/features/plans/hooks"
import { formatCurrency } from "@/lib/format"

interface PlanDetailClientProps {
  id: string
}

export default function PlanDetailClient({ id }: PlanDetailClientProps) {
  const router = useRouter()
  const { data: plan, isLoading, isError } = usePlan(id)
  const deletePlan = useDeletePlan()
  const toggleActive = useTogglePlanActive()
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-md" />
          <div className="space-y-1">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-40 rounded-lg" />
      </div>
    )
  }

  if (isError || !plan) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/plans")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{plan.name}</h1>
              <Badge variant={plan.is_active ? "default" : "secondary"}>
                {plan.is_active ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            {plan.description && (
              <p className="mt-1 text-muted-foreground">{plan.description}</p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toggleActive.mutate({ id, isActive: !plan.is_active })
            }
            disabled={toggleActive.isPending}
          >
            {toggleActive.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : plan.is_active ? (
              <ToggleLeft className="mr-2 h-4 w-4" />
            ) : (
              <ToggleRight className="mr-2 h-4 w-4" />
            )}
            {plan.is_active ? "Desativar" : "Ativar"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/plans/${id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Preço mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(plan.monthly_price)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Preço anual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {plan.yearly_price != null ? formatCurrency(plan.yearly_price) : "—"}
            </p>
            {plan.yearly_price != null && (
              <p className="text-xs text-muted-foreground">
                {formatCurrency(plan.yearly_price / 12)}/mês
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clínicas ativas
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <p className="text-2xl font-bold">{plan.clinics_count ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Benefícios</CardTitle>
        </CardHeader>
        <CardContent>
          {plan.benefits.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum benefício configurado neste plano.
            </p>
          ) : (
            <div className="space-y-0">
              {plan.benefits.map((b, i) => (
                <div key={b.id}>
                  {i > 0 && <Separator className="my-3" />}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                      <span className="text-sm font-medium">
                        {b.benefit_label}
                      </span>
                      <code className="rounded bg-muted px-1 py-0.5 text-xs text-muted-foreground">
                        {b.benefit_key}
                      </code>
                    </div>
                    <Badge
                      variant="outline"
                      className="shrink-0 font-mono text-xs"
                    >
                      {b.value}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meta */}
      <div className="flex items-center gap-6 text-xs text-muted-foreground">
        <span>
          Criado em {new Date(plan.created_at).toLocaleDateString("pt-BR")}
        </span>
        <span>
          Atualizado em {new Date(plan.updated_at).toLocaleDateString("pt-BR")}
        </span>
      </div>

      {/* Delete dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir plano</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{plan.name}</strong>? Esta
              ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={deletePlan.isPending}
              onClick={() =>
                deletePlan.mutate(id, {
                  onSuccess: () => router.push("/plans"),
                })
              }
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            >
              {deletePlan.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
