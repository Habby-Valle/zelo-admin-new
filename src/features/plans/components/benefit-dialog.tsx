"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { benefitSchema, type BenefitFormValues } from "@/lib/validations/plan"
import type { PlanBenefit } from "@/features/plans/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCreateBenefit, useUpdateBenefit } from "@/features/plans/hooks"

interface BenefitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  benefit?: PlanBenefit | null
}

export function BenefitDialog({
  open,
  onOpenChange,
  benefit,
}: BenefitDialogProps) {
  const isEditing = !!benefit
  const createBenefit = useCreateBenefit()
  const updateBenefit = useUpdateBenefit()
  const isPending = createBenefit.isPending || updateBenefit.isPending

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BenefitFormValues>({
    resolver: zodResolver(benefitSchema),
    defaultValues: { key: "", label: "", description: "" },
  })

  useEffect(() => {
    if (open) {
      reset({
        key: benefit?.key ?? "",
        label: benefit?.label ?? "",
        description: benefit?.description ?? "",
      })
    }
  }, [open, benefit, reset])

  function onSubmit(values: BenefitFormValues) {
    if (isEditing && benefit) {
      updateBenefit.mutate(
        { id: benefit.id, data: values },
        { onSuccess: () => onOpenChange(false) }
      )
    } else {
      createBenefit.mutate(values, {
        onSuccess: () => onOpenChange(false),
      })
    }
  }

  const mutationError = createBenefit.error || updateBenefit.error

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar benefício" : "Novo benefício"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {mutationError && (
            <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {mutationError.message}
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="key">Chave *</Label>
            <Input id="key" placeholder="ex: consultas_ilimitadas" {...register("key")} disabled={isEditing} />
            {errors.key && <p className="text-xs text-destructive">{errors.key.message}</p>}
            <p className="text-xs text-muted-foreground">
              Identificador único. Apenas letras minúsculas, números e _.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="label">Rótulo *</Label>
            <Input id="label" placeholder="ex: Consultas ilimitadas" {...register("label")} />
            {errors.label && <p className="text-xs text-destructive">{errors.label.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" placeholder="Detalhe o benefício..." rows={2} {...register("description")} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
