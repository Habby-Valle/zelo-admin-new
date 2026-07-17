"use client";

import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { patientSchema, type PatientFormValues } from "@/lib/validations/patient";
import { useClinics } from "@/features/clinics/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PatientFormProps {
  defaultValues?: Partial<PatientFormValues>;
  onSubmit: (values: PatientFormValues) => void;
  isPending?: boolean;
  error?: string | null;
  submitLabel?: string;
}

const GENDER_LABELS: Record<string, string> = { M: "Masculino", F: "Feminino", O: "Outro" };

export function PatientForm({
  defaultValues,
  onSubmit,
  isPending,
  error,
  submitLabel = "Salvar",
}: PatientFormProps) {
  const { data: clinicsData } = useClinics({ status: "active", pageSize: 100 });
  const clinics = clinicsData?.results ?? [];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema) as unknown as Resolver<PatientFormValues>,
    defaultValues: {
      name: "",
      birth_date: "",
      gender: undefined,
      cpf: null,
      phone: "",
      clinic_id: null,
      media_id: null,
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome completo *</Label>
          <Input id="name" placeholder="Nome do paciente" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="birth_date">Data de nascimento *</Label>
          <Input id="birth_date" type="date" {...register("birth_date")} />
          {errors.birth_date && (
            <p className="text-xs text-destructive">{errors.birth_date.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Sexo *</Label>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue>
                    {field.value ? (GENDER_LABELS[field.value] ?? field.value) : "Selecionar..."}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(GENDER_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.gender && <p className="text-xs text-destructive">{errors.gender.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cpf">CPF</Label>
          <Input id="cpf" placeholder="000.000.000-00" {...register("cpf")} />
          {errors.cpf && <p className="text-xs text-destructive">{errors.cpf.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Telefone *</Label>
          <Input id="phone" placeholder="(11) 99999-9999" {...register("phone")} />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Clínica</Label>
          <Controller
            name="clinic_id"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ?? "none"}
                onValueChange={(v) =>
                  field.onChange(v === "none" || v === null ? null : v)
                }
              >
                <SelectTrigger>
                  <SelectValue>
                    {field.value != null
                      ? (clinics.find((c) => c.id === field.value)?.name ??
                        `#${field.value}`)
                      : "Selecionar clínica..."}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {clinics.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
