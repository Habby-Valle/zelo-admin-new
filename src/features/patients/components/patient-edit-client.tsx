"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { usePatient, useUpdatePatient } from "@/features/patients/hooks";
import { PatientForm } from "@/features/patients/components/patient-form";
import type { PatientFormValues } from "@/lib/validations/patient";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export function PatientEditClient({ id }: { id: string }) {
  const router = useRouter();
  const { data: patient, isLoading, isError } = usePatient(id);
  const updatePatient = useUpdatePatient();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-7 w-48" />
        </div>
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-muted-foreground">Paciente não encontrado.</p>
        <Button onClick={() => router.push("/patients")}>Voltar</Button>
      </div>
    );
  }

  function onSubmit(values: PatientFormValues) {
    const body = { ...values, email: values.email || null, cpf: values.cpf || null };
    updatePatient.mutate(
      { id, data: body },
      {
        onSuccess: () => {
          toast.success("Paciente atualizado com sucesso");
          router.push(`/patients/${id}`);
        },
      }
    );
  }

  const defaultValues: Partial<PatientFormValues> = {
    name: patient.name,
    birth_date: patient.birth_date,
    gender: patient.gender,
    cpf: patient.cpf,
    phone: patient.phone,
    email: patient.email,
    clinic_id: patient.clinic_id ?? null,
    blood_type: patient.blood_type,
    health_conditions: patient.health_conditions,
    allergies: patient.allergies,
    medications: patient.medications,
    observations: patient.observations,
    media_id: patient.media_id ?? null,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/patients/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar Paciente</h1>
          <p className="mt-1 text-muted-foreground">{patient.name}</p>
        </div>
      </div>

      <PatientForm
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        isPending={updatePatient.isPending}
        error={updatePatient.error?.message ?? null}
        submitLabel="Salvar alterações"
      />
    </div>
  );
}
