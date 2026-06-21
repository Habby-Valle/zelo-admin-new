"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

import { createShiftSchema, type CreateShiftInput } from "@/lib/validations/shift";
import { useCreateShift, useUpdateShift } from "@/features/shifts/hooks";
import { useClinics } from "@/features/clinics/hooks";
import { useUsers } from "@/features/users/hooks";
import type { ShiftDetail } from "@/features/shifts/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ShiftFormProps {
  shift?: ShiftDetail;
}

export function ShiftForm({ shift }: ShiftFormProps) {
  const router = useRouter();
  const isEdit = !!shift;

  const { data: clinicsData } = useClinics({ pageSize: 999 });
  const { data: usersData } = useUsers({ role: "caregiver", pageSize: 999 });

  const clinics = clinicsData?.results ?? [];
  const caregivers = usersData?.users ?? [];

  const createShift = useCreateShift();
  const updateShift = useUpdateShift(shift?.id ?? 0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateShiftInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createShiftSchema) as any,
    defaultValues: shift
      ? {
          caregiver_id: shift.caregiver_id,
          clinic_id: shift.clinic_id ?? undefined,
          start: shift.start.slice(0, 16),
          end: shift.end.slice(0, 16),
          notes: shift.notes ?? "",
        }
      : { notes: "" },
  });

  const watchedCaregiver = watch("caregiver_id");
  const watchedClinic = watch("clinic_id");

  const onSubmit = async (data: CreateShiftInput) => {
    const body: Record<string, unknown> = {
      caregiver_id: data.caregiver_id,
      start: data.start,
      end: data.end,
      notes: data.notes ?? "",
    };
    if (data.clinic_id) body.clinic_id = data.clinic_id;

    try {
      if (isEdit) {
        await updateShift.mutateAsync(body as Parameters<typeof updateShift.mutateAsync>[0]);
        toast.success("Turno atualizado com sucesso.");
        router.push(`/shifts/${shift!.id}`);
      } else {
        const created = await createShift.mutateAsync(
          body as Parameters<typeof createShift.mutateAsync>[0]
        );
        toast.success("Turno criado com sucesso.");
        router.push(`/shifts/${created.id}`);
      }
    } catch {
      toast.error("Erro ao salvar turno.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Cuidador *</Label>
          <Select
            value={watchedCaregiver ? String(watchedCaregiver) : ""}
            onValueChange={(v) => setValue("caregiver_id", Number(v))}
          >
            <SelectTrigger>
              <SelectValue>
                {watchedCaregiver
                  ? caregivers.find((c) => String(c.id) === String(watchedCaregiver))?.name ??
                    String(watchedCaregiver)
                  : "Selecione o cuidador"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {caregivers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.caregiver_id && (
            <p className="text-sm text-destructive">{errors.caregiver_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Clínica</Label>
          <Select
            value={watchedClinic ? String(watchedClinic) : "none"}
            onValueChange={(v) => setValue("clinic_id", v === "none" ? undefined : Number(v))}
          >
            <SelectTrigger>
              <SelectValue>
                {watchedClinic
                  ? clinics.find((c) => c.id === watchedClinic)?.name ?? String(watchedClinic)
                  : "Selecione a clínica"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma</SelectItem>
              {clinics.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Início *</Label>
          <Input type="datetime-local" {...register("start")} />
          {errors.start && <p className="text-sm text-destructive">{errors.start.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Fim *</Label>
          <Input type="datetime-local" {...register("end")} />
          {errors.end && <p className="text-sm text-destructive">{errors.end.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Observações</Label>
        <Textarea {...register("notes")} placeholder="Observações sobre o turno..." rows={3} />
      </div>

      {!isEdit && (
        <div className="space-y-2">
          <Label>Pacientes</Label>
          <p className="text-sm text-muted-foreground">
            Você pode adicionar pacientes após criar o turno.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar turno"}
        </Button>
        <Link
          href={isEdit ? `/shifts/${shift!.id}` : "/shifts"}
          className={buttonVariants({ variant: "outline" })}
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
