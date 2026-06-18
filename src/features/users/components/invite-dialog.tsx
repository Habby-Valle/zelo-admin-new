"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { sendInviteSchema, type SendInviteValues } from "@/lib/validations/invite"
import { useSendInvite } from "@/features/users/hooks"
import { useClinics } from "@/features/clinics/hooks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ROLE_LABELS: Record<string, string> = {
  clinic_admin: "Admin de Clínica",
  guardian: "Responsável",
  caregiver: "Cuidador",
  family: "Familiar",
}

interface InviteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteDialog({ open, onOpenChange }: InviteDialogProps) {
  const sendInvite = useSendInvite()
  const { data: clinicsData } = useClinics({ status: "active", pageSize: 100 })
  const clinics = clinicsData?.results ?? []

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SendInviteValues>({
    resolver: zodResolver(sendInviteSchema),
    defaultValues: { email: "", role: "clinic_admin", clinic_id: null },
  })

  const role = watch("role")

  useEffect(() => {
    if (open) reset({ email: "", role: "clinic_admin", clinic_id: null })
  }, [open, reset])

  function onSubmit(values: SendInviteValues) {
    sendInvite.mutate(
      {
        email: values.email,
        role: values.role,
        clinic_id: values.clinic_id ?? null,
      },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  const needsClinic = [
    "clinic_admin",
    "guardian",
    "caregiver",
    "family",
  ].includes(role)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convidar usuário</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {sendInvite.error && (
            <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {sendInvite.error.message}
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="nome@exemplo.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Perfil *</Label>
            <Select
              value={role}
              onValueChange={(v) =>
                setValue("role", v as SendInviteValues["role"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-xs text-destructive">{errors.role.message}</p>
            )}
          </div>

          {needsClinic && (
            <div className="space-y-1.5">
              <Label>Clínica vinculada</Label>
              <Select
                value={
                  watch("clinic_id") != null ? String(watch("clinic_id")) : ""
                }
                onValueChange={(v) =>
                  setValue("clinic_id", v ? parseInt(v, 10) : null, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar clínica..." />
                </SelectTrigger>
                <SelectContent>
                  {clinics.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={sendInvite.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={sendInvite.isPending}>
              {sendInvite.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Enviar convite
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
